import { HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable, throwError } from 'rxjs';
import { catchError, switchMap, take, tap } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout-wrapper-sdk-types';
import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { ApiService, SettingsService, StatusUpdaterService } from '../../services/';
import {
  ActionTypeUIEnum,
  ActionInterface,
  ActionMapInterface,
  ActionTypeEnum,
  DetailInterface,
  UIActionInterface,
} from '../../shared';

import { DetailService } from './detail.service';

export const MAX_MAIN = 3;

@Injectable()
export class ActionsListService {
  orderId: string = null;

  private businessId: string = null;
  private actionsSubject$ = new BehaviorSubject<ActionInterface[]>([]);
  readonly actions$ = this.actionsSubject$.asObservable();

  constructor(
    private apiService: ApiService,
    private domSanitizer: DomSanitizer,
    private detailService: DetailService,
    private router: Router,
    private settingsService: SettingsService,
    private translateService: TranslateService,
    private snackbarService: SnackbarService,
    private statusUpdaterService: StatusUpdaterService,
    private envService: EnvService,
    private confirmScreenService: ConfirmScreenService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
    this.businessId = this.envService.businessId;
  }

  set actions(actionsArr: ActionInterface[]) {
    this.actionsSubject$.next(actionsArr);
  }

  actionsMapper(actionsArr: ActionInterface[], order: DetailInterface): ActionMapInterface {
    const mainActions: UIActionInterface[] = [];
    const optionalActions: UIActionInterface[] = [];
    let actions: UIActionInterface[] = [];
    let mainIndex = 1;

    actionsArr?.forEach(action => {
      actions = action.isOptional ? optionalActions : mainActions;
      const actionData: UIActionInterface = {
        type: ActionTypeUIEnum.Button,
        icon: this.getCDNIcon(action.action, 'icons-transactions/more', (!action.isOptional && mainIndex <= MAX_MAIN)),
        class: action.action,
        labelTranslated: action.label,
        onClick: () => {
          this.onClickOrderAction(action.action);
        },
      };

      switch (action.action) {
        case ActionTypeEnum.ShippingGoods: {
          if (order.transaction.example) {
            actions.push({
              ...actionData,
              onClick: () => {
                this.shippingGoodsClick(action, order);
              },
            });
          } else {
            actions.push(actionData);
          }
          break;
        }
        case ActionTypeEnum.SendSigningLink: {
          actions.push({
            ...actionData,
            onClick: () => {
              this.onSendSigningLinkAction(order);
            },
          });
          break;
        }
        case ActionTypeEnum.UpdateStatus: {
          actions.push({
            ...actionData,
            onClick: () => {
              this.onClickCheckStatusAction(order);
            },
          });
          break;
        }
        case ActionTypeEnum.MarkPaid: {
          actions.push({
            ...actionData,
            onClick: () => {
              this.onClickMarkPaidAction(order);
            },
          });
          break;
        }
        case ActionTypeEnum.DownloadContract: {
          actions.push(this.prepareDownloadContract(actionData, order));
          break;
        }
        default: {
          actions.push(actionData);
        }
      }

      if (!action.isOptional) {
        mainIndex++;
      }
    });

    return { mainActions, optionalActions };
  }

  getCDNIcon(icon: string, folder = 'icons-transactions', isMain = false): string {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/${folder}/${icon}${isMain ? '-w' : ''}.svg`) as string;
  }

  showError(error: any): void {
    this.snackbarService.toggle(true, {
      content: error?.message || 'Unknown_error',
      duration: 3000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }

  onClickOrderAction(action: ActionTypeEnum): void {
    if (action) {
      this.router.navigate([
        ...this.settingsService.baseUrl,
        { outlets: { details: ['details', this.orderId, { outlets: { actions: [action, this.orderId] } }] } },
      ], {
        queryParamsHandling: 'merge',
        skipLocationChange: true,
      });
    }
  }

  private onClickMarkPaidAction(order:DetailInterface) {
    const headings: Headings = {
      title: this.translateService.translate('transactions.form.mark_paid.headings.title'),
      subtitle: this.translateService.translate('transactions.form.mark_paid.headings.subtitle'),
      confirmBtnText: this.translateService.translate('transactions.form.mark_paid.headings.confirm'),
      declineBtnText: this.translateService.translate('transactions.form.mark_paid.headings.decline'),
    };
    const confirmObservable: Observable<boolean> = this.confirmScreenService.show(headings, true);
    confirmObservable.pipe(
      take(1),
      switchMap(confirmation => {
        const request$ = this.apiService.postAction(this.settingsService.businessUuid, this.orderId, ActionTypeEnum.MarkPaid, {}).pipe(
          switchMap((data: DetailInterface) => this.updateData(order, data)),

          catchError((error) => {
            error.message = this.getActionMessageError(ActionTypeEnum.MarkPaid);
            this.showError(error);
            this.statusUpdaterService.triggerUpdateStatus([order.transaction.uuid]);

            return throwError(error);
          })
        );

        return confirmation ? request$ : EMPTY;
      })
    ).subscribe();
  }

  private shippingGoodsClick(action: ActionInterface, order:DetailInterface ): void {
    if (order.shipping.example_label) {
      this.onClickOrderAction(action.action);
    } else {
      this.detailService.loading = true;
      this.detailService.actionOrder(
        this.orderId, {}, ActionTypeEnum.ShippingGoods, 'payment_shipping_goods', true
      ).subscribe(
        () => {
          this.onClickOrderAction(action.action);
          this.detailService.loading = false;
        },
        () => {
          this.detailService.loading = false;
        }
      );
    }
  }

  private getActionMessageError(action: ActionTypeEnum): string {
    return this.translateService.hasTranslation(`transactions.action-errors.${action}`)
      ? this.translateService.translate(`transactions.action-errors.${action}`)
      : this.translateService.translate('transactions.errors.unknown');
  }

  private prepareDownloadContract(actionData: UIActionInterface, order: DetailInterface): UIActionInterface {
    let action: UIActionInterface = actionData;
    if (order.payment_option.type === PaymentMethodEnum.SANTANDER_POS_INSTALLMENT) {
      action = {
        ...action,
        type: ActionTypeUIEnum.LinkWithCallback,
        onClick: () => {
          this.detailService.getData(this.orderId, true).subscribe();
          this.statusUpdaterService.triggerUpdateStatus([this.orderId]);
        },
        showConfirm: true,
        confirmHeadings: {
          title: this.translateService.translate('transactions.details.actions.confirmation.contract.title'),
          subtitle: this.translateService.translate('transactions.details.actions.confirmation.contract.subtitle'),
          confirmBtnText: this.translateService.translate('transactions.details.actions.confirmation.contract.confirmBtnText'),
          declineBtnText: this.translateService.translate('transactions.details.actions.confirmation.contract.declineBtnText'),
        },
        href: this.settingsService.contractUrl[order.payment_option.type](this.businessId, order.transaction.original_id),
        errorMessage: this.translateService.translate('transactions.action-errors.contract'),
      };
    } else {
      action = {
        ...action,
        type: ActionTypeUIEnum.Link,
        href: this.settingsService.contractUrl[order.payment_option.type](this.businessId, order.transaction.original_id),
      };
    }

    return action;
  }

  private onSendSigningLinkAction(order: DetailInterface): void {
    this.apiService.postAction(this.settingsService.businessUuid, this.orderId, ActionTypeEnum.SendSigningLink, {}).pipe(
      switchMap((data: DetailInterface) => this.updateData(order, data)),
      catchError((error) => {
        error.message = this.getActionMessageError(ActionTypeEnum.SendSigningLink);
        this.showError(error);

        return throwError(error);
      })
    ).subscribe();
  }

  private updateData(order: DetailInterface, data: DetailInterface): Observable<DetailInterface> {
    return this.detailService.getData(this.orderId, true).pipe(
      tap((detail: DetailInterface) => {
        order = { ...detail, actions: data.actions };
        this.statusUpdaterService.triggerUpdateStatus([order.transaction.uuid]);
      }),
    );
  }

  private onClickCheckStatusAction(order: DetailInterface): void {
    this.apiService.checkSantanderStatus(this.orderId)
      .subscribe({
        next: () => {
          this.statusUpdaterService.triggerUpdateStatus([order.transaction.uuid]);
        },
        error: (error: HttpErrorResponse) => {
          this.showError(error.error);
        },
      });
  }
}
