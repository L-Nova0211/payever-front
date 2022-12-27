import { Component, ChangeDetectionStrategy, OnInit, Injector, Inject } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { FlowInterface } from '@pe/checkout-wrapper-sdk-types';
import { CheckoutMicroService, EnvironmentConfigInterface as EnvInterface, PeDestroyService, PE_ENV } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { AddressInterface } from '@pe/forms-core';

import { ApiService } from '../../../../services/api.service';
import { AbstractAction, ActionTypeEnum, DetailInterface } from '../../../../shared';
import { DetailService } from '../../../services/detail.service';

enum EditActionEnum {
  CancelSigningRequest = 'cancel-signing-request',
  RemoveSignedStatus = 'remove-signed-status'
}

export interface FlowDataInterface extends FlowInterface {
  connectionId?: string;
}

@Component({
  selector: 'pe-action-edit',
  templateUrl: 'edit.component.html',
  styles: [`
    .loader-wrapper {
      min-height: 320px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionEditComponent extends AbstractAction implements OnInit {

  error: string = null;
  order: DetailInterface = {} as any;

  viewConfig: any = {
    showCloseIcon: false,
    closeOnBackdrop: false,
    closeOnEsc: false,
    classes: {
      modalDialog: 'col-lg-8 col-md-8 col-sm-10 col-xs-12',
      modalBody: 'zero-padding',
    },
  };

  isLoadingMicro$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  billingAddress: AddressInterface = null;
  flowId: string = null;
  transactionId: string = null;
  isShowConfirmation = true;
  flow: FlowDataInterface = null;
  isClose = false;

  readonly isEditAble$ = new BehaviorSubject<boolean>(false);
  readonly bootstrapScriptUrl$ = this.checkoutMicroService.microUrl$;
  readonly defaultParams = {
    editMode: true,
    embeddedMode: true,
    forceNoScroll: true,
    forceNoPaddings: true,
    forceNoCloseButton: true,
  };

  constructor(
    public injector: Injector,
    @Inject(PE_ENV) private env: EnvInterface,
    private destroyed$: PeDestroyService,
    private confirmScreenService: ConfirmScreenService,
    public detailService: DetailService,
    private apiService: ApiService,
    private checkoutMicroService: CheckoutMicroService,
  ) {
    super(injector);
  }

  get confirmHeadings(): Headings {
    const translationsScope = 'transactions.details.actions.confirmation';

    return this.isFlowB() ? {
      title: this.translateService.translate(`${translationsScope}.cancelSignature.title`),
      subtitle: this.translateService.translate(`${translationsScope}.cancelSignature.subtitle`),
      confirmBtnText: this.translateService.translate(`${translationsScope}.cancelSignature.confirmBtnText`),
      declineBtnText: this.translateService.translate(`${translationsScope}.cancelSignature.declineBtnText`),
    } : {
      title: this.translateService.translate(`${translationsScope}.overwriteContract.title`),
      subtitle: this.translateService.translate(`${translationsScope}.overwriteContract.subtitle`),
      confirmBtnText: this.translateService.translate(`${translationsScope}.overwriteContract.confirmBtnText`),
      declineBtnText: this.translateService.translate(`${translationsScope}.overwriteContract.declineBtnText`),
    };
  }

  set cancelSigningRequest(val: boolean) {
    this.setStorageAction(ActionTypeEnum.Edit, {
      cancelSigningRequest: val,
    });
  }

  get cancelSigningRequest(): boolean {
    return this.getStorageAction(ActionTypeEnum.Edit)?.cancelSigningRequest ?? true;
  }

  ngOnInit(): void {
    this.getData();
  }

  close() {
    super.close();

    if (this.isEditAble$.value) {
      this.isClose = true;
      this.getData(true);
      this.refreshList();
    }
  }

  createForm(): void {
    if (this.isClose) {
      return;
    }

    this.isLoadingMicro$.next(true);
    this.flowId = this.order.payment_flow.id;
    this.transactionId = this.order.transaction.uuid;
    this.billingAddress = this.order.billing_address;
    this.checkFlow();
    this.cdr.detectChanges();
  }

  onLayoutShown(): void {
    timer(300).pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.isLoadingMicro$.next(false);
    });
  }

  private getFlowData(): void {
    this.apiService.getCheckoutFlow(this.flowId).subscribe({
      next: (flowData: FlowInterface) => {
        this.flow = flowData;
        this.showConfirmation();
      },
      error: (err) => {
        this.close();
        err.message = this.translateService.translate('transactions.action-errors.edit');
        this.showError(err);
      },
    });
  }

  private checkFlow() {
    if (this.isFlowA()) {
      this.isEditAble$.next(true);

      return;
    }

    if (this.isFlowB() || this.isFlowC()) {
      this.getFlowData();
    }
  }

  private showConfirmation(): void {
    if (!this.isShowConfirmation) {
      this.isEditAble$.next(true);

      return;
    }

    this.confirmScreenService.show(this.confirmHeadings, true).pipe(
      tap((confirm: boolean) => {
        if (!confirm) {
          this.close();

          return;
        }
        this.isShowConfirmation = false;
        this.sendEditAction();
      })
    ).subscribe();
  }

  private sendEditAction(): void {
    const action: any = this.isFlowB()
      ? EditActionEnum.CancelSigningRequest
      : EditActionEnum.RemoveSignedStatus;


    this.apiService.postPaymentAction(action, this.flow.connectionId, this.order.transaction.uuid)
      .subscribe(
        () => {
          this.getData(true);
          this.isEditAble$.next(true);

          this.cancelSigningRequest = true;
        },
        (error) => {
          this.changeCancelSigningRequest(action, false);
          this.close();
          error.message = this.translateService.translate(`transactions.action-errors.${action}`);
          this.showError(error);
        }
      );
  }

  private changeCancelSigningRequest(action: EditActionEnum, val: boolean) {
    if (action == EditActionEnum.CancelSigningRequest) {
      this.cancelSigningRequest = val;
    }
  }

  private isFlowA(): boolean {
    return !this.order.details?.is_customer_signing_triggered
      && !this.order.details?.is_guarantor_signing_triggered
      && !this.order.details?.is_fully_signed;
  }

  private isFlowB(): boolean {
    return this.cancelSigningRequest &&
      (this.order.details?.is_customer_signing_triggered || this.order.details?.is_guarantor_signing_triggered)
      && !this.order?.details.is_fully_signed;
  }

  private isFlowC(): boolean {
    return !this.cancelSigningRequest || (
      (this.order.details?.is_customer_signing_triggered || this.order.details?.is_guarantor_signing_triggered)
      && this.order.details?.is_fully_signed
    ) || (
        (this.order.details?.customer_signed || this.order.details?.guarantor_signed)
        && this.order.details?.is_fully_signed
      );
  }
}
