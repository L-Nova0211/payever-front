import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';

import { PeAppointmentsRequestsErrorsEnum } from '../enums';
import { PeAppointmentsNetworkInterface } from '../interfaces';
import { PE_APPOINTMENTS_API_PATH } from '../tokens';

import { PeErrorsHandlerService } from './errors-handler.service';

@Injectable()
export class PeAppointmentsNetworksApiService {
  constructor(
    private httpClient: HttpClient,

    private pebEnvService: PebEnvService,

    @Inject(PE_APPOINTMENTS_API_PATH) private peAppointmentsApiPath: string,
    private peErrorsHandlerService: PeErrorsHandlerService,
  ) { }

  private get businessId(): string {
    return this.pebEnvService.businessId;
  }

  private get businessPath(): string {
    return `${this.peAppointmentsApiPath}/api/business/${this.businessId}`;
  }

  private get networksPath(): string {
    return `${this.businessPath}/appointment-network`;
  }

  // Networks
  public getNetwork(networkId: string): Observable<PeAppointmentsNetworkInterface> {
    return this.httpClient
      .get<PeAppointmentsNetworkInterface>(`${this.networksPath}/${networkId}`)
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.GetNetwork, error);

          return throwError(error);
        }));
  }

  public getNetworks(): Observable<PeAppointmentsNetworkInterface[]> {
    return this.httpClient
      .get<PeAppointmentsNetworkInterface[]>(this.networksPath)
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.GetNetworks, error);

          return throwError(error);
        }));
  }

  public createNetwork(
    network: PeAppointmentsNetworkInterface,
  ): Observable<PeAppointmentsNetworkInterface> {
    return this.httpClient
      .post<PeAppointmentsNetworkInterface>(this.networksPath, network)
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.CreateNetwork, error);

          return throwError(error);
        }));
  }

  public deleteNetwork(networkId: string): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.networksPath}/${networkId}`)
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.DeleteNetwork, error);

          return throwError(error);
        }));
  }

  public updateNetwork(
    networkId: string,
    network: PeAppointmentsNetworkInterface,
  ): Observable<PeAppointmentsNetworkInterface> {
    return this.httpClient
      .patch<PeAppointmentsNetworkInterface>(`${this.networksPath}/${networkId}`, network)
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.UpdateNetwork, error);

          return throwError(error);
        }));
  }

  public getDefaultNetwork(): Observable<PeAppointmentsNetworkInterface> {
    return this.httpClient
      .get<PeAppointmentsNetworkInterface>(`${this.networksPath}/default`)
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.GetDefaultNetwork, error);

          return throwError(error);
        }));
  }

  public setNetworkAsDefault(networkId: string): Observable<PeAppointmentsNetworkInterface> {
    return this.httpClient
      .patch<PeAppointmentsNetworkInterface>(
        `${this.networksPath}/${networkId}/default`,
        {},
      )
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.SetDefaultNetwork, error);

          return throwError(error);
        }));
  }

  public validateNetworkName(networkName: string): Observable<any> {
    return this.httpClient
      .get<any>(`${this.networksPath}/isValidName?name=${networkName}`)
      .pipe(
        catchError((error) => {
          return throwError(error);
        }));
  }
}
