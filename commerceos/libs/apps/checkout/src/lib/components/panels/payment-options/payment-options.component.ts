import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import {
  CheckoutConnectionInterface,
  InstalledConnectionInterface,
  IntegrationCategory,
  IntegrationInfoInterface,
  IntegrationWithConnectionInterface,
} from '../../../interfaces';
import { AbstractPanelComponent } from '../abstract-panel.component';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'panel-payment-options',
  templateUrl: './payment-options.component.html',
  styleUrls: ['./payment-options.component.scss', '../page-container.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PanelPaymentOptionsComponent extends AbstractPanelComponent {

  payments$: Observable<IntegrationInfoInterface[]> = null;
  connections$: Observable<CheckoutConnectionInterface[]> = null;
  installedConnections$: Observable<InstalledConnectionInterface[]> = null;

  paymentsReady$ = new BehaviorSubject(false);
  connectionsReady$ = new BehaviorSubject(false);
  installedConnectionsReady$ = new BehaviorSubject(false);

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.payments$ = this.storageService.getCategoryInstalledIntegrationsInfo(IntegrationCategory.Payments, true)
      .pipe(filter(d => !!d), takeUntil(this.destroyed$));
    this.connections$ = this.storageService.getBusinessConnections(true)
      .pipe(filter(d => !!d), takeUntil(this.destroyed$));
    this.installedConnections$ = this.storageService.getInstalledCheckoutConnections(this.checkoutUuid, true)
      .pipe(filter(d => !!d), takeUntil(this.destroyed$));

    this.payments$.subscribe((a) => {
      this.paymentsReady$.next(true);
    });
    this.connections$.subscribe((a) => {
      this.connectionsReady$.next(true);
    });
    this.installedConnections$.subscribe((a) => {
      this.installedConnectionsReady$.next(true);
    });
  }

  onToggleIntegrationConnection(data: IntegrationWithConnectionInterface) {
    this.installedConnections$.pipe(
      takeUntil(this.destroyed$),
      filter(d => !!d),
      take(1)
    ).subscribe((installed) => {
      this.storageService.toggleCheckoutConnection(
        this.checkoutUuid,
        data.connection._id,
        installed.map(ins => ins._id).indexOf(data.connection._id) < 0
      ).subscribe(() => {
        this.onUpdateData();
      }, (err) => {
        this.storageService.showError(err);
      });
    });
  }
}
