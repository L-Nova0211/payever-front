import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { Observable, throwError } from 'rxjs';
import { catchError, map, pluck } from 'rxjs/operators';

import { EnvService } from '@pe/common';
import { PeFilterConditions, PeFilterType, PeGridSortingDirectionEnum, PeGridSortingOrderByEnum } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { PeListSectionIntegrationInterface } from '@pe/ui';

import { PeCouponsRequestsErrorsEnum } from '../enums';
import { PeCouponInterface } from '../interfaces';
import { PE_CONTACTS_API_PATH, PE_COUPONS_API_PATH, PE_PRODUCTS_API_PATH } from '../tokens';

import { PeCouponsChannelService } from './coupons-channel.service';

@Injectable()
export class PeCouponsApiService {

  public businessId: string;

  constructor(
    private apmService: ApmService,
    private httpClient: HttpClient,

    private envService: EnvService,
    private translateService: TranslateService,
    private peCouponsChannelService: PeCouponsChannelService,

    @Inject(PE_CONTACTS_API_PATH) private peContactsApiPath: string,
    @Inject(PE_COUPONS_API_PATH) private peCouponsApiPath: string,
    @Inject(PE_PRODUCTS_API_PATH) private peProductsApiPath: string,
  ) { }

  private get getBusinessId(): string {
    return this.envService.businessId;
  }

  private get contactsPath(): string {
    return `${this.peContactsApiPath}/api/folders/business/${this.envService.businessId}`;
  }

  private get couponsPath(): string {
    return `${this.peCouponsApiPath}/business/${this.getBusinessId}/coupons`;
  }

  // requests for Channels
  public getChannels(): Observable<PeListSectionIntegrationInterface[]> {
    return this.httpClient
      .get<any[]>(`${this.peCouponsApiPath}/channel`)
      .pipe(
        map((channels): PeListSectionIntegrationInterface[] => channels
          .map(channel => this.peCouponsChannelService.getChannel(channel))
        ),
        catchError(error => {
          this.errorHandler(PeCouponsRequestsErrorsEnum.GetChannels, error);

          return throwError(error);
        }));
  }

  // requests for Coupons
  public getCoupon(couponId: string): Observable<any> {
    return this.httpClient
      .get(`${this.couponsPath}/${couponId}`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeCouponsRequestsErrorsEnum.GetCoupon, error);

          return throwError(error);
        }));
  }

  public getCoupons(filter? :any): Observable<any> {
    const params = filter ? `filter=${JSON.stringify(filter)}` : undefined;

    return this.httpClient
      .get(`${this.couponsPath}?${params}`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeCouponsRequestsErrorsEnum.GetCoupons, error);

          return throwError(error);
        }));
  }

  public getCouponByCode(couponCode: string): Observable<any> {
    return this.httpClient
      .get(`${this.couponsPath}/by-code/${couponCode}`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeCouponsRequestsErrorsEnum.GetCouponByCode, error);

          return throwError(error);
        }));
  }

  public createCoupon(coupon: PeCouponInterface): Observable<any> {
    return this.httpClient
      .post(`${this.couponsPath}`, coupon)
      .pipe(
        catchError(error => {
          this.errorHandler(PeCouponsRequestsErrorsEnum.CreateCoupon, error);

          return throwError(error);
        }));
  }

  public deleteCoupon(couponId: string): Observable<null> {
    return this.httpClient
      .delete<null>(`${this.couponsPath}/${couponId}`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeCouponsRequestsErrorsEnum.DeleteCoupon, error);

          return throwError(error);
        }));
  }

  public updateCoupon(couponId: string, coupon: PeCouponInterface): Observable<any> {
    return this.httpClient
      .put(`${this.couponsPath}/${couponId}`, coupon)
      .pipe(
        catchError(error => {
          this.errorHandler(PeCouponsRequestsErrorsEnum.UpdateCoupon, error);

          return throwError(error);
        }));
  }

  public getCouponEligibility(couponId: string): Observable<any> {
    return this.httpClient
      .get(`${this.couponsPath}/${couponId}/eligibility`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeCouponsRequestsErrorsEnum.GetCouponEligibility, error);

          return throwError(error);
        }));
  }

  public getCouponTypeExtraField(couponId: string): Observable<any> {
    return this.httpClient
      .get(`${this.couponsPath}/${couponId}/type-extra-fields`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeCouponsRequestsErrorsEnum.GetCouponTypeExtraField, error);

          return throwError(error);
        }));
  }

  // Configure coupon requests
  private categoriesGQL(filterByTitle: string = ''): { query: string } {
    return {
      query: `{
        getCategories (
          businessUuid: "${this.getBusinessId}",
          title: "${filterByTitle}",
        ) {
          _id
          title
        }
      }`,
    };
  }

  public getCategories(filter?: string): Observable<any> {
    return this.httpClient
      .post(`${this.peProductsApiPath}/products`, this.categoriesGQL(filter))
      .pipe(
        map((request: any) => request.data.getCategories),
        catchError(error => {
          this.errorHandler(PeCouponsRequestsErrorsEnum.GetCategories, error);

          return throwError(error);
        }));
  }

  public getContacts(filter?: string): Observable<any> {
    const filterConfiguration = {
      all: 0,
      orderBy: PeGridSortingOrderByEnum.FirstName,
      direction: PeGridSortingDirectionEnum.Descending,
      page: 1,
      limit: 20,
      filters: {
        fullName: {
          condition: PeFilterConditions.Contains,
          value: '*' + filter.toLowerCase(),
        },
      },
      sort: [PeGridSortingDirectionEnum.Descending],
      currency: PeFilterType.String,
    };

    return this.httpClient
      .post(`${this.contactsPath}/search`, filterConfiguration)
      .pipe(
        pluck('collection'),
        map((contacts: any) => contacts
          .map(contact => {
            return {
              _id: contact.email,
              image: contact?.imageUrl ?? 'assets/icons/subscriber.svg',
              title: contact.fullName,
            }
          })
        ));
  }

  public getContactsGroups(filter?: string): Observable<any> {
    const params = !!filter
      ? new HttpParams()
          .set('orderBy', 'updatedAt')
          .set('direction', 'desc')
          .set('filters[isHeadline][0][condition]', 'isNot')
          .set('filters[isHeadline][0][value][0]', 'true')
          .set('filters[name][0][condition]', 'contains')
          .set('filters[name][0][value][0]', filter)
      : { };

    return this.httpClient
      .get(this.contactsPath, { params })
      .pipe(
        map((folders: any[]): any[] => folders
          .filter(folder => folder.parentFolderId && folder._id && folder.name)
          .map(folder => {
            return {
              _id: folder._id,
              image: folder?.image ?? 'assets/icons/group.svg',
              title: folder.name,
            };
          })
        ),
        catchError(error => {
          this.errorHandler(PeCouponsRequestsErrorsEnum.GetContactsGroups, error);

          return throwError(error);
        }));
  }

  private productsGQL(filterByTitle: string = ''): { query: string } {
    return {
      query: `{
        getProducts(
          businessUuid: "${this.getBusinessId}",
          filters: {
            fieldType: "string"
            field: "title"
            value: "${filterByTitle}"
          },
          orderBy: "price",
          orderDirection: "desc",
          paginationLimit: 100,
        ) {
          products {
            _id
            imagesUrl
            title
          }
        }
      }`,
    };
  }

  public getProducts(filter?: string): Observable<any> {
    return this.httpClient
      .post(`${this.peProductsApiPath}/products`, this.productsGQL(filter))
      .pipe(
        map((request: any) => request.data.getProducts.products
          .map(product => {        
            return {
              _id: product._id,
              image: product?.imagesUrl[0] ?? 'assets/icons/folder-grid.png', //'bag';
              title: product.title,
            };
          })
        ),
        catchError(error => {
          this.errorHandler(PeCouponsRequestsErrorsEnum.GetProducts, error);

          return throwError(error);
        }));
  }

  private errorHandler(description: PeCouponsRequestsErrorsEnum, error: any): void {
    const errorDescription = this.translateService.translate(description);
    this.apmService.apm.captureError(`${errorDescription} ms:\n${JSON.stringify(error)}`);
  }
}
