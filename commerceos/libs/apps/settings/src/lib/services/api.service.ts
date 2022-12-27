import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { UserAccountInterface } from '@pe/shared/user';

import { IGroupItemInterface, IGroupsInterface } from '../components/employees/interfaces/employee-group.interface';
import {
  AppInterface,
  BusinessEmployeesGroupInterface,
  BusinessInterface, EmployeeInterface,
  NewBusinessEmployeeInterface,
  NewBusinessEmployeesGroupInterface,
  PaginationResponseInterface,
  PoliciesTypes,
  PolicyInterface, ReportTaskInterface, UserReportSettingsInterface,
} from '../misc/interfaces';
import { BusinessEmployeeInterface } from '../misc/interfaces/business-employees/business-employee.interface';

// TODO All http request errors have to be handled by interceptor

export interface ProductWithIndustriesInterface {
  code: string;
  industries: Array<{
    code: string,
  }>;
}

export interface ErrorAPIDetails {
  children: any[];
  constraints: {
    [key: string]: string,
  };
  property: string;
  value: string;
}

export interface ErrorAPIResponse {
  error: {
    errors: ErrorAPIDetails[]
    message: string
    statusCode: number,
  };
  status: number;
  message: string;
}

export interface WallpaperDataInterface {
  _id?: string;
  wallpaper: string;
  theme?: string;
  name?: string;
  industry?: string;
}

export interface BusinessWallpapersInterface {
  _id: string;
  myWallpapers: WallpaperDataInterface[];
  business: string;
  currentWallpaper: WallpaperDataInterface;
  type: string;
  industry: string;
  product: string;
}

export interface PersonalWallpapersInterface {
  user: string;
  myWallpapers: WallpaperDataInterface[];
  currentWallpaper: WallpaperDataInterface;
}

export interface BusinessProductIndustryWallpaperInterface {
  code: string;
  folder?: string;
  wallpapers: WallpaperDataInterface[];
  _id?: string;
}

export interface BusinessProductWallpaperInterface {
  code: string;
  order: number;
  industries: BusinessProductIndustryWallpaperInterface[];
  _id: string;
  icon?: string;
}

export type UserBusinessInterface = Pick<BusinessInterface, '_id' | 'name' | 'active'>;

export interface UsersBusinessListInterface {
  businesses: UserBusinessInterface[];
  total: number;
}

@Injectable()
export class ApiService {
  constructor(
    private http: HttpClient,
    @Inject(PE_ENV) private env: any,
    // private configService: EnvironmentConfigService,
    // private snackBarService: SnackBarService,
    private translateService: TranslateService,
  ) { }

  sendOwnershipInvite(businessId: string, data: { email: string }): Observable<any> {
    return this.http.post<{ email: string }>(
      `${this.env.backend.users}/api/business/${businessId}/send-ownership-invite`,
      data
    );
  }

  getUserAccount(): Observable<UserAccountInterface> {
    const config = this.env.backend;

    return this.http.get<UserAccountInterface>(`${config.users}/api/user`);
  }

  updateUserAccount(newData): Observable<Object> {
    const config = this.env.backend;

    return this.http.patch(`${config.users}/api/user`, newData);
  }

  deleteUserAccount(userId: string): Observable<Object> {
    const config = this.env.backend;

    return this.http.delete(`${config.users}/api/user/${userId}`);
  }

  // business
  getBusiness(businessId: string): Observable<BusinessInterface> {
    const config = this.env.backend;
    const url = `${config.users}/api/business/${businessId}`;

    // TODO his pipe does not make sense.
    return this.http.get<BusinessInterface>(url).pipe(
      catchError((error: Response) => {
        this.handleError(error);

        return throwError(error);
      },
      ));
  }

  getBusinessList(): Observable<UsersBusinessListInterface> {
    const config = this.env.backend;

    return this.http.get<UsersBusinessListInterface>(`${config.users}/api/business`);
  }

  getCurrencyList(): any {
    const config = this.env.backend;

    return this.http.get(`${config.common}/api/currency/list`);
  }

  getBusinessDetails(businessId: string): any {
    const config = this.env.backend;

    return this.http.get(`${config.users}/api/business/${businessId}/detail`);
  }

  getBusinessTaxes(businessId: string): any {
    const config = this.env.backend;

    return this.http.get(`${config.users}/api/business/${businessId}/taxes`);
  }

  getBusinessDocuments(businessId: string): any {
    const config = this.env.backend;

    return this.http.get(`${config.users}/api/business/${businessId}/documents`);
  }

  deleteBusiness(id: string): Observable<Object> {
    const config = this.env.backend;

    return this.http.delete(`${config.users}/api/business/${id}`);
  }

  getBusinessApps(businessId: string): Observable<AppInterface[]> {
    const config = this.env.backend;

    return this.http.get<AppInterface[]>(`${config.commerceos}/api/apps/business/${businessId}`);
  }

  toggleInstalledApp(businessId: string, microUid: string): Observable<void> {
    const config = this.env.backend;
    const url = `${config.commerceos}/api/apps/business/${businessId}/toggle-installed/${microUid}`;
    const payload = {
      installed: true,
      setupStatus: 'completed',
    };

    return this.http.patch<void>(url, payload);
  }

  // business employees
  getBusinessEmployeeGroupList(businessId: string, limit = 20, page = 1): Observable<IGroupsInterface> {
    const config = this.env.backend;
    const url = `${config.users}/api/employee-groups/${businessId}`;
    const params = new HttpParams().set('limit', `${limit}`).set('page', `${page}`);

    return this.http.get<IGroupsInterface>(url, { params });
  }

  createBusinessEmployeeGroup(
    businessId: string,
    group: NewBusinessEmployeesGroupInterface
  ): Observable<BusinessEmployeesGroupInterface> {
    const config = this.env.backend;
    const url = `${config.users}/api/employee-groups/${businessId}`;

    return this.http.post<BusinessEmployeesGroupInterface>(url, group);
  }

  updateBusinessEmployeeGroup(
    businessId: string,
    group: NewBusinessEmployeesGroupInterface,
    groupId: string
  ): Observable<BusinessEmployeesGroupInterface> {
    const config = this.env.backend;
    const url = `${config.users}/api/employee-groups/${businessId}/${groupId}`;

    return this.http.patch<BusinessEmployeesGroupInterface>(url, group);
  }

  createBusinessEmployeeInGroup(
    businessId: string,
    groupId: string,
    employees: string[]
  ): Observable<IGroupItemInterface> {
    const config = this.env.backend;
    const url = `${config.users}/api/employee-groups/${businessId}/${groupId}/add-employees`;

    return this.http.post<IGroupItemInterface>(url, { employees });
  }

  getBusinessEmployeeGroup(businessId: string, groupId: string) {
    const config = this.env.backend;
    const url = `${config.users}/api/employee-groups/${businessId}/${groupId}`;

    return this.http.get(url);
  }

  deleteEmployeeGroup(businessId: string, groupId: string) {
    const config = this.env.backend;
    const url = `${config.users}/api/employee-groups/${businessId}/${groupId}`;

    return this.http.delete<any>(url);
  }

  deleteEmployeeFromGroup(businessId: string, groupId: string, employees: string[]) {
    const config = this.env.backend;
    const url = `${config.users}/api/employee-groups/${businessId}/${groupId}/remove-employees`;

    return this.http.post<any>(url, { employees });
  }

  getBusinessEmployeeList(businessId: string): Observable<PaginationResponseInterface<BusinessEmployeeInterface>> {
    const config = this.env.backend;
    const url = `${config.users}/api/employees/${businessId}`;
    const params = new HttpParams().set('limit', '100').set('page', '1');

    return this.http.get<PaginationResponseInterface<BusinessEmployeeInterface>>(url, { params });
  }

  getBusinessEmployeeAclsAndPositions(businessId: string, employeeId: string): Observable<any> {
    const config = this.env.backend;
    const url = `${config.auth}/api/employees/business/${businessId}/get-acls/${employeeId}`;

    return this.http.get<any>(url);
  }

  getBusinessGroupAcls(businessId: string, groupId: string): Observable<any> {
    const config = this.env.backend;
    const url = `${config.auth}/api/employees/groups/get-acls/${groupId}`;

    return this.http.get<any>(url);
  }

  getBusinessEmployeeFolders(businessId) {
    const config = this.env.backend;
    const url = `${config.users}/api/business/${businessId}/folders`;

    return this.http.get(url);
  }

  getBusinessEmployeeByUser(businessId: string, userId: string): Observable<BusinessEmployeeInterface> {
    const config = this.env.backend;

    return this.http.get<BusinessEmployeeInterface>(`${config.users}/api/employees/${businessId}/user/${userId}`);
  }

  createBusinessEmployee(
    businessId: string,
    newEmployee: NewBusinessEmployeeInterface
  ): Observable<BusinessEmployeeInterface> {
    const config = this.env.backend;
    const url = `${config.users}/api/employees/${businessId}`;

    return this.http.post<BusinessEmployeeInterface>(url, newEmployee);
  }

  postUpdateBusinessEmployee(
    businessId: string,
    employeeId: string,
    newEmployee: any
  ) {
    const config = this.env.backend;
    const url = `${config.auth}/api/employees/business/${businessId}/employee/${employeeId}`;

    return this.http.post<BusinessEmployeeInterface>(url, newEmployee);
  }

  updateBusinessEmployee(
    businessId: string,
    employeeId: string,
    employee: NewBusinessEmployeeInterface
  ): Observable<BusinessEmployeeInterface> {
    const config = this.env.backend;
    const url = `${config.users}/api/employees/${businessId}/${employeeId}`;

    return this.http.patch<BusinessEmployeeInterface>(url, employee);
  }

  deleteBusinessEmployee(businessId: string, employeeId: string): Observable<BusinessEmployeeInterface> {
    const config = this.env.backend;
    const url = `${config.users}/api/employees/${businessId}/${employeeId}`;

    return this.http.delete<BusinessEmployeeInterface>(url);
  }

  // wallpapers
  getGalleryWallpapers(): Observable<BusinessProductWallpaperInterface[]> {
    const config = this.env.backend;

    return this.http.get<BusinessProductWallpaperInterface[]>(`${config.wallpapers}/api/products/wallpapers`);
  }

  getAllWallpapers(page, limit): Observable<WallpaperDataInterface[]> {
    const config = this.env.backend;
    const params = new HttpParams().set('limit', `${limit}`).set('page', `${page}`);

    return this.http.get<WallpaperDataInterface[]>(`${config.wallpapers}/api/products/wallpapers/all`, { params });
  }

  getWallpaperTree(): Observable<BusinessProductWallpaperInterface[]> {
    const config = this.env.backend;

    return this.http.get<BusinessProductWallpaperInterface[]>(`${config.wallpapers}/api/products/wallpapers/tree`);
  }

  getWallpapersByCode(code: string, page, limit): Observable<WallpaperDataInterface[]> {
    const config = this.env.backend;
    const params = new HttpParams().set('limit', `${limit}`).set('page', `${page}`);

    return this.http.get<WallpaperDataInterface[]>(
      `${config.wallpapers}/api/products/wallpapers/byId/${code}`,
      { params }
    );
  }

  searchWallpaper(searchItems, page, limit, id = null): Observable<WallpaperDataInterface[]> {
    const body = {
      id,
      conditions: searchItems,
    };

    const config = this.env.backend;

    return this.http.post<WallpaperDataInterface[]>(
      `${config.wallpapers}/api/products/wallpapers/search?page=${page}&limit=${limit}`,
      body,
    );
  }

  getMyPersonalWallpapers(): Observable<PersonalWallpapersInterface> {
    const config = this.env.backend;

    return this.http.get(`${config.wallpapers}/api/personal/wallpapers`).pipe(catchError(() => of({} as any)));
  }

  getMyBusinessWallpapers(businessId: string): Observable<BusinessWallpapersInterface> {
    const config = this.env.backend;

    return this.http.get<BusinessWallpapersInterface>(`${config.wallpapers}/api/business/${businessId}/wallpapers`);
  }

  // TODO: SETF-368: remove next methods if they won't required
  getBusinessProductWithIndustriesList(): Observable<ProductWithIndustriesInterface[]> {
    const config = this.env.backend;
    const url = `${config.commerceos}/api/business-products`;

    // TODO his pipe does not make sense.
    return this.http.get<ProductWithIndustriesInterface[]>(url).pipe(
      catchError((error: Response) => {
        this.handleError(error);

        return throwError(error);
      },
    ));
  }

  updateBusinessData(id: string, newData: any): Observable<BusinessInterface> {
    const config = this.env.backend;

    return this.http.patch<BusinessInterface>(`${config.users}/api/business/${id}`, newData).pipe(
      catchError((error: ErrorAPIResponse) => {
        this.handleError(error, true);

        return throwError(this.createErrorBag(error));
      }),
    );
  }

  updateBusinessWallpapers(businessId: string, newData: any): Observable<Object> {
    const config = this.env.backend;

    return this.http.patch(`${config.users}/api/business/${businessId}`, newData).pipe(
      catchError((error: ErrorAPIResponse) => {
        this.handleError(error, true);

        return throwError(this.createErrorBag(error));
      }),
    );
  }

  updatePassword(newPassword): Observable<Object> {
    const config = this.env.backend;

    return this.http.post(`${config.auth}/api/update`, newPassword);
  }

  getTwoFactorSettings(): Observable<boolean> {
    const config = this.env.backend;

    return this.http.get<any>(`${config.auth}/api/user`, {}).pipe(
      map(data => data.secondFactorRequired),
      shareReplay(1),
    );
  }

  setTwoFactorSettings(secondFactorRequired: boolean): Observable<Object> {
    const config = this.env.backend;

    return this.http.patch(`${config.auth}/api/user`, { secondFactorRequired });
  }

  setBusinessWallpaper(businessId: string, wallpaper: WallpaperDataInterface): Observable<Object> {
    const config = this.env.backend;

    return this.http.post(`${config.wallpapers}/api/business/${businessId}/wallpapers/active`, wallpaper);
  }

  setPersonalWallpaper(wallpaper: WallpaperDataInterface): Observable<Object> {
    const config = this.env.backend;

    return this.http.post(`${config.wallpapers}/api/personal/wallpapers/active`, wallpaper);
  }

  resetBusinessWallpaper(businessId: string): Observable<void> {
    const config = this.env.backend;

    return this.http.delete<void>(`${config.wallpapers}/api/business/${businessId}/wallpapers/active`);
  }

  resetPersonalWallpaper(): Observable<void> {
    const config = this.env.backend;

    return this.http.delete<void>(`${config.wallpapers}/api/personal/wallpapers/active`);
  }

  addBusinessWallpaper(businessId: string, data: WallpaperDataInterface): Observable<Object> {
    const config = this.env.backend;

    return this.http.post(`${config.wallpapers}/api/business/${businessId}/wallpapers`, data);
  }

  addPersonalWallpaper(data: WallpaperDataInterface): Observable<Object> {
    const config = this.env.backend;

    return this.http.post(`${config.wallpapers}/api/personal/wallpapers`, data);
  }

  deleteBusinessWallpaper(businessId: string, wallpaper: string): Observable<Object> {
    const config = this.env.backend;

    return this.http.delete(`${config.wallpapers}/api/business/${businessId}/wallpapers/${wallpaper}`);
  }

  deletePersonalWallpaper(wallpaper: string): Observable<Object> {
    const config = this.env.backend;

    return this.http.delete(`${config.wallpapers}/api/personal/wallpapers/${wallpaper}`);
  }

  getAppsEmailNotifications(businessId: string) {
    const config = this.env.backend;

    return this.http.get(`${config.mailerReport}/api/business/${businessId}/report-task`);
  }

  getUserReportSettings() {
    const config = this.env.backend;

    return this.http.get(`${config.mailerReport}/api/user/report-settings`);
  }

  updateAppsEmailNotifications(businessId: string, reportTask: ReportTaskInterface) {
    const config = this.env.backend;

    return this.http.patch(`${config.mailerReport}/api/business/${businessId}/report-task`, reportTask);
  }

  updateUserReportSettings(reportTask: UserReportSettingsInterface) {
    const config = this.env.backend;

    return this.http.patch(`${config.mailerReport}/api/user/report-settings`, reportTask);
  }

  getPolicy(businessId: string, policeType: PoliciesTypes) {
    const config = this.env.backend;

    return this.http.get(`${config.users}/api/business/${businessId}/legal-document/${policeType}`);
  }

  updatePolicy(businessId: string, policeType: string, policy: PolicyInterface) {
    const config = this.env.backend;

    return this.http.put(`${config.users}/api/business/${businessId}/legal-document/${policeType}`, policy);
  }

  public inviteEmployeeToGroups(businessId: string, employeeId: string): Observable<EmployeeInterface> {
    const config = this.env.backend;

    return this.http.patch<EmployeeInterface>(`${config.auth}/api/employees/invite/${businessId}/${employeeId}`, {});
  }

  handleError(error: any, showSnack?: boolean): void {
    if (!error.message) {
      error.message = this.translateService.translate('errors.unknown_error');
    }
    if (error.status === 403 || error.statusCode === 403 || error.code === 403) {
      error.message = this.translateService.translate('errors.forbidden');
    }
  }

  private createErrorBag(errors: ErrorAPIResponse): any {
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
              if (!!paramError?.constraints) {
                const errorText: string = Object.keys(paramError.constraints)
                  .map(key => paramError.constraints[key])
                  .join('');
                errorBag[paramError.property] = this.translateService.translate(errorText);
              }
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

  checkAccess(businessId: string): Observable<boolean | void> {
    return this.http.get<boolean | void>(`${this.env.backend.users}/api/business/${businessId}/check-access/settings`);
  }
}
