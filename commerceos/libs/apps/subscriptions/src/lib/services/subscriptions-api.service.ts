import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { forkJoin, Observable, throwError } from 'rxjs';
import { catchError, map, pluck } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { PeFilterConditions, PeFilterType, PeGridSortingDirectionEnum, PeGridSortingOrderByEnum } from '@pe/grid';

import { PeSubscriptionsRequestsErrorsEnum } from '../enums';
import {
  PeSubscriptionsNetworkInterface,
  PeSubscriptionsPlanCategoryOfProductsInterface,
  PeSubscriptionsPlanInterface,
  PeSubscriptionsPlanProductInterface,
} from '../interfaces';
import {
  PE_CONTACTS_API_PATH,
  PE_PRODUCTS_API_PATH,
  PE_SUBSCRIPTIONS_API_PATH,
} from '../tokens';

import { PeErrorsHandlerService } from './errors-handler.service';

@Injectable()
export class PeSubscriptionsApiService {

  constructor(
    private httpClient: HttpClient,

    private pebEnvService: PebEnvService,

    @Inject(PE_CONTACTS_API_PATH) private peContactsApiPath: string,
    @Inject(PE_PRODUCTS_API_PATH) private peProductsApiPath: string,
    @Inject(PE_SUBSCRIPTIONS_API_PATH) private peSubscriptionsApiPath: string,
    private peErrorsHandlerService: PeErrorsHandlerService,
  ) { }

  private get businessId(): string {
    return this.pebEnvService.businessId;
  }

  private get businessPath(): string {
    return `${this.peSubscriptionsApiPath}/api/business/${this.businessId}`;
  }

  private get contactsPath(): string {
    return `${this.peContactsApiPath}/api/folders/business/${this.businessId}`;
  }

  private get networksPath(): string {
    return `${this.businessPath}/subscription-network`;
  }

  private get plansPath(): string {
    return `${this.businessPath}/subscription-plans`;
  }

  // Subscriptions networks
  public getNetwork(networkId: string): Observable<PeSubscriptionsNetworkInterface> {
    return this.httpClient
      .get<PeSubscriptionsNetworkInterface>(`${this.networksPath}/${networkId}`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.GetNetwork, error);

          return throwError(error);
        }));
  }

  public getNetworks(): Observable<PeSubscriptionsNetworkInterface[]> {
    return this.httpClient
      .get<PeSubscriptionsNetworkInterface[]>(this.networksPath)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.GetNetworks, error);

          return throwError(error);
        }));
  }

  public createNetwork(
    network: PeSubscriptionsNetworkInterface,
  ): Observable<PeSubscriptionsNetworkInterface> {
    return this.httpClient
      .post<PeSubscriptionsNetworkInterface>(this.networksPath, network)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.CreateNetwork, error);

          return throwError(error);
        }));
  }

  public deleteNetwork(networkId: string): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.networksPath}/${networkId}`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.DeleteNetwork, error);

          return throwError(error);
        }));
  }

  public updateNetwork(
    networkId: string,
    network: PeSubscriptionsNetworkInterface,
  ): Observable<PeSubscriptionsNetworkInterface> {
    return this.httpClient
      .patch<PeSubscriptionsNetworkInterface>(`${this.networksPath}/${networkId}`, network)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.UpdateNetwork, error);

          return throwError(error);
        }));
  }

  public getDefaultNetwork(): Observable<PeSubscriptionsNetworkInterface> {
    return this.httpClient
      .get<PeSubscriptionsNetworkInterface>(`${this.networksPath}/default`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.GetDefaultNetwork, error);

          return throwError(error);
        }));
  }

  public setNetworkAsDefault(networkId: string): Observable<PeSubscriptionsNetworkInterface> {
    return this.httpClient
      .patch<PeSubscriptionsNetworkInterface>(
        `${this.networksPath}/${networkId}/default`,
        {},
      )
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.SetDefaultNetwork, error);

          return throwError(error);
        }));
  }

  public validateNetworkName(networkName: string): Observable<any> {
    return this.httpClient
      .get<any>(`${this.networksPath}/isValidName?name=${networkName}`)
      .pipe(
        catchError(error => {
          return throwError(error);
        }));
  }

  public getAllPlans(): Observable<any> {
    return this.httpClient
      .get<any>(this.plansPath)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.GetAllPlans, error, true);

          return throwError(error);
        }));
  }

  public getPlan(planId: string): Observable<any> {
    return this.httpClient
      .get<any>(`${this.plansPath}/${planId}`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.GetPlan, error, true);

          return throwError(error);
        }));
  }

  public createPlan(plan: PeSubscriptionsPlanInterface): Observable<PeSubscriptionsPlanInterface> {
    return this.httpClient
      .post<PeSubscriptionsPlanInterface>(this.plansPath, plan)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.CreatePlan, error, true);

          return throwError(error);
        }));
  }

  public deletePlan(planId: string): Observable<null> {
    return this.httpClient
      .delete<null>(`${this.plansPath}/${planId}`)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.DeletePlan, error, true);

          return throwError(error);
        }));
  }

  public updatePlan(planId: string, plan: PeSubscriptionsPlanInterface): Observable<PeSubscriptionsPlanInterface> {
    return this.httpClient
      .put<PeSubscriptionsPlanInterface>(`${this.plansPath}/${planId}`, plan)
      .pipe(
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.UpdatePlan, error, true);

          return throwError(error);
        }));
  }

  //Categories
  private categoriesGQL(filterByTitle: string = ''): { query: string } {
    return {
      query: `{
        getCategories (
          businessUuid: "${this.businessId}",
          title: "${filterByTitle}",
        ) {
          _id
          businessUuid
          slug
          title
        }
      }`,
    };
  };

  public getCategories(filter?: string): Observable<PeSubscriptionsPlanCategoryOfProductsInterface[]> {
    return this.httpClient
      .post(`${this.peProductsApiPath}/products`, this.categoriesGQL(filter))
      .pipe(
        map((request: any) => request.data.getCategories
          .map(category => {
            category.businessId = category.businessUuid;
            delete category.businessUuid;

            return category;
          })),
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.GetCategories, error);

          return throwError(error);
        }));
  }

  // Products
  private productsGQL(filterByTitle: string = ''): { query: string } {
    return { 
      query: `{
        getProducts(
          businessUuid: "${this.businessId}",
          filters: {
            fieldType: "string"
            field: "title"
            value: "${filterByTitle}"
          },
          paginationLimit: 100,
          orderBy: "price",
          orderDirection: "desc",
        ) {
          products {
            _id
            imagesUrl
            title
            price
          }
        }
      }`,
    };
  }

  public getProducts(filter?: string): Observable<PeSubscriptionsPlanProductInterface[]> {
    return this.httpClient
      .post(`${this.peProductsApiPath}/products`, this.productsGQL(filter))
      .pipe(
        map((request: any) => request.data.getProducts.products
          .map((product: any): PeSubscriptionsPlanProductInterface => {
            return {
              _id: product._id,
              image: product?.imagesUrl[0] ?? 'assets/icons/folder-grid.png', //'bag',
              price: product.price,
              title: product.title,
            };
          })),
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.GetProducts, error, true);

          return throwError(error);
        }));
  }
  
  // Subscribers
  public getSubscribers(filter?: string): Observable<any> {
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
        map((subscribers: any[]) => subscribers
          .map(subscriber => {
            return {
              _id: subscriber._id,
              city: subscriber?.city ?? '',
              companyName: '',
              country: subscriber?.country ?? '',
              email: subscriber.email,
              image: subscriber?.imageUrl ?? 'assets/icons/subscriber.svg',
              name: subscriber.fullName,
              title: subscriber.fullName,
            };
          })),
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.GetSubscribers, error, true);

          return throwError(error);
        }));
  }

  public getSubscribersGroups(filter?: string): Observable<any> {
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
              id: folder._id,
              image: folder?.image ?? 'assets/icons/group.svg',
              title: folder.name,
            };
          })),
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.GetSubscribersGroups, error);

          return throwError(error);
        }));
  }

  public getSubscribersOfGroup(groupId: string): Observable<any> {
    return this.httpClient
      .get(`${this.contactsPath}/folder/${groupId}/documents`)
      .pipe(
        map((group: { collection: any[] }) => group.collection
          .filter(subscriber => !subscriber.isFolder && !subscriber.isHeadline)
          .map(subscriber => subscriber._id)),
        catchError(error => {
          this.peErrorsHandlerService
            .errorHandler(PeSubscriptionsRequestsErrorsEnum.GetSubscribersOfGroup, error);

          return throwError(error);
        }));
  }

  public readonly mapSubscribersGroups = (groups) => {
    const groupsOfSubscribers$ = groups
      .map(group => {
        group._id = group.id;
        group.name = group.title;
        delete group.id;
        delete group.image;
        delete group.title;

        return this.getSubscribersOfGroup(group._id)
          .pipe(
            map(subscribersOfGroup => {
              group.subscribers = subscribersOfGroup;

              return group;
            }));
      });

    return forkJoin(groupsOfSubscribers$);
  }
}
