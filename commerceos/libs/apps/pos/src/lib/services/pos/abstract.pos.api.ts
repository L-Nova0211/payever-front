import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IntegrationConnectInfoInterface, IntegrationInfoInterface, PebPosAccessConfig } from '../pos.types';

@Injectable()
export abstract class PosApi {

  abstract getPosList(isDefault?: boolean): Observable<any[]>;

  abstract getSinglePos(posId: string): Observable<any>;

  abstract createPos(payload: any): Observable<any>;

  abstract validatePosName(name: string): Observable<any>;

  abstract deletePos(posId: string): Observable<null>;

  abstract updatePos(posId: string, payload: any): Observable<any>;

  abstract markPosAsDefault(posId: string): Observable<any>;

  abstract updatePosAccessConfig(
    posId: string,
    payload: Partial<PebPosAccessConfig>,
  ): Observable<PebPosAccessConfig>;

  abstract checkIsLive(posId: string): Observable<boolean>;

  abstract updatePosDeploy(posId: string, payload: any): Observable<any>;

  abstract patchIsLive(posId: string, isLive: boolean): Observable<null>;

  abstract addSocialImage(accessId: string, image: string): Observable<any>;

  abstract instantSetup(): Observable<any>;

  abstract getIntegrationsInfo(businessId: string): Observable<IntegrationInfoInterface[]>;

  abstract getIntegrationInfo(businessId: string, integration: string): Observable<IntegrationInfoInterface>;

  abstract getConnectIntegrationInfo(integrationId: string): Observable<IntegrationConnectInfoInterface>;

  abstract getTerminalEnabledIntegrations(businessId: string, terminalId: string): Observable<any>;

  abstract toggleTerminalIntegration(businessId: string, terminalId: string, integrationName: string, enable: boolean):
  Observable<any>;
}
