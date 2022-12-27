import { Observable } from 'rxjs';

import {
  PebFilterParams,
  PebIntegration,
  PebIntegrationAction,
  PebOrderParams,
  PebPaginationParams,
} from '@pe/builder-core';

export abstract class PebContextApi {
  abstract fetchIntegrations(): Observable<PebIntegration[]>;
  abstract fetchIntegrationAction(params: {
    integration: PebIntegration,
    action: PebIntegrationAction,
    id?: string,
    filter?: PebFilterParams,
    order?: PebOrderParams,
    pagination?: PebPaginationParams,
    data?: any,
  }): Observable<any>;
}
