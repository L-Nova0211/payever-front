import { Injector, OnDestroy, Directive, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { PeDataGridSidebarService } from '@pe/data-grid';
import { TranslateService } from '@pe/i18n';

import {
  IntegrationCategory,
  UserBusinessInterface,
  IntegrationInfoWithStatusInterface,
} from '../interfaces';
import { PaymentsStateService, IntegrationsStateService, NavigationService } from '../services';

@Directive()
export abstract class BaseListComponent implements OnDestroy {

  openingIntegration$: BehaviorSubject<IntegrationInfoWithStatusInterface> = new BehaviorSubject(null);
  isPreLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  protected destroyed$: Subject<boolean> = new Subject();

  protected cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected integrationsStateService: IntegrationsStateService = this.injector.get(IntegrationsStateService);
  protected activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);
  protected navigationService: NavigationService = this.injector.get(NavigationService);
  protected router: Router = this.injector.get(Router);
  protected translateService: TranslateService = this.injector.get(TranslateService);
  protected paymentsStateService: PaymentsStateService = this.injector.get(PaymentsStateService);
  protected dataGridSidebarService: PeDataGridSidebarService = this.injector.get(PeDataGridSidebarService);

  constructor(protected injector: Injector) {
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  filterList(list: IntegrationInfoWithStatusInterface[]): Observable<IntegrationInfoWithStatusInterface[]> {
    return this.integrationsStateService.getUserBusinesses().pipe(
      filter(d => !!d && !!d._id),
      take(1),
      map((business: UserBusinessInterface) => {
        // Uncomment if need filter by country
        // if (list && business && business.companyAddress && business.companyAddress.country) {
        //   list = list.filter(data => {
        //     return !!data && data.installationOptions && (
        //              (data.installationOptions.countryList || []).length === 0 ||
        //              (data.installationOptions.countryList || []).indexOf(business.companyAddress.country) >= 0
        //            );
        //   });
        // }
        return list;
      })
    );
  }

  abstract saveReturn(category: IntegrationCategory): void;

  openIntegration(item: IntegrationInfoWithStatusInterface, queryParams: object = {}): void {
    if (!this.openingIntegration$.getValue()) {
      this.openingIntegration$.next(item);
      this.isPreLoading$.pipe(filter(d => !d), take(1)).subscribe(() => {
        //const businessId = this.integrationsStateService.getBusinessId();
        this.saveReturn(item.category);
        this.paymentsStateService.openInstalledIntegration(item, queryParams);
        // this.router.navigate(
        //   [`business/${businessId}/connect/${item.category}/configure/${item.name}`],
        //   {queryParams}
        // );
        this.openingIntegration$.next(null);
      });
    }
  }

  openIntegrationInstallation(item: IntegrationInfoWithStatusInterface): void {
    const businessId = this.integrationsStateService.getBusinessId();
    this.saveReturn(item.category);
    this.router.navigate([`business/${businessId}/connect/${item.category}/integrations/${item.name}/install`]);
  }

  protected clearString(text: string): string {
    return (text || '').replace(/[^a-zA-Z]+/g, '').toLowerCase();
  }
}
