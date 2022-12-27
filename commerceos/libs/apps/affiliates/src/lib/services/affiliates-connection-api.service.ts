import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { PeListSectionIntegrationInterface } from '@pe/ui';

import { PeAffiliatesRequestsErrorsEnum } from '../enums';
import { PE_AFFILIATES_API_PATH } from '../tokens';

import { PeErrorsHandlerService } from './errors-handler.service';

@Injectable()
export class PeAffiliatesConnectionApiService {

  constructor(
    private httpClient: HttpClient,
    
    private pebEnvService: PebEnvService,

    @Inject(PE_AFFILIATES_API_PATH) private peAffiliatesApiPath: string,
    private peErrorsHandlerService: PeErrorsHandlerService,
  ) { }

  private get connectionPath(): string {
    return `${this.peAffiliatesApiPath}/business/${this.pebEnvService.businessId}/connection`;
  } 

  public getConnections(): Observable<PeListSectionIntegrationInterface[]> {
    return this.httpClient.get(this.connectionPath)
      .pipe(
        map((methods: any) => methods
          .map((method: any): PeListSectionIntegrationInterface => {
            return {
              _id: method._id,
              category: method.integration.category,
              disabled: false,
              enabled: method.isEnabled,
              icon: method.integration.displayOptions.icon,
              title: method.integration.displayOptions.title,
            };
          })),
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.GetConnections, error, true);

          return throwError(error);
        }));
  }

  public installConnection(connectionId: string): Observable<any> {
    return this.httpClient
      .patch(`${this.connectionPath}/${connectionId}/install`, {})
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.InstallConnection, error, true);

          return throwError(error);
        }));
  }

  public uninstallConnection(connectionId: string): Observable<any> {
    return this.httpClient
      .patch(`${this.connectionPath}/${connectionId}/uninstall`, {})
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeAffiliatesRequestsErrorsEnum.UninstallConnection, error, true);

          return throwError(error);
        }));
  }

  public getIntegrations() {
    return this.httpClient.get(`${this.peAffiliatesApiPath}/integration`);
  }
}
