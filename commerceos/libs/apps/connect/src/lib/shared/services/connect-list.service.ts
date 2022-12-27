import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';

import { PeDataGridPaginator } from '@pe/common';
import { PeFilterChange, PeGridView, PeListImagesService } from '@pe/grid';
import { TranslateService } from '@pe/i18n';
import { LocaleService } from '@pe/i18n-core';

import { connectView } from '../../shared/enum/list-common';
import { PeSort } from '../interfaces/connect-list.interface';
import { IntegrationInfoWithStatusInterface } from '../interfaces/integration.interface';

import { DataGridService } from './data-grid.service';
import { IntegrationsApiService } from './integrations-api.service';
import { IntegrationsStateService } from './integrations-state.service';

@Injectable()
export class ConnectListService {
  showOnlyInstalledIntegrations: boolean;
  searchItems: PeFilterChange[] = [];
  sort: PeSort;
  gridLayout = localStorage.getItem(connectView) ?? PeGridView.List;
  locale = this.localeService.currentLocale$.value.code;
  paginator: PeDataGridPaginator = {
    page: 1,
    perPage: this.getPaginationResult(),
    total: 10,
  };

  isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(
    protected route: ActivatedRoute,
    protected integrationsStateService: IntegrationsStateService,
    protected dataGridService: DataGridService,
    protected translateService: TranslateService,
    private localeService: LocaleService,
    private integrationApiService: IntegrationsApiService,
    private peListImagesService: PeListImagesService
  ) {
  }

  getPaginationResult() {
    const view = localStorage.getItem(connectView);

    let perPage = window.innerWidth <= 1000
      ? 15
      : (
        window.innerWidth > 1000 && window.innerWidth < 1700
          ? 16
          : (
            window.innerWidth > 1700 && window.innerWidth <= 1920
              ? 25
              : 30
          )
      );

    if (window.innerHeight > 1080) { perPage = perPage + 5 }

    return view === PeGridView.Table && window.innerWidth > 1000 ? perPage + 40 : perPage;
  }

  setSubscriptionsLimit(number = 0) {
    this.paginator.perPage = this.getPaginationResult() + number;
  }

  loadCategoryList(folderId?: string): void {
    this.isLoading$.next(true);
    let categoryIntegrations$ = this.integrationApiService.getMyAppsRoot(
      this.searchItems,
      this.paginator.page,
      this.paginator.perPage,
      this.sort,
    ).pipe(map(folders => this.prepareIntegrationInfoWithStatus(folders)));

    if (folderId) {
      categoryIntegrations$ = this.integrationApiService.getIntegrationsByFolderId(
        folderId,
        this.searchItems,
        this.paginator.page,
        this.paginator.perPage,
        this.sort,
      ).pipe(
        map(folders => this.prepareIntegrationInfoWithStatus(folders)),
        catchError((err) => {
        this.isLoading$.next(false);
        return throwError(err);
      })
      );
    }

    this.initGridItems(categoryIntegrations$);
  }

  prepareIntegrationInfoWithStatus(folder): IntegrationInfoWithStatusInterface[] {
    this.paginator.total = folder.pagination_data.total;
    const result: IntegrationInfoWithStatusInterface[] = [];
    folder.collection.forEach((integration) => {
      if (!integration) { return }

      const final = { ...integration } as IntegrationInfoWithStatusInterface;
      final.status = { installed: integration.installed };
      final.subscriptionId = integration._id;
      result.push(final);
    });

    if (!result?.length) {
      this.peListImagesService.allImagesLoad$.next(false);
    }

    return result;
  }

  loadMyAppsList(): void {
    this.isLoading$.next(true);
    this.initGridItems(this.integrationApiService.getIntegrationsMyAppsInstalled(
      this.paginator.page,
      this.paginator.perPage,
      this.sort,
      this.searchItems,
    ).pipe(
      map(folders => this.prepareIntegrationInfoWithStatus(folders)),
      catchError((err) => {
        this.isLoading$.next(false);
        return throwError(err);
      })
    ));
  }

  initGridItems(integrationsSource: Observable<IntegrationInfoWithStatusInterface[]>) {
    integrationsSource.pipe(
      take(1),
      tap((integrationInfo) => {
        const data: IntegrationInfoWithStatusInterface[] = integrationInfo;

        const translate = a => this.translateService.translate(a);
        this.filterItems(translate, data);
        this.isLoading$.next(false);
      }),
    ).subscribe();
  }

  filterItems(translate, data) {
    const integrations = data.map((item) => {
      const description = translate(item?.installationOptions?.description);
      let title = item?.titleTranslations ? item?.titleTranslations[this.locale] : null;
      title = title ?? translate(item?.displayOptions?.title) ?? '';
      const developer = item?.developerTranslations ? item?.developerTranslations[this.locale] : null;

      return {
        id: item?._id,
        type: 'item',
        subscriptionId: item.subscriptionId,
        image: item?.installationOptions?.links[0]?.url ?? null,
        icon: item?.displayOptions?.icon ?? null,
        name: title ?? '',
        category: translate(item?.installationOptions?.category) ?? '',
        developer: developer ?? translate(item?.installationOptions?.developer) ?? '',
        languages: translate(item?.installationOptions?.languages) ?? '',
        title: title ?? '',
        description: description ? description.replace(/<br>/gi, '') : null,
        cardItem: item,
        isLoading$: new BehaviorSubject(false),
        badge: {
          label: item.installed
            ? this.translateService.translate('connect-app.installation.installed.title') : null,
          backgroundColor: '#65646d',
          color: '#d4d3d9',
        },
        action: {
          label: item.status.installed
            ? this.translateService.translate('connect-app.actions.edit')
            : this.translateService.translate('connect-app.actions.install'),
          more: item.installed,
        },
        columns: [
          {
            name: 'name',
            value: 'name',
          },
          {
            name: 'category',
            value: 'category',
          },
          {
            name: 'developer',
            value: 'developer',
          },
          {
            name: 'languages',
            value: 'languages',
          },
          {
            name: 'action',
            value: 'action',
          },
        ],
      };
    });
    if (this.paginator.page > 1) {
      const concatIntegrations = [...this.dataGridService.gridItems$.value, ...integrations];
      this.dataGridService.gridItems$.next(concatIntegrations);
    } else {
      this.dataGridService.gridItems$.next(integrations);
    }
  }
}
