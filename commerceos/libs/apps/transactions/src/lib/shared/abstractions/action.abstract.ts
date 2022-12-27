import { ChangeDetectorRef, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

import { DetailService } from '../../details/services/detail.service';
import { TransactionsListService } from '../../services/list.service';
import { StatusUpdaterService } from '../../services/status-updater.service';
import { ActionTypeEnum, BodyDataInterface } from '../interfaces';
import { ActionInterface, ActionRequestInterface, DetailInterface } from '../interfaces/detail.interface';

export abstract class AbstractAction {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  protected route = this.injector.get(ActivatedRoute);
  protected snackbarService = this.injector.get(SnackbarService);
  protected detailService = this.injector.get(DetailService);
  protected destroy$ = this.injector.get(PeDestroyService);
  protected listService = this.injector.get(TransactionsListService);
  protected envService = this.injector.get(EnvService);
  protected router = this.injector.get(Router);
  protected statusUpdaterService =  this.injector.get(StatusUpdaterService);
  protected cdr =  this.injector.get(ChangeDetectorRef);
  protected translateService =  this.injector.get(TranslateService);

  readonly theme = this.envService.businessData?.themeSettings?.theme ?
  AppThemeEnum[this.envService.businessData.themeSettings.theme] :
  AppThemeEnum.default;

  order: DetailInterface;
  private orderSubject$ = new ReplaySubject<DetailInterface>(1);
  protected order$ = this.orderSubject$.pipe(
    shareReplay(1),
  );

  constructor(protected injector: Injector) {}

  get businessId(): string {
    return this.envService.businessId;
  }

  get orderId() {
    return this.route.snapshot.params.uuid;
  }

  setStorageAction(action: ActionTypeEnum, data: any ): void {
    localStorage.setItem(`pe.transactions.${this.businessId}.${this.orderId}.action.${action}`, JSON.stringify(data));
  }

  getStorageAction(action: ActionTypeEnum): any {
    return JSON.parse(localStorage.getItem(`pe.transactions.${this.businessId}.${this.orderId}.action.${action}`));
  }

  abstract createForm(): void;

  close(): void {
    this.navigateToDetails(this.orderId);
  }

  done(): void {
    this.navigateToDetails(this.orderId);
  }

  getData(reset = false): void {
    this.isLoading$.next(true);
    this.detailService.getData(this.orderId, reset).pipe(
      tap({
        next: (order: DetailInterface): void => {
          this.order = order;
          this.orderSubject$.next(order);
          this.listService.updateItemColumns(order);
          this.createForm();
          this.cdr.detectChanges();
        },
        complete: () => this.isLoading$.next(false),
      }),
    ).subscribe();
  }

  getActionData(action: ActionTypeEnum): ActionInterface {
    return this.order.actions.find(item => item.action === action);
  }

  refreshList(): void {
    this.statusUpdaterService.triggerUpdateStatus([this.order.transaction.uuid]);
  }

  showError(error): void {
    this.snackbarService.toggle(true, {
      content: error?.message,
    });
  }

  protected sendAction(
    data: ActionRequestInterface,
    action: ActionTypeEnum,
    dataKey: string,
    serialize: boolean = false,
    bodyData?: BodyDataInterface,
  ): void {
    this.isLoading$.next(true);
    this.detailService.actionOrder(
      this.orderId,
      data,
      action,
      dataKey,
      serialize,
      bodyData
    ).subscribe(
      () => {
        this.isLoading$.next(false);
        this.close();
        this.getData(true);
        this.refreshList();
      },
      (error) => {
        this.isLoading$.next(false);
        this.showError(error);
      }
    );
  }

  private navigateToDetails(orderId: string) {
    const url = ['business', this.envService.businessId, 'transactions', 'list', { outlets: { details: ['details', orderId] } }];
    this.router.navigate(url, {
      queryParamsHandling: 'merge',
      skipLocationChange: true,
    });
  }
}
