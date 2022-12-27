import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {  map, pluck } from 'rxjs/operators';

import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';

import {
  Contact,
  RootFolderContactItemInterface,
  RootFolderItemsInterface,
  SearchDataInterface, SearchFolderContactOptions,
} from './interface/data.interface';


@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  constructor(
    private http: HttpClient,
    public envService: EnvService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  getContactListByListOfId(listOfId: string[]): Observable<RootFolderContactItemInterface[]> {
    const lIds = listOfId.map(item => item.split('|')[0]);

    return this.getFolderDocuments({
        page: 1,
        perPage: 40,
      })
      .pipe(
        map((res: RootFolderItemsInterface) => {
          return res.collection.filter(contact => lIds.includes(contact._id));
        }),
      );
  }

   getContactsByIds(ids:string[],
      params = { orderBy:'lastName',direction:'desc',page:1,limit:100,sort:['desc'],currency:'string' }): Observable<Contact[]> {

    const url = `${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}/search`;
    const filters = {
      serviceEntityId: {
        condition: 'isIn',
        value: ids.length ? ids : [''],
      },
    };

    const data = {
      all: 0,
      orderBy: params.orderBy,
      direction: params.direction,
      page: params.page,
      limit: params.limit,
      query: null,
      filters,
      sort: params.sort,
      currency: params.currency,
    }

    return this.http.post(url , data).pipe(
      pluck('collection')
    )
  }

  filterContacts(filter:string,
      params = { orderBy:'lastName',page:1, limit:10 ,direction:'desc',sort:['desc'],currency:'string' }):Observable<Contact[]>{

    const url = `${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}/search`;

    const data = {
        all: 0,
        orderBy: params.orderBy,
        direction: params.direction,
        page: params.page,
        limit: params.limit,
        query: filter,
        filters: {},
        sort: params.sort,
        currency: params.currency,
      }

      return this.http.post(url , data).pipe(
        pluck('collection')
      )
  }

  getFolderDocuments(searchData: SearchDataInterface , filter:string = '') {
    let path = `${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}/root-documents`;

    return this.http.get<RootFolderItemsInterface>(path, { params: this.getSearchParams(searchData , filter) });
  }

  searchContacts(options: SearchFolderContactOptions = {}) {
    let path = `${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}/search`;

    return this.http.post(path, options);
  }

  private getSearchParams(searchData: SearchDataInterface , filter:string = ''): HttpParams {
    let params  = new HttpParams()
      .set('limit', searchData.perPage ? `${searchData.perPage}` : '10')
      .set('page', searchData.page ? `${searchData.page}` : '1')
      .set('orderBy', 'updatedAt')
      .set('direction', 'desc')
      .set('filters[isHeadline][0][condition]', 'isNot')
      .set('filters[isHeadline][0][value][0]', 'true');

      if(filter){
        params = params
        .set('filters[firstName][0][condition]', 'contains')
        .set('filters[firstName][0][value][0]', filter)
        .set('filters[lastName][0][condition]', 'contains')
        .set('filters[lastName][0][value][0]', filter);
      }

      return params;
  }
}
