import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvironmentConfigInterface as EnvInterface, EnvService, PE_ENV } from '@pe/common';

import { PEB_POS_API_PATH } from '../../constants/constants';
import {
  IntegrationConnectInfoInterface, IntegrationInfoInterface, PebPosAccessConfig, Pos, PosAccessConfig, PosCreate,
} from '../pos.types';

import { PosApi } from './abstract.pos.api';
import { PosEnvService } from './pos-env.service';


@Injectable()
export class ActualPosApi implements PosApi {

  constructor(
    private http: HttpClient,
    @Inject(PE_ENV) private env: EnvInterface,
    @Inject(EnvService) private envService: PosEnvService,
    @Inject(PEB_POS_API_PATH) private posApiPath: string,
  ) {}

  private get businessId() {
    return this.envService.businessId;
  }

  private get posId() {
    return this.envService.posId;
  }

  getPosList(): Observable<Pos[]> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal`;

    return this.http.get<Pos[]>(endpoint);
  }

  getSinglePos(posId: string): Observable<Pos> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal/${posId}`;

    return this.http.get<Pos>(endpoint);
  }

  createPos(payload: PosCreate): Observable<PosCreate> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal`;

    return this.http.post<PosCreate>(endpoint, payload);
  }

  validatePosName(name: string): Observable<any> {
    const endpoint = `${this.posApiPath}/business/${this.envService.businessId}/terminal/isValidName?name=${name}`;

    return this.http.get(endpoint);
  }

  deletePos(posId: string): Observable<null> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal/${posId}`;

    return this.http.delete<null>(endpoint);
  }

  updatePos(posId: string, payload: PosCreate): Observable<PosCreate> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal/${posId}`;

    return this.http.patch<PosCreate>(endpoint, payload);
  }

  markPosAsDefault(posId: string): Observable<Pos> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal/${posId}/active`;

    return this.http.patch<Pos>(endpoint, {});
  }

  updatePosDeploy(posId: string, payload: PosAccessConfig): Observable<PosAccessConfig> {
    const endpoint = `${this.posApiPath}/business/${this.businessId}/terminal/access/${posId}`;

    return this.http.patch<PosAccessConfig>(endpoint, payload);
  }

  updatePosAccessConfig(posId: string, payload: Partial<PebPosAccessConfig>): Observable<PebPosAccessConfig> {
    return this.http.patch<PebPosAccessConfig>(
      `${this.posApiPath}/business/${this.envService.businessId}/terminal/access/${posId}`,
      payload,
    );
  }

  checkIsLive(posId: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.posApiPath}/business/${this.envService.businessId}/terminal/access/${posId}/is-live`,
    );
  }

  patchIsLive(posId: string, isLive: boolean): Observable<null> {
    return this.http.patch<null>(
      `${this.posApiPath}/business/${this.envService.businessId}/terminal/access/${posId}`,
      { isLive },
    );
  }

  addSocialImage(accessId: string, image: string) {
    return this.http.patch(
      `${this.posApiPath}/business/${this.envService.businessId}/terminal/access/${accessId}`,
      { socialImage: image },
    );
  }

  instantSetup() {
    return this.http.put(`${this.posApiPath}/business/${this.businessId}/terminal/${this.posId}/instant-setup`, {});
  }

  getIntegrationsInfo(businessId: string):  Observable<IntegrationInfoInterface[]> {
    return this.http.get<IntegrationInfoInterface[]>(`${this.posApiPath}/business/${businessId}/integration`);
  }

  getIntegrationInfo(businessId: string, integration: string): Observable<IntegrationInfoInterface> {
    return this.http.get<IntegrationInfoInterface>(
      `${this.posApiPath}/business/${businessId}/integration/${integration}`);
  }

  getConnectIntegrationInfo(integrationId: string): Observable<IntegrationConnectInfoInterface> {
    return this.http.get<IntegrationConnectInfoInterface>(
      `${this.env.backend.connect}/api/integration/${integrationId}`);
  }

  getTerminalEnabledIntegrations(businessId: string, terminalId: string) {
    return this.http.get(`${this.posApiPath}/business/${businessId}/terminal/${terminalId}/integration`);
  }

  toggleTerminalIntegration(businessId: string, terminalId: string, integrationName: string, enable: boolean) {
    return this.http.patch(
      `${this.posApiPath}/business/${businessId}/terminal/${terminalId}`
     + `/integration/${integrationName}/${enable ? 'install' : 'uninstall'}`, {});
  }
}
