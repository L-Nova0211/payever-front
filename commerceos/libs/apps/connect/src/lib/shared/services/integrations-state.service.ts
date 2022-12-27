import { Injectable } from '@angular/core';
import { cloneDeep, forEach } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { catchError, filter, flatMap, take, map, mergeMap, switchMap, tap } from 'rxjs/operators';

import { PeSearchItem } from '@pe/common';
import { FolderItem } from '@pe/folders';
import { PeFilterChange } from '@pe/grid';

import {
  IntegrationCategory,
  IntegrationShortStatusInterface,
  IntegrationInfoWithStatusInterface,
  UserBusinessInterface,
  PaymentMethodEnum,
  IntegrationReviewInterface,
  IntegrationVersionInterface,
  PeIntegrationsCache,
  PeFoldersCache,
} from '../interfaces';
import { PeSort } from '../interfaces/connect-list.interface';

import { BusinessService } from './business.service';
import { IntegrationsApiService } from './integrations-api.service';

export declare interface PaymentStateServiceInterface {
  enableOptionByPaymentMethod(paymentMethod: PaymentMethodEnum): Observable<void>;

  resetCredentailsByPaymentMethod(paymentMethod: PaymentMethodEnum): Observable<void>;
}

@Injectable()
export class IntegrationsStateService {

  subscriptionsTotal: number;

  private integrations: PeIntegrationsCache = {};
  private folders: PeFoldersCache = {};
  private subscriptionsPageLimit = 12;

  constructor(
    private businessService: BusinessService,
    private integrationApiService: IntegrationsApiService
  ) {
  }

  getCategoriesIntegrations(
    active: boolean,
    categories: IntegrationCategory[],
    reset: boolean = false,
  ): Observable<IntegrationInfoWithStatusInterface[]> {
    const categoriesFull = categories.map(c => `integrations.categories.${c}`);

    return this.getMyAppsFolders().pipe(
      filter(a => !!a),
      take(1),
      switchMap((foldersRaw) => {
        const folders = foldersRaw.filter(a => categoriesFull.indexOf(a.name) >= 0);

        return combineLatest(
          folders.map(folder =>
            this.getIntegrationsByFolderId(active, folder?._id, reset).pipe(filter(a => !!a), take(1)))
        ).pipe(map((data) => {
          return data.reduce((prev, cur) => {
            prev.push(...cur);

            return prev;
          }, []);
        }));
      })
    );
  }

  getIntegrationsByFolderId(
    active: boolean,
    folderId: string,
    reset: boolean = false // Not used yet but will be required when we have cache
  ): Observable<IntegrationInfoWithStatusInterface[]> {
    const business = this.businessService.businessId;

    return this.integrationApiService.getCategoryIntegrationStatuses(
      business,
      active,
      folderId,
      [],
      1,
      90, // As many as possible
      null // sort,
    ).pipe(map(this.prepareIntegrationInfoWithStatus));
  }

  getIntegration(name: string, reset: boolean = false): Observable<IntegrationInfoWithStatusInterface> {
    const business = this.businessService.businessId;
    const cacheName = `${business}_${name}`;

    if (!this.integrations[cacheName]) {
      this.integrations[cacheName] = {
        subject: new BehaviorSubject<IntegrationInfoWithStatusInterface>(null),
        processed: false,
      };
    }
    const ref = this.integrations[cacheName];
    if (!ref.processed || reset) {
      ref.processed = true;
      ref.subject.next(null);

      let integrInfo: IntegrationInfoWithStatusInterface = null;
      this.integrationApiService.getIntegrationInfo(name).pipe(
        take(1),
        switchMap((info: IntegrationInfoWithStatusInterface) => {
          integrInfo = info;

          return this.integrationApiService.getIntegrationStatus(business, name).pipe(
            tap((shortStatus) => {
              const final = cloneDeep(integrInfo) as IntegrationInfoWithStatusInterface;
              final.status = {} as any;
              final.status.installed = shortStatus.installed;
              ref.subject.next(final);
            }),
          );
        })
      ).subscribe();
    }

    return ref.subject.asObservable();
  }

  getMyAppsFolders(reset: boolean = false): Observable<FolderItem[]> {
    const business = this.businessService.businessId;
    const cacheName = `${business}`;
    if (!this.folders[cacheName]) {
      this.folders[cacheName] = {
        subject: new BehaviorSubject<FolderItem[]>(null),
        processed: false,
      };
    }
    const ref = this.folders[cacheName];
    if (!ref.processed || reset) {
      ref.processed = true;
      ref.subject.next(null);

      this.integrationApiService.getMyAppsFolders(business).subscribe((folders) => {
        ref.subject.next(folders);
      }, () => {
        ref.processed = false;
      });
    }

    return ref.subject.asObservable();
  }

  getIntegrationOnce(name: string, reset: boolean = false): Observable<IntegrationInfoWithStatusInterface> {
    return this.getIntegration(name, reset).pipe(filter(d => !!d), take(1));
  }

  getFolderIntegrations(
    folderId: string,
    searchFilters: PeFilterChange[] | PeSearchItem[] = []
  ): Observable<IntegrationInfoWithStatusInterface[]> {
    return this.integrationApiService.getMyAppsByFolderId(folderId, searchFilters)
      .pipe(map(this.prepareIntegrationInfoWithStatus));
  }

  prepareIntegrationInfoWithStatus(folder): IntegrationInfoWithStatusInterface[] {
    this.subscriptionsTotal = folder.collection.length;
    const result: IntegrationInfoWithStatusInterface[] = [];
    forEach(folder.collection, (integration) => {
      const final = cloneDeep(integration) as IntegrationInfoWithStatusInterface;
      final.status = { installed: integration.installed };
      final.subscriptionId = integration._id;
      result.push(final);
    });

    return result;
  }

  getFolderIntegrationsRoot(
    page = 1,
    searchFilters: PeFilterChange[] | PeSearchItem[] = [],
    sort: PeSort = null,
    installed = false,
  ): Observable<IntegrationInfoWithStatusInterface[]> {
    return this.integrationApiService.getMyAppsRoot(
      searchFilters,
      page,
      this.subscriptionsPageLimit,
      sort,
    ).pipe(map(
        (folder) => {
        this.subscriptionsTotal = folder.pagination_data.total;
        const result: IntegrationInfoWithStatusInterface[] = [];
        forEach(folder.collection, (integration) => {
          const final = cloneDeep(integration) as IntegrationInfoWithStatusInterface;
          final.status = { installed: integration.installed };
          final.subscriptionId = integration._id;
          result.push(final);
        });

        return installed ? result.filter(item => item.status.installed) : result;
      }
    ));
  }

  // TODO SPLIT UP INSTALL AND UNINSTALL!!!
  installIntegration(
    name: string, install: boolean = true
  ): Observable<IntegrationShortStatusInterface> {
    const business = this.businessService.businessId;

    return this.integrationApiService.installIntegration(business, name, install).pipe(
      flatMap((data) => {
        return this.getIntegration(name, true).pipe(
          filter(d => !!d),
          take(1),
          flatMap((info: IntegrationInfoWithStatusInterface) => {
            // this.resetFlowOfCategoryIntegrations(false, info.category);
            // this.resetFlowOfCategoryIntegrations(true, info.category);
            return of(data);
          }),
        );
      })
    );
  }

  getBusinessId(): string {
    return this.businessService.businessId;
  }

  getSubscriptionsTotal(): number {
    return this.subscriptionsTotal;
  }

  setSubscriptionsLimit(limit: number): number {
    return this.subscriptionsPageLimit = limit;
  }

  getUserBusinessesList(): Observable<UserBusinessInterface> {
    return this.businessService.getUserBusinessesList().pipe(catchError(() => []), map(data => data.business));
  }

  getUserBusinesses(): Observable<UserBusinessInterface> {
    return this.getUserBusinessesList();
  }

  getUserBusinessesOnce(reset: boolean = false): Observable<UserBusinessInterface> {
    return this.getUserBusinesses().pipe(filter(d => !!d), take(1));
  }

  saveUserBusinesses(data: UserBusinessInterface): Observable<void> {
    const business = this.businessService.businessId;

    return this.businessService.saveUserBusinesses(business, data).pipe(map((result) => {
      this.getUserBusinessesOnce(true).pipe(map(() => {
        return result;
      }));
    }));
  }

  addIntegrationReview(integrationName: string, review: IntegrationReviewInterface): Observable<void> {
    return this.integrationApiService.addIntegrationReview(integrationName, review).pipe(mergeMap((a) => {
      return this.getIntegrationOnce(integrationName, true).pipe(map(() => a));
    }));
  }

  rateIntegration(integrationName: string, rating: number): Observable<void> {
    return this.integrationApiService.rateIntegration(integrationName, rating).pipe(mergeMap((a) => {
      return this.getIntegrationOnce(integrationName, true).pipe(map(() => a));
    }));
  }

  getIntegrationVersions(integrationName: string): Observable<IntegrationVersionInterface[]> {
    return this.integrationApiService.getIntegrationVersions(integrationName);
  }
}

