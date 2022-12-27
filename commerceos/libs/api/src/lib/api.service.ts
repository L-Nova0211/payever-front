import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, mapTo, switchMap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { BusinessInterface } from '@pe/business';
import { EnvironmentConfigInterface, NodeJsBackendConfigInterface, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import {
  CreateUserAccountInterface,
  FeatureInterface,
  UserFilters,
  UserLogoInterface,
  SpotlightResp, ResponseUserAccountInterface,
} from './interfaces';

export interface IErrorAPIDetails {
  // TODO We don't use "I" prefix
  children: any[];
  constraints: {
    [key: string]: string;
  };
  property: string;
  value: string;
}

export interface IErrorAPIResponse {
  // TODO We don't use "I" prefix
  error: {
    errors: IErrorAPIDetails[];
    message: string;
    statusCode: number;
  };
  status: number;
  message: string;
}

export interface IndustryInterface {
  code: string;
  slug: string;
  defaultBusinessStatus?: string;
}

export interface ProductWithIndustriesInterface {
  code: string;
  industries: IndustryInterface[];
}

export interface BusinessRegistrationData {
  businessStatuses: string[];
  products: ProductWithIndustriesInterface[];
  statuses: string[];
}

export interface RegisterEmployeeAndConfirmBusinessBodyInterface {
  businessId?: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface TokensInterface {
  accessToken: string;
  refreshToken: string;
}

// TODO(@vberezin): remove it when new store for businessId and userData will be created
@Injectable({ providedIn:'root' })
export class ApiService {
  get config(): NodeJsBackendConfigInterface {
    return this.envConfig.backend;
  }

  constructor(
    private httpClient: HttpClient,
    @Inject(PE_ENV) private envConfig: EnvironmentConfigInterface,
    private translateService: TranslateService,
    private authService: PeAuthService,
  ) {}

  getUserLogo(email: string): Observable<UserLogoInterface> {
    const url = `${this.config.auth}/api/user-logo/${email}`;

    return this.httpClient.get<UserLogoInterface>(url).pipe(catchError((error: Response) => throwError(error)));
  }


  getSpotlightSearch(pattern: string, limit: number, businessId: string): Observable<SpotlightResp> {
    const url = `${this.config.spotlight}/api/business/${businessId}/spotlight/search`;
    let params = new HttpParams();
    params = params.append('query', pattern);

    return this.httpClient
    .get<SpotlightResp>(url, { params })
    .pipe(
      map(data => data),
      catchError((error: Response) => throwError(error)),
      );
  }


  getAdminSpotlightSearch(pattern: string): Observable<SpotlightResp> {
    const url = `${this.config.spotlight}/api/admin/spotlight/search`;
    let params = new HttpParams();
    params = params.append('query', pattern);

    return this.httpClient
    .get<SpotlightResp>(url, { params })
    .pipe(
      map(data => data),
      catchError((error: Response) => throwError(error)),
      );
  }



  getUsersByFilters(filters: UserFilters, limit: number): Observable<{ id: number }[]> {
    const url = `${this.config.auth}/api/users`;
    let params = new HttpParams();
    params = params.append('limit', limit.toString() || '100');
    if (filters.email) {
      params = params.append('filters[email]', filters.email);
    }

    if (filters.roles) {
      filters.roles.forEach(role => (params = params.append('filters[roles][]', role)));
    }

    return this.httpClient.get(url, { params }).pipe(catchError((error: Response) => throwError(error))) as Observable<
      { id: number }[]
    >;
  }

  getAppsData(businessId: string): Observable<any> {
    const url = `${this.config.commerceos}/api/apps/business/${businessId}`;

    return this.httpClient.get<any>(url).pipe(catchError((error: Response) => throwError(error)));
  }


  getPersonalWallpaper() {
    return this.httpClient.get(`${this.config.wallpapers}/api/personal/wallpapers`);
  }

  getUserAccount() {
    return this.httpClient.get(`${this.config.users}/api/user`).pipe(
      catchError((error: Response) => throwError(error)),
      map(user => user || {}),
    );
  }

  createUserAccount(data: CreateUserAccountInterface = {}): Observable<ResponseUserAccountInterface> {
    const url = `${this.config.users}/api/user`;

    return this.httpClient.post<ResponseUserAccountInterface>(url, data).pipe(
      catchError((errors: IErrorAPIResponse) => {
        return throwError(this.createErrorBag(errors));
      }),
    );
  }

  addBusinessToUser(userId: string, businessId: string): Observable<void> {
    const url = `${this.config.users}/api/user/${userId}/business/${businessId}`;

    return this.httpClient.patch<void>(url, businessId).pipe(
      catchError((errors: IErrorAPIResponse) => {
        return throwError(this.createErrorBag(errors));
      }),
    );
  }

  getBusinessesListWithParams(userIds: number[], query: string): Observable<any> {
    const url = `${this.config.users}/api/business`;
    let params = new HttpParams();
    params = params.append('admin', 'true');
    params = params.append('query', query);
    userIds.forEach(id => params = params.append('userIds[]', id.toString()));

    return this.httpClient.get(url, { params: params }).pipe(
      catchError((error: Response) => throwError(error)));
  }

  getBusinessProductWithIndustriesList(): Observable<ProductWithIndustriesInterface[]> {
    const url = `${this.config.commerceos}/api/business-products`;

    return this.httpClient
      .get<ProductWithIndustriesInterface[]>(url)
      .pipe(catchError((error: Response) => throwError(error)));
  }

  getBusinessRegistrationData(): Observable<BusinessRegistrationData> {
    const url = `${this.config.commerceos}/api/business-registration/form-data`;

    return this.httpClient.get<BusinessRegistrationData>(url).pipe(catchError((error: Response) => throwError(error)));
  }

  enableBusiness(businessId: string): Observable<any> {
    const url = `${this.config.auth}/api/business/${businessId}/enable`;

    return this.httpClient.patch<any>(url, {}).pipe(catchError((error: Response) => throwError(error)));
  }

  createCompany(data: any): Observable<BusinessInterface> {
    const url = `${this.config.users}/api/business`;

    return this.httpClient.post<BusinessInterface>(url, data).pipe(
      catchError((errors: IErrorAPIResponse) => {
        return throwError(this.createErrorBag(errors));
      }),
    );
  }

  registerUuid(businessId: string): Observable<any> {
    const url = `${this.config.auth}/api/${businessId}`;

    return this.httpClient.put<any>(url, {}).pipe(catchError((error: Response) => throwError(error)));
  }

  requestPasswordResetEmail(data: any): Observable<any> {
    const url = `${this.config.auth}/api/forgot`;

    return this.httpClient.post<any>(url, data);
  }

  resetPassword(data: any, token: string): Observable<any> {
    const url = `${this.config.auth}/api/reset/${token}`;

    return this.httpClient.post<any>(url, data);
  }

  verifyEmail(token: string): Observable<any> {
    const url = `${this.config.auth}/api/confirm/${token}`;

    return this.httpClient.post<any>(url, {}).pipe(catchError((error: Response) => throwError(error)));
  }

  toggleInstalledApp(businessId: string, microId:string, data: any): Observable<any> {
    const url = `${this.config.commerceos}/api/apps/business/${businessId}/toggle-installed/${microId}`;

    return this.httpClient.patch<any>(url, data).pipe(catchError((error: Response) => throwError(error)));
  }

  userToggleInstalledApp(microUuid: string, data: any): Observable<any> {
    const url = `${this.config.commerceos}/api/apps/user/toggle-installed/${microUuid}`;

    return this.httpClient.patch<any>(url, data).pipe(catchError((error: Response) => throwError(error)));
  }

  inviteDataEmployee(
    businessId: string,
    employeeId: string
  ): Observable<{isRegistered: boolean, isVerifiedToBusiness: boolean}> {
    const url = `${this.config.auth}/api/employees/invite-data/${businessId}/${employeeId}`;

    return this.httpClient.get<{isRegistered: boolean, isVerifiedToBusiness: boolean}>(url);
  }

  verifyEmployee(token: string): Observable<{isValid: boolean}> {
    const url = `${this.config.auth}/api/employees/verify?token=${token}`;

    return this.httpClient.get<{isValid: boolean}>(url);
  }

  registerEmployeeAndConfirmBusiness(
    id: string,
    businessId: string,
    email: string,
    body: RegisterEmployeeAndConfirmBusinessBodyInterface,
  ): Observable<void> {
    const url = `${this.config.auth}/api/employees/confirm/${id}`;

    return this.httpClient.patch<TokensInterface>(url, body).pipe(
      switchMap((tokens: TokensInterface) => this.authService.setTokens(tokens)),
      switchMap((res: any) => {
        return this.enableBusiness(businessId)
        .pipe(
          switchMap((res) => {
            return this.authService.setTokens({
              accessToken: res.accessToken,
              refreshToken: res.refreshToken,
            });
            }
          ),
        );
      }),
      switchMap(() => {
        return this.createUserAccount();
      }),
      switchMap((res: any) => {
        return this.addBusinessToUser(res._id, businessId).pipe(mapTo(null));
      }),
    );
  }

  confirmBusinessForEmployee(businessId: string, employeeId: string): Observable<void> {
    const url = `${this.config.auth}/api/employees/confirm/${businessId}/${employeeId}`;

    return this.httpClient.post<void>(url, {});
  }

  getSubscriptionInfo(appName: string): Observable<FeatureInterface> {
    if (!this.config[appName]) {
      console.error('Cant get subscription info', appName);
    }
    const url = `${this.config[appName]}/api/subscriptions/features`;

    return this.httpClient.get<FeatureInterface>(url);
  }

  startTrial(appName: string, businessId: string): Observable<void> {
    const url = `${this.config[appName]}/api/subscriptions/trials/${businessId}`;

    return this.httpClient.post<void>(url, {
      appName,
    });
  }

  logout(): Observable<void> {
    const url = `${this.config.auth}/api/logout`;

    return this.httpClient.post<void>(url, {});
  }

  private createErrorBag(errors: IErrorAPIResponse): any {
    const result: any = {
      errorBag: {},
    };

    switch (errors.status) {
      case 401:
        result.errorBag['email'] = this.translateService.translate('forms.error.unauthorized.invalid_credentials');
        result.errorBag['plainPassword'] = this.translateService.translate(
          'forms.error.unauthorized.invalid_credentials',
        );
        break;
      case 400:
        const errorList: any = errors.error.errors;
        if (errorList) {
          const errorBag: any = result.errorBag;
          if (errorList instanceof Array) {
            errorList.forEach((paramError: any) => {
              const errorText: string = Object.keys(paramError.constraints).reduce(
                (res, key) => res + paramError.constraints[key],
                '',
              );

              errorBag[paramError.property] = this.translateService.translate(errorText);
            });
          } else {
            Object.keys(errorList).forEach((key) => {
              const keyVal: any = errorList[key];
              if (keyVal && keyVal.message) {
                errorBag[key] = this.translateService.translate(keyVal.message);
              }
            });
          }
        }
        break;
      default:
    }

    if (errors.error.message) {
      result['message'] = errors.error.message;
    }

    return result;
  }
}
