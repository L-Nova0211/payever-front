import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { TokensInterface } from '@pe/api';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { BusinessInterface } from '../business.interface';

@Injectable({
  providedIn: 'root',
})
export class BusinessApiService {
  constructor(private httpClient: HttpClient, @Inject(PE_ENV) private env: EnvironmentConfigInterface) {}

  getBusinessData(businessId: string): Observable<BusinessInterface> {
    const url = `${this.env.backend.users}/api/business/${businessId}`;

    return this.httpClient.get<BusinessInterface>(url);
  }

  getBusinessesList(active='false', page?:string, limit?:string) {
    const url = `${this.env.backend.users}/api/business`;

    return this.httpClient.get<{ businesses:BusinessInterface[],total:number}>(url,{ params:{
      page:page?page:'1',
      limit:limit?limit:'20',
      active:active,
    } });
  }

  getactiveBusiness() {
    const url = `${this.env.backend.users}/api/business`;

    return this.httpClient.get<{ businesses:BusinessInterface[],total:number}>(url,{ params:{
      active:'true',
    } });
  }


  enableBusiness(businessId: string): Observable<TokensInterface> {
    const url = `${this.env.backend.auth}/api/business/${businessId}/enable`;

    return this.httpClient.patch<TokensInterface>(url, {})
  }

  getBusinessesListWithParams(userIds: number[], query: string): Observable<any> {
    const url = `${this.env.backend.users}/api/business`;
    let params = new HttpParams();
    params = params.append('admin', 'true');
    params = params.append('query', query);
    userIds.forEach(id => (params = params.append('userIds[]', id.toString())));

    return this.httpClient.get(url, { params }).pipe(catchError((error: Response) => throwError(error)));
  }


  getBusinessWallpaper(businessId: string) {
    return this.httpClient.get(`${this.env.backend.wallpapers}/api/business/${businessId}/wallpapers`);
  }


}
