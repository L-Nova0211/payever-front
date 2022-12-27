import { Observable } from 'rxjs';

import { IntegrationConnectInfoInterface, IntegrationInfoInterface, Terminal } from './interfaces';

type PebPosThemeSnapshot = any;
type PebPos = any;

export interface PosPreviewDTO {
  current: PebPosThemeSnapshot;
  published: null|PebPos;
}

export abstract class PebPosApi {
  abstract getTerminalsList(isDefault?: boolean): Observable<Terminal[]>;

  abstract getSingleTerminal(terminalId: string): Observable<Terminal>;

  abstract createTerminal(payload: any): Observable<Terminal>;

  abstract deleteTerminal(terminalId: string): Observable<null>;

  abstract updateTerminal(payload: any): Observable<Terminal>;

  abstract updateTerminalDeploy(terminalId: string, payload: any): Observable<any>;

  abstract getTerminalPreview(terminalId: string, include?: string[]): Observable<PosPreviewDTO>;

  abstract markTerminalAsActive(terminalId: string): Observable<any>;

  abstract markTerminalAsActive(terminalId: string): Observable<any>;

  abstract getIntegrationsInfo(businessId: string): Observable<IntegrationInfoInterface[]>;

  abstract getIntegrationInfo(businessId: string, integration: string): Observable<IntegrationInfoInterface>;

  abstract getConnectIntegrationInfo(integrationId: string): Observable<IntegrationConnectInfoInterface>;

  abstract getTerminalEnabledIntegrations(businessId: string, terminalId: string): Observable<string[]>;

  abstract toggleTerminalIntegration(
    businessId: string,
    terminalId: string,
    integrationName: string,
    enable: boolean,
  ): Observable<void>;

  abstract getTerminalActiveTheme(terminalId: string, businessId: string): Observable<any>;

  abstract getTerminalThemeVersions(terminalId: any): Observable<any[]>;

  abstract createTerminalThemeVersion(terminalId: any, name: string): Observable<any>;

  abstract deleteTerminalThemeVersion(terminalId: any, versionId: any): Observable<any>;

  abstract publishTerminalThemeVersion(terminalId: any, versionId: any): Observable<any>;

  abstract instantSetup(): Observable<any>;
}
