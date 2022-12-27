import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { flatten } from 'flat';
import { cloneDeep, forIn } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { FlowInterface } from '@pe/checkout-wrapper-sdk-types';
import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';
import { FolderItem, FolderPosition } from '@pe/folders';
import { RuleValues } from '@pe/rules';

import { ActionTypeEnum } from '../shared';
import {
  ActionInterface,
  DetailInterface,
  MailActionInterface,
  ProcessShippingOrderInterface,
} from '../shared/interfaces/detail.interface';
import { FiltersFieldType } from '../shared/interfaces/filters.type';
import { PeFolder } from '../shared/interfaces/folder.interface';
import { IntegrationInfoInterface, ListResponseInterface, SearchTransactionsInterface } from '../shared/interfaces/list.interface';
import { PaymentInterface } from '../shared/interfaces/payment.interface';
import { ShippingLabelInterface, ShippingSlipInterface } from '../shared/interfaces/shipping-slip.interface';
import { ResponseValuesInterface } from '../shared/interfaces/values.interface';

import { SettingsService } from './settings.service';

@Injectable()
export class ApiService {
  constructor(
    private http: HttpClient,
    @Inject(PE_ENV) private envConfig: EnvironmentConfigInterface,
    private envService: EnvService,
    private settingsService: SettingsService
  ) {
  }

  getTransactionDetails(orderUuid: string): Observable<DetailInterface> {
    const path: string = this.settingsService.getApiGetOrderDetailsUrl(orderUuid);

    return this.http.get<DetailInterface>(path);
  }

  getTransactionActions(orderUuid: string): Observable<ActionInterface[]> {
    const path: string = this.settingsService.getApiGetOrderActionsUrl(orderUuid);

    return this.http.get<ActionInterface[]>(path);
  }

  getShippingActions(order: DetailInterface): Observable<ActionInterface[]> {
    const path: string = this.settingsService.externalUrls.getShippingActionsUrl();

    return this.http.post<ActionInterface[]>(path, order).pipe(
      catchError(() => of([]))
    );
  }

  getMailerActions(order: DetailInterface): Observable<MailActionInterface[]> {
    const path: string = this.settingsService.externalUrls.getMailerActionsUrl();

    return this.http.post<MailActionInterface[]>(path, order).pipe(
      catchError(() => of([]))
    );
  }

  getTransactions(searchData: SearchTransactionsInterface): Observable<ListResponseInterface> {
    const path = this.settingsService.apiGetListUrl;

    return this.http.get<ListResponseInterface>(path, { params: this.getSearchParams(searchData) });
  }

  getTransactionsSettings(): Observable<ListResponseInterface> {
    const path = this.settingsService.apiGetColumnsUrl;

    return this.http.get<ListResponseInterface>(path);
  }

  /* Folders */

  getFolderDocuments(folderId: string, searchData: SearchTransactionsInterface): Observable<ListResponseInterface> {
    let path = this.settingsService.apiRootDocuments;
    if (folderId) {
      path = this.settingsService.apiFolderDocuments(folderId);
    }

    return this.http.get<ListResponseInterface>(path, { params: this.getSearchParams(searchData) });
  }

  getFlatFolders(): Observable<PeFolder[]> {
    return this.http.get<PeFolder[]>(this.settingsService.apiFlatFolders);
  }

  getFolders(): Observable<PeFolder[]> {
    return this.http.get<PeFolder[]>(this.settingsService.apiFoldersTree);
  }

  postFolder(folderData: PeFolder): Observable<PeFolder> {
    return this.http.post<PeFolder>(
      this.settingsService.apiPostFolder, folderData
    );
  }

  patchFolder(folderData: PeFolder): Observable<PeFolder> {
    const folderId = folderData._id;

    return this.http.patch<PeFolder>(
      this.settingsService.apiPatchFolder(folderId), folderData
    );
  }

  patchFolderPosition(positions: FolderPosition[]): Observable<PeFolder> {

    return this.http.post<PeFolder>(
      this.settingsService.apiPatchFolderPosition,
      { positions }
    );
  }

  deleteFolder(folderId: string): Observable<PeFolder> {
    return this.http.delete<PeFolder>(
      this.settingsService.apiDeleteFolder(folderId)
    );
  }

  moveToFolder(folderId: string, documentId: string): Observable<any> {
    return this.http.post(this.settingsService.apiMoveToFolder(folderId, documentId), null);
  }

  moveToRoot(documentId: string): Observable<any> {
    return this.http.post(this.settingsService.apiMoveToRoot(documentId), null);
  }

  downloadLabel(businessId: string, orderId: string): Observable<ShippingLabelInterface> {
    const endpointUrl = `${this.envConfig.backend.shipping}/api/business/${businessId}/shipping-orders/${orderId}/label`;

    return this.http.post<ShippingLabelInterface>(endpointUrl, { labelResponseType: 'URL' });
  }

  checkSantanderStatus(orderId: string): Observable<boolean> {
    return this.http.get(this.settingsService.externalUrls['getSantanderCheckStatusUrl'](this.settingsService.businessUuid, orderId)).pipe(
      map(() => true)
    );
  }

  getCheckoutFlow(flowId: string):  Observable<FlowInterface> {
    return this.http.post(`${this.envConfig.backend.checkout}/api/flow/v1/${flowId}/clone`, null);
  }

  postPaymentAction(action: string, connectionId: string, paymentId: string): Observable<any> {
    return this.http.post(`${this.envConfig.thirdParty.payments}/api/connection/${connectionId}/action/${action}`, { paymentId })
  }

  postAction(businessUuid: string, orderId: string, action: ActionTypeEnum, payload: any): Observable<any> {
    const url: string = this.settingsService.apiBusinessUrls['postActionUrl'](this.settingsService.businessUuid, orderId, action);

    return this.http.post(url, payload);
  }

  processShippingOrder(order: ProcessShippingOrderInterface, shippingOrderId: string): Observable<void> {
    const endpointUrl: string = this.settingsService.apiBusinessUrls.postShippingOrder(this.settingsService.businessUuid, shippingOrderId);

    return this.http.post<void>(endpointUrl, order);
  }

  resendShippingConfirmation(businessUuid: string, mailEventId: string): Observable<void> {
    const endpointUrl = `${this.envConfig.backend.mailer}/api/business/${this.settingsService.businessUuid}/payment-mail/${mailEventId}`;

    return this.http.post<void>(endpointUrl, {});
  }

  getShippingSlip(businessId: string, orderId: string): Observable<ShippingSlipInterface> {
    const endpointUrl = `${this.envConfig.backend.shipping}/api/business/${businessId}/shipping-orders/${orderId}/slip`;

    return this.http.get<ShippingSlipInterface>(endpointUrl);
  }

  getValues(): Observable<ResponseValuesInterface> {
    return this.http.get<ResponseValuesInterface>(`${this.envConfig.backend.transactions}/api/values`);
  }

  getIntegrations(businessId: string): Observable<IntegrationInfoInterface[]> {
    return this.http.get<IntegrationInfoInterface[]>(`${this.envConfig.backend.checkout}/api/business/${businessId}/integration`);
  }

  getRulesValues(): Observable<RuleValues> {
    return this.http.get<RuleValues>(`${this.envConfig.backend.transactions}/api/rules/values`);
  }

  getRules(): Observable<any> {
    return this.http.get(`${this.envConfig.backend.transactions}/api/rules/business/${this.envService.businessId}`);
  }

  createRule(data): Observable<any> {
    return this.http.post(`${this.envConfig.backend.transactions}/api/rules/business/${this.envService.businessId}`, data);
  }

  updateRule(data, ruleId: string): Observable<any> {
    return this.http.patch(`${this.envConfig.backend.transactions}/api/rules/business/${this.envService.businessId}/rule/${ruleId}`, data);
  }

  deleteRule(ruleId: string): Observable<any> {
    return this.http.delete(`${this.envConfig.backend.transactions}/api/rules/business/${this.envService.businessId}/rule/${ruleId}`);
  }

  getRuleDetails(ruleId: string): Observable<any> {
    return this.http.get(`${this.envConfig.backend.transactions}​/api​/rules​/business​/${this.envService.businessId}​/rule​/${ruleId}`);
  }

  exportTransactions(
    format: string,
    columns: any[],
    businessName: string,
    searchData: SearchTransactionsInterface,
    selectFolder: FolderItem): Observable<HttpResponse<any>> {
    let params: HttpParams = this.getSearchParams(searchData);

    if (selectFolder?._id) {
      params = params.set('parentFolderId', selectFolder._id);
    }

    params = params.set('format', format)
      .set('businessName', businessName)
      .set('columns', JSON.stringify(columns));
    params.keys().forEach(key => {
      if (params.get(key)?.length === 0) {
        params = params.delete(key);
      }
    });
    const path: string = this.settingsService.apiGetExport;
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/octet-stream',
    });

    return this.http.get(path, { params, headers, responseType: 'blob', observe: 'response' });
  }

  private getSearchParams(searchData: SearchTransactionsInterface): HttpParams {
    const searchDataCopy: SearchTransactionsInterface = cloneDeep(searchData);
    let searchParams: HttpParams = new HttpParams()
      .set('orderBy', searchDataCopy.orderBy ? searchDataCopy.orderBy.replace(/p\./g, '') : FiltersFieldType.CreatedAt)
      .set('direction', searchDataCopy.direction ? searchDataCopy.direction : 'desc')
      .set('limit', searchDataCopy.perPage ? `${searchDataCopy.perPage}` : '10')
      .set('query', searchDataCopy.search ? searchDataCopy.search : '')
      .set('page', searchDataCopy.page ? `${searchDataCopy.page}` : '1')
    if (searchData.currency) {
      searchParams = searchParams.set('currency', searchData.currency);
    }

    if (searchDataCopy && searchDataCopy.configuration && Object.keys(searchDataCopy.configuration).length) {
      if (searchDataCopy.configuration) {
        for (const filterName in searchDataCopy.configuration) {
          if (
            searchDataCopy.configuration[filterName][0] &&
            ['is', 'isNot'].indexOf(searchDataCopy.configuration[filterName][0].condition) > -1
          ) {
            if (Array.isArray(searchDataCopy.configuration[filterName][0].value)) {
              if (searchDataCopy.configuration[filterName][0].value.length > 1) {
                searchDataCopy.configuration[filterName][0].condition += 'In';
              } else if (searchDataCopy.configuration[filterName][0].value.length === 1) {
                searchDataCopy.configuration[filterName][0].value = searchDataCopy.configuration[filterName][0].value[0];
              }
            }
          }
        }
      }

      const flattenParams: { [propName: string]: string } = flatten(searchDataCopy);
      forIn(flattenParams, (propValue: string, propName: string) => {
        const httpParamName: string = propName.split('.')
          .map((element: string, index: number) => {
            if (index !== 0) {
              return `[${element}]`;
            }

            return element === 'configuration' ? 'filters' : element;
          })
          .join('');
        if (this.isFilterQuery(httpParamName)) {
          // TODO This is temporary fix
          if (httpParamName.indexOf('filters[channel]') === 0 && propValue === 'WooCommerce') {
            propValue = 'woo_commerce';
          }
          searchParams = searchParams.set(httpParamName, propValue);
        }
      });
    }

    return searchParams;
  }

  private isFilterQuery(query: string): boolean {
    const nonFilterQueries: string[] = [
      'orderBy',
      'direction',
      'limit',
      'page',
    ];

    return nonFilterQueries.indexOf(query) === -1;
  }

  private getRand(): string {
    // Safari doesn't react to no-cache headers and caching some requests randomly, without showing them in Network tab
    return Math.random().toString(10).substr(-8);
  }
}
