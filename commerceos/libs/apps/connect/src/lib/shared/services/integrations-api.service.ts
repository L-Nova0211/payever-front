import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  EnvironmentConfigInterface as EnvInterface,
  NodeJsBackendConfigInterface,
  PE_ENV,
  PeSearchItem,
} from '@pe/common';
import { FolderItem } from '@pe/folders';
import { PeFilterChange } from '@pe/grid';

import { FiltersFieldType, PeFilters } from '../enum/list-common';
import {
  IntegrationCategory,
  IntegrationInfoInterface,
  IntegrationShortStatusInterface,
  IntegrationStatusInterface,
  IntegrationReviewInterface,
  IntegrationVersionInterface,
  CustomIntegrationsFolder,
  IntegrationSubscriptionInterface,
} from '../interfaces';
import { PeConnectFolderInterface, PeSort, ValuesInterface } from '../interfaces/connect-list.interface';

import { BusinessService } from './business.service';

@Injectable({
  providedIn: 'root',
})
export class IntegrationsApiService {

  constructor(
    private http: HttpClient,
    private businessService: BusinessService,
    @Inject(PE_ENV) private envConfig: EnvInterface,
  ) {
  }

  getSomeIntegrationInstalled(): Observable<boolean> {
    const businessId = this.businessService.businessId;
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<{ integrations: IntegrationStatusInterface[] }>(
      `${config.connect}/api/business/${businessId}/integration`
    ).pipe(map((data: { integrations: IntegrationStatusInterface[] }) => {
      return !!data.integrations.find(d => d.installed);
    }));
  }

  getCategoryIntegrationInfos(category?: IntegrationCategory): Observable<IntegrationInfoInterface[]> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<IntegrationInfoInterface[]>(
      category ?
        `${config.connect}/api/integration/category/${category}` :
        `${config.connect}/api/integration?limit=1000`
    );
  }

  getCategoryIntegrationStatuses(
    business: string,
    active: boolean,
    folderId: string,
    searchFilters: PeFilterChange[] | PeSearchItem[] = [],
    page = 1,
    limit: number = 40,
    sort: PeSort,
  ): Observable<PeConnectFolderInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    let url = `${config.connect}/api/folders/business/${business}/folder/${folderId}/documents`;

    let params = this.makeParams2({
      page: page === 0 ? 1 : page,
      limit,
      searchFilters,
      sort,
    });

    return this.http.get<PeConnectFolderInterface>(url, { params });
  }

  getIntegrationInfo(name: string): Observable<IntegrationInfoInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<IntegrationInfoInterface>(
      `${config.connect}/api/integration/${name}`
    );
  }

  getIntegrationStatus(business: string, name: string): Observable<IntegrationShortStatusInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<IntegrationShortStatusInterface>(
      `${config.connect}/api/business/${business}/integration/${name}`
    );
  }

  installIntegration(
    business: string,
    name: string,
    install: boolean = true
  ): Observable<IntegrationShortStatusInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.patch<IntegrationShortStatusInterface>(
      `${config.connect}/api/business/${business}/integration/${name}/${install ? 'install' : 'uninstall'}`,
      {}
    );
  }

  setStatus(businessId: string): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${config.commerceos}/api/apps/business/${businessId}/app/connect/toggle-setup-status`;

    return this.http.patch<void>(url, { setupStatus: 'completed' });
  }

  startTrial(businessId: string): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${config.connect}/api/subscriptions/trials/${businessId}`;

    return this.http.post<void>(url, {
      appName: 'connect',
    });
  }

  /**
   * Add review to integration
   * @param name - integration name
   * @param review - review data
   */
  addIntegrationReview(name: string, review: IntegrationReviewInterface): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.patch<void>(`${config.connect}/api/integration/${name}/add-review`, review);
  }

  /**
   * Add rating to integration
   * @param name - integration name
   * @param rating - rating number
   */
  rateIntegration(name: string, rating: number): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.patch<void>(`${config.connect}/api/integration/${name}/rate`, { rating });
  }

  /**
   * Get integration versions
   * @param name - integration name
   */
  getIntegrationVersions(name: string): Observable<IntegrationVersionInterface[]> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<IntegrationVersionInterface[]>(`${config.connect}/api/integration/${name}/versions`);
  }

  getCustomFolders(business: string): Observable<CustomIntegrationsFolder[]> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<CustomIntegrationsFolder[]>(`${config.connect}/api/${business}/folders`);
  }

  getCustomFolderIntegrations(
    business: string,
    folderId: string,
    searchFilters: PeFilterChange[] | PeSearchItem[] = []
  ): Observable<IntegrationSubscriptionInterface[]> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${config.connect}/api/${business}/folders/${folderId}/integrations`;
    const params = this.makeParams({ searchFilters });

    return this.http.get<IntegrationSubscriptionInterface[]>(url, { params });
  }

  createCustomFolder(business: string, data: CustomIntegrationsFolder): Observable<CustomIntegrationsFolder> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.post<CustomIntegrationsFolder>(`${config.connect}/api/${business}/folders`, data);
  }

  updateCustomFolder(
    business: string,
    folderId: string,
    data: CustomIntegrationsFolder
  ): Observable<CustomIntegrationsFolder> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.patch<CustomIntegrationsFolder>(`${config.connect}/api/${business}/folders/${folderId}`, data);
  }

  deleteCustomFolder(business: string, folderId: string): Observable<any> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.delete<any>(`${config.connect}/api/${business}/folders/${folderId}`);
  }

  getMyAppsFolders(business: string): Observable<FolderItem[]> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<FolderItem[]>(`${config.connect}/api/folders/business/${business}`);
  }

  getMyAppsByFolderId(
    id: string,
    searchFilters: PeFilterChange[] | PeSearchItem[] = []
  ): Observable<PeConnectFolderInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${config.connect}/api/folders/folder/${id}/documents`;
    const params = this.makeParams2({ searchFilters });

    return this.http.get<PeConnectFolderInterface>(url, { params });
  }

  getMyAppsRoot(
    searchFilters: PeFilterChange[] | PeSearchItem[] = [],
    page = 1,
    limit: number = 40,
    sort: PeSort,
  ): Observable<PeConnectFolderInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    const url = `${config.connect}/api/folders/business/${this.businessService.businessId}/root-documents`;
    let params = this.makeParams2({
      page: page === 0 ? 1 : page,
      limit,
      searchFilters,
      sort,
    });
    params = params.append('all', '1');

    return this.http.get<PeConnectFolderInterface>(url, { params });
  }

  getIntegrationsByFolderId(
    folderId: string,
    searchFilters: PeFilterChange[] | PeSearchItem[] = [],
    page = 1,
    limit: number = 40,
    sort: PeSort,
  ): Observable<PeConnectFolderInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    let url =
      `${config.connect}/api/folders/business/${this.businessService.businessId}/folder/${folderId}/documents`;

    let params = this.makeParams2({
      page: page === 0 ? 1 : page,
      limit,
      searchFilters,
      sort,
    });

    return this.http.get<PeConnectFolderInterface>(url, { params });
  }

  getIntegrationsMyAppsInstalled(
    page = 1,
    limit: number = 40,
    sort: PeSort,
    searchFilters: PeFilterChange[] | PeSearchItem[] = [],
  ): Observable<PeConnectFolderInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    let url =
      `${config.connect}/api/folders/business/${this.businessService.businessId}/root-documents`;

    let params = this.makeParams2({
      page: page === 0 ? 1 : page,
      limit,
      sort,
      installed: true,
      searchFilters,
    });

    params = params.append('all', '1');

    return this.http.get<PeConnectFolderInterface>(url, { params });
  }

  getValues(): Observable<ValuesInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<ValuesInterface>(`${config.connect}/api/values`);
  }

  makeParams2(options) {
    let params = new HttpParams()
      .set('orderBy', options.sort?.field ? options.sort?.field : FiltersFieldType.CreatedAt)
      .set('direction', options.sort?.order ? options.sort?.order : 'desc')
      .set('limit', options.limit ? `${options.limit}` : '40')
      .set('page', options.page ? `${options.page}` : '1');

    if (options.searchFilters) {
      const filters = {}
      options.searchFilters.forEach((filter) => {
        filters[filter.filter] = filters[filter.filter] !== undefined ? filters[filter.filter] + 1 : 0;

        params = params.append(
          `filters[${filter.filter}][${filters[filter.filter]}][condition]`
          , filter.contain
        );

        params = params.append(
          `filters[${filter.filter}][${filters[filter.filter]}][value][0]`
          , `*${filter.search}*`
        );
      });
    }

    if (options.categories?.length > 0) {
      params = params.append(
        `filters[category][0][condition]`
        , 'contains'
      );

      params = params.append(
        `filters[category][0][value][0]`
        , options.categories[0]
      );
    }

    if (options.installed) {
      params = params.append(
        `filters[installed][0][condition]`
        , 'is'
      );

      params = params.append(
        `filters[installed][0][value]`
        , 'true'
      );
    }

    return params;
  }

  makeParams(options) {
    let params = new HttpParams();

    if (options.page) {
      params = params.append('page', options.page);
    }
    if (options.limit) {
      params = params.append('limit', options.limit);
    }

    if (options.categories) {
      options.categories.forEach(category => params = params.append('categories', category));
    }

    if (options.sort) {
      params = params.append(options.sort.order, options.sort.field);
    }

    if (options.searchFilters) {
      options.searchFilters.forEach((filter) => {
        if (filter.filter === PeFilters.Name) {
          const param = filter.contain === 'doesNotContain' ? `notContainName` : `containName`;
          params = params.append(param, filter.search);
        }

        if (filter.filter === PeFilters.Category) {
          params = params.append('categories', filter.search.toLowerCase());
        }

        if (filter.filter === PeFilters.Developer) {
          params = params.append('developer', filter.search.toLowerCase());
        }
      });
    }

    return params;
  }
}
