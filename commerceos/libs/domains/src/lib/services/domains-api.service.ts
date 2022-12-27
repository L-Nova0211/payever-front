import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';

import { PeDomainsApplicationsEnum, PeDomainsRequestsErrorsEnum } from '../enums';
import { PE_DOMAINS_API_PATH } from '../tokens';

import { PeErrorsHandlerService } from './errors-handler.service';

@Injectable()
export class PeDomainsApiService {

  constructor(
    private httpClient: HttpClient,

    private pebEnvService: PebEnvService,

    @Inject(PE_DOMAINS_API_PATH) private peDomainsApiPath: string,
    private peErrorsHandlerService: PeErrorsHandlerService,
  ) { }

  private get domainsPath(): string {
    return `${this.peDomainsApiPath}/api/business/${this.pebEnvService.businessId}`;
  }

  private get applicationPath(): string {
    const applicationId = this.pebEnvService.applicationId;
    const applicationKey = Object.keys(PeDomainsApplicationsEnum)
      .find((appKey) => this.domainsPath.includes(appKey.toLowerCase()));
    const application = PeDomainsApplicationsEnum[applicationKey];
    const path = application === PeDomainsApplicationsEnum.Subscription
    || application === PeDomainsApplicationsEnum.Affiliates
    || application === PeDomainsApplicationsEnum.Appointments
      ? `domain/${applicationId}`
      : `${application}/${applicationId}/domain`;

    return `${this.domainsPath}/${path}`;
  }

  public addDomain(domainName: string): Observable<any> {
    return this.httpClient
      .post<any>(`${this.applicationPath}`, { name: domainName })
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeDomainsRequestsErrorsEnum.AddDomain, error, true);

          return throwError(error);
        }));
  }

  public checkDomain(domainId: string): Observable<any> {
    return this.httpClient
      .post(`${this.applicationPath}/${domainId}/check`, { })
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeDomainsRequestsErrorsEnum.CheckDomain, error, true);

          return throwError(error);
        }));
  }

  public deleteDomain(domainId: string): Observable<any> {
    return this.httpClient
      .delete<any>(`${this.applicationPath}/${domainId}`)
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeDomainsRequestsErrorsEnum.DeleteDomain, error, true);

          return throwError(error);
        }));
  }

  public getAllDomains(): Observable<any[]> {
    return this.httpClient
      .get<any[]>(`${this.applicationPath}`)
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeDomainsRequestsErrorsEnum.GetAllDomains, error, true);

          return throwError(error);
        }));
  }

  public updateDomain(domainId: string, domainName: string): Observable<any> {
    return this.httpClient
      .post<any>(`${this.applicationPath}/${domainId}`, { name: domainName })
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeDomainsRequestsErrorsEnum.UpdateDomain, error, true);

          return throwError(error);
        }));
  }

  public validDomain(domainName: string): Observable<any> {
    const params = new HttpParams().append('name', domainName);

    return this.httpClient
      .get<any>(`${this.applicationPath}/isValidName`, { params })
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeDomainsRequestsErrorsEnum.ValidDomain, error, true);

          return throwError(error);
        }));
  }
}
