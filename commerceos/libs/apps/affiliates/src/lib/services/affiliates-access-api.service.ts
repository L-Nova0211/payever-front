import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';

import { PeAffiliatesRequestsErrorsEnum } from '../enums';
import { PeAffiliatesNetworkAccessInterface } from '../interfaces';
import { PE_ACCESS_API_PATH } from '../tokens';

import { PeErrorsHandlerService } from './errors-handler.service';

@Injectable()
export class PeAffiliatesAccessApiService {

  constructor(
    private httpClient: HttpClient,
    
    private pebEnvService: PebEnvService,

    @Inject(PE_ACCESS_API_PATH) private peAccessApiPath: string,
    private peErrorsHandlerService: PeErrorsHandlerService,
  ) { }

  private get networkAccessPath(): string {
    return `${this.peAccessApiPath}/business/${this.pebEnvService.businessId}/affiliates-branding/access`;
  }
  
  public getAccessConfig(networkId: string): Observable<PeAffiliatesNetworkAccessInterface> {
    return this.httpClient
      .get(`${this.networkAccessPath}/${networkId}`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.GetAccessConfig, error, true);

          return throwError(error);
        }));
  }

  public getLiveStatus(networkId: string): Observable<any> {
    return this.httpClient
      .get(`${this.networkAccessPath}/${networkId}/is-live`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.GetLiveStatus, error, true);

          return throwError(error);
        }));
  }
  
  public updateAccessConfig(
    networkId: string,
    configId: string,
    accessConfig: PeAffiliatesNetworkAccessInterface,
  ): Observable<any> {
    return this.httpClient
      .patch(`${this.networkAccessPath}/${networkId}/${configId}`, accessConfig)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.UpdateAccessConfig, error, true);

          return throwError(error);
        }));
  }
}
