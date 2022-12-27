import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { omit } from 'lodash';
import { Observable } from 'rxjs';

import { PebEnvService } from '@pe/builder-core';

import { PebPosApi } from './abstract.pos.api';
import { AccessConfigDto, IntegrationConnectInfoInterface, IntegrationInfoInterface, Terminal } from './interfaces';

export const PEB_POS_API_PATH = new InjectionToken<string>('PEB_POS_API_PATH');
export const PEB_BUILDER_POS_API_PATH = new InjectionToken<string>(
  'PEB_BUILDER_POS_API_PATH',
);
export const PEB_CONNECT_API_PATH = new InjectionToken<string>(
  'PEB_CONNECT_API_PATH',
);

@Injectable()
export class PebActualPosApi implements PebPosApi {
  constructor(
    @Inject(PEB_POS_API_PATH) private posApiPath: string,
    @Inject(PEB_BUILDER_POS_API_PATH) private builderPosApiPath: string,
    @Inject(PEB_CONNECT_API_PATH) private connectApiPath: string,
    private envService: PebEnvService,
    private http: HttpClient,
  ) {}

  private get businessId() {
    return this.envService.businessId;
  }

  private get terminalId() {
    return this.envService.terminalId;
  }

  getTerminalsList(isDefault?: boolean): Observable<Terminal[]> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/application`;

    return this.http.get<Terminal[]>(endpoint, {
      params: isDefault ? { isDefault: JSON.stringify(isDefault) } : null,
    });
  }

  getSingleTerminal(terminalId: string): Observable<Terminal> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/application/${terminalId}`;

    return this.http.get<Terminal>(endpoint);
  }

  createTerminal(payload: any): Observable<Terminal> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/application`;

    return this.http.post<Terminal>(endpoint, payload);
  }

  deleteTerminal(terminalId: string): Observable<null> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/application/${terminalId}`;

    return this.http.delete<null>(endpoint);
  }

  updateTerminal(payload: any): Observable<any> {
    const terminalId = payload.id;
    const body = omit(payload, ['id']);
    const endpoint = `${this.posApiPath}/business/${this.businessId}/application/${terminalId}`;

    return this.http.patch<any>(endpoint, body);
  }

  updateTerminalDeploy(
    accessId: string,
    payload: Partial<AccessConfigDto>,
  ): Observable<any> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/application/access/${accessId}`;

    return this.http.patch<any>(endpoint, payload);
  }

  getTerminalPreview(terminalId: string): Observable<any> {
    const endpoint = `${this.builderPosApiPath}/business/${this.businessId}/application/${terminalId}/preview`;

    return this.http.get<any>(endpoint);
  }

  markTerminalAsActive(terminalId: string): Observable<any> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/application/${terminalId}/active`;

    return this.http.patch<any>(endpoint, {});
  }

  getIntegrationsInfo(
    businessId: string,
  ): Observable<IntegrationInfoInterface[]> {
    return this.http.get<IntegrationInfoInterface[]>(
      `${this.posApiPath}/business/${businessId}/integration`,
    );
  }

  getIntegrationInfo(
    businessId: string,
    integration: string,
  ): Observable<IntegrationInfoInterface> {
    return this.http.get<IntegrationInfoInterface>(
      `${this.posApiPath}/business/${businessId}/integration/${integration}`,
    );
  }

  getConnectIntegrationInfo(
    integrationId: string,
  ): Observable<IntegrationConnectInfoInterface> {
    return this.http.get<IntegrationConnectInfoInterface>(
      `${this.connectApiPath}/integration/${integrationId}`,
    );
  }

  getTerminalEnabledIntegrations(
    businessId: string,
    terminalId: string,
  ): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.posApiPath}/business/${businessId}/application/${terminalId}/integration`,
    );
  }

  toggleTerminalIntegration(
    businessId: string,
    terminalId: string,
    integrationName: string,
    enable: boolean,
  ): Observable<void> {
    return this.http.patch<void>(
      `${
        this.posApiPath
      }/business/${businessId}/application/${terminalId}/integration/${integrationName}/${
        enable ? 'install' : 'uninstall'
      }`,
      {},
    );
  }

  getTerminalActiveTheme(terminalId: string): Observable<any> {
    return this.http.get<any>(
      `${this.builderPosApiPath}/business/${this.businessId}/application/${terminalId}/themes/active`,
    );
  }

  getTerminalThemes(terminalId: string, businessId: string): Observable<any[]> {
    return this.http.get<any>(
      `${this.builderPosApiPath}/business/${businessId}/application/${terminalId}/themes`,
    );
  }

  getTerminalThemeVersions(themeId: string): Observable<any[]> {
    return this.http.get<any>(
      `${this.builderPosApiPath}/theme/${themeId}/versions`,
    );
  }

  createTerminalThemeVersion(themeId: string, name: string): Observable<any> {
    return this.http.post<any>(
      `${this.builderPosApiPath}/theme/${themeId}/version`,
      { name },
    );
  }

  deleteTerminalThemeVersion(
    themeId: string,
    versionId: string,
  ): Observable<any> {
    return this.http.delete(
      `${this.builderPosApiPath}/theme/${themeId}/version/${versionId}`,
    );
  }

  publishTerminalThemeVersion(
    themeId: string,
    versionId: string,
  ): Observable<any> {
    return this.http.put(
      `${this.builderPosApiPath}/theme/${themeId}/version/${versionId}/publish`,
      {},
    );
  }

  instantSetup(): Observable<any> {
    return this.http.put(
      `${this.builderPosApiPath}/business/${this.businessId}/application/${this.terminalId}/instant-setup`,
      {},
    );
  }
}
