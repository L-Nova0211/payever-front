import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isEqual, cloneDeep, omit } from 'lodash-es';
import { takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService, PeDestroyService } from '@pe/common';

import { TransactionsListService } from '../../../services/list.service';
import { SettingsService } from '../../../services/settings.service';
import { StatusUpdaterService } from '../../../services/status-updater.service';
import { DetailInterface } from '../../../shared';
import { TransactionDetailsSections } from '../../../shared/enums/transaction.enum';
import {
  BillingSectionComponent,
  DetailsSectionComponent,
  OrderSectionComponent,
  PaymentSectionComponent,
  ProductsSectionComponent,
  SellerSectionComponent,
  ShippingSectionComponent,
  TimelineSectionComponent } from '../../components/sections';
import { DetailService } from '../../services/detail.service';
import { SectionsService } from '../../services/sections.service';

@Component({
  selector: 'pe-transactions-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  providers: [
    PeDestroyService,
  ],
})

export class TransactionsDetailsComponent implements OnInit {
  theme = this.envService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  get activeSection(): TransactionDetailsSections {
    return this.sectionsService.activeSection
  }

  get orderId(): string {
    return this.route.snapshot.params?.uuid;
  }

  get order(): DetailInterface {
    return this.detailService.orderData;
  }

  readonly sectionComponents = {
    products: ProductsSectionComponent,
    order: OrderSectionComponent,
    shipping: ShippingSectionComponent,
    billing: BillingSectionComponent,
    payment: PaymentSectionComponent,
    seller: SellerSectionComponent,
    timeline: TimelineSectionComponent,
    details: DetailsSectionComponent,
  };

  constructor(
    public sectionsService: SectionsService,
    private destroy$: PeDestroyService,
    private route: ActivatedRoute,
    private router: Router,
    private envService: EnvService,
    public detailService: DetailService,
    private listService: TransactionsListService,
    private settingsService: SettingsService,
    private statusUpdaterService: StatusUpdaterService,
  ) {
  }

  ngOnInit(): void {
    this.getData(true);
  }

  getData(reset = false): void {
    this.detailService.getData(this.orderId, reset).pipe(
      tap(() => {
        this.statusUpdaterService.triggerUpdateStatus([this.order.transaction.uuid]);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  onRefresh(): void {
    this.getData(true);
    this.listService.loadTransactionsTrigger$.next(true);
  }

  navigateToList(): void {
    let url = ['business', this.envService.businessId, 'transactions', 'list', { outlets: { details: null } }];

    if (this.settingsService.isPersonal) {
      url = ['personal', this.settingsService.userId, 'transactions', 'list', { outlets: { details: null } }];
    }

    this.router.navigate(url, { queryParamsHandling: 'merge' });
  }

  close(): void {
    this.sectionsService.reset();
    this.navigateToList();
  }

  done(): void {
    this.sectionsService.reset();
    this.navigateToList();
  }

  setStep(step: TransactionDetailsSections): void {
    this.sectionsService.activeSection = step;
  }

  removeStep(section: TransactionDetailsSections): void {
    if (this.sectionsService.activeSection === section) {
      this.sectionsService.activeSection = null;
    }
  }

  isShipping(): boolean {
    let isShipping = false;
    if (this.order?.shipping?.address) {
      let shippingAddress = omit(cloneDeep(this.order.shipping.address), ['id', '_id']);
      let billingAddress = omit(cloneDeep(this.order.billing_address), ['id', '_id', 'email']);

      isShipping = !isEqual(shippingAddress, billingAddress);
    }

    return isShipping;
  }

  isSectionShow(sectionKey: string): boolean {
    const conditions  = {
      products: () => {
        return this.order?.cart?.items?.length
      },
      shipping: () => {
        return this.isShipping();
      },
      seller: () => {
        return !!this.order?.seller?.name || !!this.order?.seller?.email;
      },
    }

    if (conditions[sectionKey]) {
      return conditions[sectionKey]();
    } else {
      return true;
    }
  }
}
