import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { get as _get, pick, set as _set } from 'lodash';
import { defer, Observable, of } from 'rxjs';
import { catchError, map, pluck } from 'rxjs/operators';

import { PEB_EDITOR_API_PATH } from '@pe/builder-api';
import {
  convertToQuery,
  PebEnvService,
  PebFilterParams,
  PebIntegration,
  PebIntegrationAction,
  PebIntegrationActionFieldMeta,
  PebIntegrationActionParams,
  PebIntegrationActionQueryType,
  PebIntegrationActionResponseType,
  PebOrderParams,
  PebPaginationParams,
  PebElementContextState,
} from '@pe/builder-core';
import { BusinessState } from '@pe/business';
import { PE_ENV } from '@pe/common';

import { PebContextApi } from './context.api';

// todo: it can be rudiment and should be removed.
export const PEB_PRODUCTS_API_PATH = new InjectionToken<string>('PEB_PRODUCTS_API_PATH');

@Injectable({ providedIn: 'any' })
export class PebContextService implements PebContextApi {

  @SelectSnapshot(BusinessState.businessUuid) businessId: string;

  constructor(
    protected http: HttpClient,
    @Optional() @Inject('APP') private readonly appInitial: any,
    @Optional() @Inject(PE_ENV) protected env: any,
    @Inject(PEB_EDITOR_API_PATH) protected editorApiPath: string,
    protected envService: PebEnvService,
  ) {
  }

  fetchIntegrations(): Observable<PebIntegration[]> {
    return this.http.get(`${this.editorApiPath}/api/context/cache/v2`).pipe(
      map<any, PebIntegration[]>((cache: { components: any, integrations: PebIntegration[] }) =>
        cache?.integrations ?? []
      ),
      catchError((err) => {
        console.error(err);

        return of([]);
      }),
    );
  }

  fetchIntegrationAction({
    integration,
    action,
    id = '',
    filter = [],
    order = [],
    pagination = {},
    data = null,
   }: {
    integration: PebIntegration,
    action: PebIntegrationAction,
    id?: string,
    data?: { [key: string]: any },
    filter?: PebFilterParams,
    order?: PebOrderParams,
    pagination?: PebPaginationParams,
  }): Observable<any> {
    return action?.queryType === PebIntegrationActionQueryType.Rest ?
      this.fetchIntegrationRestAction({ integration, action, id, filter, order, pagination, data }) :
      this.fetchIntegrationGqlAction({ integration, action, id, filter, order, pagination, data });
  }

  protected fetchIntegrationRestAction<T = any>(
    { integration, action, id = '', filter = [], order = [], pagination = {}, data = null }: {
      integration: PebIntegration,
      action: PebIntegrationAction,
      id?: string,
      data?: { [key: string]: any },
      filter?: PebFilterParams,
      order?: PebOrderParams,
      pagination?: PebPaginationParams,
    },
  ): Observable<T> {
    const { offset = 0, limit = 100 } = pagination;
    const integrationUrl = _get(this.env, integration.envUrl, integration.url);

    return defer(() => {
      return this.http[action.method.toLowerCase()](
        `${integrationUrl}${action.url}`,
        this.getIntegrationRestActionParams(action.params, id, filter, order, { offset, limit }, data),
      ) as Observable<T>;
    });
  }

  protected fetchIntegrationGqlAction<T = any>(
    { integration, action, id = '', filter = [], order = [], pagination = {}, data = null }: {
      integration: PebIntegration,
      action: PebIntegrationAction,
      id?: string,
      data?: { [key: string]: any },
      filter?: PebFilterParams,
      order?: PebOrderParams,
      pagination?: PebPaginationParams,
    },
  ): Observable<T> {
    const { offset = 0, limit = 100 } = pagination;
    const integrationUrl = _get(this.env, integration.envUrl, integration.url);
    const meta = action.meta && Object.keys(action.meta).length ?
      action.meta :
      action.responseMeta && Object.keys(action.responseMeta).length ?
        action.responseMeta : null;

    return this.http.post<{ data: any }>(`${integrationUrl}${action.url}`, {
      [action.queryType]: `{
        ${action.method} (
          ${this.getIntegrationGqlActionParams(action.params, id, filter, order, { offset, limit }, data)}
        ) {
          ${meta ? `${action.queryType === PebIntegrationActionQueryType.Mutation ? 'fields' : 'result'} {
            ${this.convertMetaToString(meta)}
          }` : ``}
          ${action.responseType === 'list' ? 'totalCount' : ''}
        }
      }`,
    }).pipe(
      pluck('data', action.method),
    );
  }

  protected convertMetaToString(actionMetas: { [field: string]: PebIntegrationActionFieldMeta }): string {
    const keys = Object.entries(actionMetas).reduce(
      (acc, [key, meta]) => {
        _set(acc, key, true);

        return acc;
      },
      {},
    );
    const getResult = (data) => {
      return Object.entries(data).map(([field, value]) => {
        if (typeof value === 'object') {
          return `${field} { ${getResult(value)} }`;
        }

        return field;
      }).join(' ');
    };

    return getResult(keys).replace(/"/g, '\\"');
  }

  protected getIntegrationRestActionParams(
    params: Array<PebIntegrationActionParams|string>,
    id: string = '',
    filter: PebFilterParams = [],
    order: PebOrderParams = [],
    { offset = 0, limit = 100 }: PebPaginationParams = {},
    data: any = null,
  ): any {
    const values = {
      [PebIntegrationActionParams.Data]: data,
      [PebIntegrationActionParams.Filter]: JSON.stringify(filter),
      [PebIntegrationActionParams.Business]: this.envService.businessId || this.appInitial?.businessId || this.businessId,
      [PebIntegrationActionParams.Shop]: this.envService.shopId || this.appInitial?.shopId,
      [PebIntegrationActionParams.Order]: order,
      [PebIntegrationActionParams.Id]: id,
      [PebIntegrationActionParams.Offset]: offset,
      [PebIntegrationActionParams.Limit]: limit,
      [PebIntegrationActionParams.ChannelSet]: this.envService.channelId || this.appInitial?.channelSet?.id,
    };

    return pick(values, params);
  }

  protected getIntegrationGqlActionParams(
    params: Array<PebIntegrationActionParams|string>,
    id: string = '',
    filter: PebFilterParams = [],
    order: PebOrderParams = [],
    { offset = 0, limit = 100 }: PebPaginationParams = {},
    data: { [key: string]: any } = null,
  ): string {
    const dataObj = data ? Object.entries(data).reduce((acc, [key, value]) => {
      _set(acc, key, value);

      return acc;
    }, {}) : {};
    if (filter.length && !params.includes(PebIntegrationActionParams.Filter)) {
      params.push(PebIntegrationActionParams.Filter);
    }
    const values = {
      [PebIntegrationActionParams.Filter]: `"${this.convertFiltersToString(filter)}"`,
      [PebIntegrationActionParams.Business]: `"${this.envService.businessId || this.appInitial?.businessId || this.businessId}"`,
      [PebIntegrationActionParams.Shop]: `"${this.envService.shopId || this.appInitial?.shopId}"`,
      [PebIntegrationActionParams.Order]: `"${this.convertFiltersToString(order)}"`,
      [PebIntegrationActionParams.Id]: `"${id}"`,
      [PebIntegrationActionParams.Offset]: `${offset}`,
      [PebIntegrationActionParams.Limit]: `${limit}`,
      [PebIntegrationActionParams.ChannelSet]: `"${this.envService.channelId || this.appInitial?.channelSet?.id}"`,
      [PebIntegrationActionParams.Data]: `${convertToQuery(dataObj)}`,
    };

    return params?.map(param => `${param}: ${values[param] ?? ''},`).join(' ') ?? '';
  }

  protected convertFiltersToString(filters: any): string {
    return JSON.stringify(filters).replace(/"/g, '\\"');
  }

  fetchDetailActionWithAdditional(
    integration: PebIntegration,
    action: PebIntegrationAction,
    id: string,
  ): Observable<any> {
    return this.fetchIntegrationAction({
      integration,
      action,
      id,
    }).pipe(
      map(data => ({
        state: PebElementContextState.Ready,
        data: data?.result ?? null,
      })),
    );
  }

  fetchActionWithAdditional(
    integration: PebIntegration,
    action: PebIntegrationAction,
    filter: PebFilterParams = [],
    order: PebOrderParams = [],
    pagination: PebPaginationParams = {},
    additionalFilters?: PebFilterParams,
    additionalOrder?: PebOrderParams,
  ): Observable<any> {
    const filters = [...filter, ...(additionalFilters ?? [])];
    const orders = [...order, ...(additionalOrder ?? [])];

    return this.fetchIntegrationAction({
      integration,
      action,
      pagination,
      order: orders,
      filter: filters,
    }).pipe(
      map(data => ({
        state: PebElementContextState.Ready,
        data: (data?.result ? data.result : data) ?? [],
      })),
    );
  }


}
