import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import { flatten } from 'flat';
import gql from 'graphql-tag';
import graphqlTag from 'graphql-tag';
import cloneDeep from 'lodash/cloneDeep';
import forIn  from 'lodash/forIn';
import omit  from 'lodash/omit';
import moment from 'moment';
import { combineLatest, forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, pluck, shareReplay, switchMap, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV, PeDataGridLayoutType, EnvService } from '@pe/common';
import { FolderItem } from '@pe/folders';
import { PeGridSortingDirectionEnum, PeGridSortingInterface, PeGridSortingOrderByEnum } from '@pe/grid';
import { RuleValues } from '@pe/rules';

import { PeProductOptionInterface } from '../../collection-editor';
import { ProductsOrderBy } from '../../products-list/enums/order-by.enum';
import { PARAMS_MAP } from '../constants';
import { ConditionsType } from '../enums/collection.enum';
import { Direction } from '../enums/direction.enum';
import { FieldFilterKey, SearchFilterKey } from '../enums/filter.enum';
import { ProductTypes } from '../enums/product.enum';
import {
  CREATE_CATEGORY_QUERY,
  DELETE_PRODUCT_QUERY,
  GET_CATEGORIES_QUERY,
  GET_PRODUCT_RECOMMENDATIONS_QUERY,
  GET_RECOMMENDATIONS_QUERY,
  IS_SKU_USED_QUERY,
  NO_CACHE_POLICY,
  PRODUCT_COUNTRY_QUERY,
  PRODUCT_LANGUAGE_QUERY,
  PRODUCT_QUERY,
  QUERY_CREATE,
  QUERY_UPDATE,
} from '../gql-queries/queries';
import { RecurringBillingDataInterface } from '../interfaces/billing.interface';
import { ChannelSetInterface } from '../interfaces/channel-set.interface';
import { CollectionModel } from '../interfaces/collection-model';
import { Collection, CollectionsLoadedInterface } from '../interfaces/collection.interface';
import { Filter, FormattedFilter } from '../interfaces/filter.interface';
import { Order } from '../interfaces/order.interface';
import { PaginationCamelCase } from '../interfaces/pagination.interface';
import { Product, ProductInventoryInterface, ProductModel } from '../interfaces/product.interface';
import { Responses } from '../interfaces/response.interface';
import {
  Category,
  ContactsFolderInterface,
  InventoryInterface,
  NewInventoryInterface, ShippingSection,
  UpdateInventoryInterface,
  VariantsSection,
} from '../interfaces/section.interface';


export enum ApolloBaseName {
  contacts = 'contacts',
  products = 'products',
}

const PRODUCT_FIELDS_GRID = `
  images
  id
  title
  price
  currency
  stock
  sku
  company
  collections {
    _id
    name
    description
  }
`;

const PRODUCT_FIELDS_LIST = `
  images
  id
  title
  price
  currency
  stock
  sku
  channelSets {
    id
    type
  }
  categories {
    title
  }
  collections {
    _id
    name
    description
  }
  variantCount
  company
`;

const PRODUCT_LIST_INFO = `
pagination {
  page
  page_count
  per_page
  item_count
}`;

interface FormattedProductsRequest {
  paginationLimit: number;
  pageNumber: number;
  orderBy: string;
  orderDirection: string;
  search?: string;
  filters?: FormattedFilter[];
  useNewFiltration?: boolean;
}

interface AddBillingIntegrationProductInterface {
  _id: string;
  title: string;
  price: number;
  interval: string;
  billingPeriod: number;
}

interface EditBillingIntegrationProductInterface {
  interval: string;
  billingPeriod: number;
}

@Injectable()
export class ProductsApiService {
  public static model: ProductModel = {
    id: null,
    images: [],
    title: '',
    description: '',
    available: false,
    sale: {
      onSales: false,
      salePrice: null,
      saleEndDate: null,
      saleStartDate: null,
    },
    productType: ProductTypes.Physical,
    price: 0.0,
    priceTable: [],
    country: '',
    language: '',
    vatRate: 0,
    sku: '',
    inventory: 0,
    lowInventory: 0,
    emailLowStock: false,
    inventoryTrackingEnabled: false,
    barcode: '',
    categories: [],
    collections: [],
    channelSets: [],
    active: true,
    variants: [],
    attributes: [],
    shipping: null,
    seo: null,
  };

  public static collectionModel: CollectionModel = {
    _id: null,
    image: '',
    images: [],
    name: '',
    description: null,
    conditions: {
      type: ConditionsType.NoCondition,
      filters: [],
    },
    products: [],
    parent: '',
  };

  applicationId: string;
  lastCreatedProductSku: string;

  private readonly contactsGQL = {
    query: `{
      contacts(
        businessId: "${this.envService.businessId}"
      ) {
        _id
        fields {
          _id
          value
          field {
            _id
            name
          }
        }
      }
    }`,
  };

  constructor(
    private apollo: Apollo,
    private http: HttpClient,
    public  envService: EnvService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
  }

  getBusiness(businessUuid: string) {
    const businessQuery: any = gql`
      query {
        getBusiness(
          businessId: "${businessUuid}"
        ) {
          id
          name
          companyAddress {
            country
          }
        }
      }
    `;

    return this.apollo.use(ApolloBaseName.products).query({
      query: businessQuery,
      fetchPolicy: NO_CACHE_POLICY,
    });
  }

  getProducts(
    businessId: string,
    filters: Filter[] = [],
    filterById: string[] = [],
    search: string = '',
    pagination: PaginationCamelCase = { page: 1, perPage: 20 },
    order: Order = { by: '', direction: Direction.DESC },
    view = PeDataGridLayoutType.Grid,
    first = false,
    withMarketPlaces = false,
  ): Observable<any> {
    const request: FormattedProductsRequest = this.prepareRequest(filters);
    // const valueIn: string[] = request.filters.map(filter=> filter.valueIn.sp)
    let getBusiness = '';

    if (first) {
      getBusiness = `
        getBusiness(
          businessId: "${businessId}"
        ) {
          id
          companyAddress {
            country
          }
          currency
        }
      `;
    }

    const ProductsQuery: any = gql`
      query {
        ${getBusiness}
        getProducts (
          businessUuid: "${businessId}",
          paginationLimit: ${pagination.perPage},
          pageNumber: ${pagination.page},
          orderBy: "${order.by}",
          orderDirection: "${order.direction}",
          filterById: ${JSON.stringify(filterById)},
          withMarketplaces: ${withMarketPlaces}
          search: "${search || ''}",
          filters: [${request.filters
      .map(
        filter => `
          {
            field: "${filter.field}"
            fieldType: "${filter.fieldType}"
            fieldCondition: "${filter.fieldCondition}"
            value: "${filter.value}"
          }`,
      )
      .join('')}]
        ) {
          products {
            ${view === PeDataGridLayoutType.Grid ? PRODUCT_FIELDS_GRID : PRODUCT_FIELDS_LIST}
          }
          info {
            ${PRODUCT_LIST_INFO}
          }
        }
      }
    `;

    return this.apollo.use(ApolloBaseName.products).subscribe({
      query: ProductsQuery,
      fetchPolicy: NO_CACHE_POLICY,
    });
  }

  getProductRecommendations(id: string): Observable<any> {
    return this.apollo.use(ApolloBaseName.products).query({
      query: GET_PRODUCT_RECOMMENDATIONS_QUERY,
      variables: {
        id,
      },
      fetchPolicy: NO_CACHE_POLICY,
    });
  }

  getRecommendations(businessUuid: string): Observable<any> {
    return this.apollo.use(ApolloBaseName.products).query({
      query: GET_RECOMMENDATIONS_QUERY,
      variables: {
        businessUuid,
      },
      fetchPolicy: NO_CACHE_POLICY,
    });
  }

  getWidgetProducts(businessId: string, includeIds: string[], view = PeDataGridLayoutType.Grid): Observable<any> {
    const ProductsQuery: any = gql`
      query {
        getProducts (
          businessUuid: "${businessId}",
          paginationLimit: 100,
          pageNumber: 1,
          ${includeIds ? `includeIds: [${includeIds.map(i => `"${i}"`)}]` : ''}
        ) {
          products {
            ${view === PeDataGridLayoutType.Grid ? PRODUCT_FIELDS_GRID : PRODUCT_FIELDS_LIST}
          }
          info {
            ${PRODUCT_LIST_INFO}
          }
        }
      }
    `;

    return this.apollo.use(ApolloBaseName.products).query({
      query: ProductsQuery,
      fetchPolicy: NO_CACHE_POLICY,
    });
  }

  getProductsByChannelSet(
    businessUuid: string,
    filterById: string[] = [],
    unfilterById: string[] = [],
    filters: Filter[] = [],
    view = PeDataGridLayoutType.Grid,
  ): Observable<any> {
    const request: FormattedProductsRequest = this.prepareRequest(filters);
    const ProductsQuery: any = gql`
      query {
        getProductsByChannelSet (
          businessId: "${businessUuid}",
          paginationLimit: ${request.paginationLimit},
          existInChannelSet: ${true},
          orderDirection: "${request.orderDirection}",
          channelSetId: "${null}",
          pageNumber: ${request.pageNumber},
          orderBy: "${request.orderBy}",
          filterById: ${JSON.stringify(filterById)},
          unfilterById: ${JSON.stringify(unfilterById)},
          search: "${request.search || ''}",
          filters: [${request.filters
            .map(
                  filter => `
                    {
                      field: "${filter.field}"
                      fieldType: "${filter.fieldType}"
                      fieldCondition: "${filter.fieldCondition}"
                      value: "${filter.value}"
                    }`,
            )
            .join('')}],
          channelSetType: "dropshipping",
          allBusinesses: ${true},
        ) {
              products {
                ${view === PeDataGridLayoutType.Grid ? PRODUCT_FIELDS_GRID : PRODUCT_FIELDS_LIST}
              }
              info {
                isChannelWithExisting
                ${PRODUCT_LIST_INFO}
              }
            }
      }
    `;

    return this.apollo.use(ApolloBaseName.products).query({
      query: ProductsQuery,
      fetchPolicy: NO_CACHE_POLICY,
    });
  }

  updateChannelSetInProducts(
    businessId: string,
    channelSets: ChannelSetInterface[],
    addToProductIds: string[],
    removeFromProductIds: string[],
  ): Observable<any> {
    return this.apollo.use(ApolloBaseName.products).mutate({
      mutation: gql`
            mutation updateProductChannelSets {
              updateProductChannelSets(
                business: "${businessId}",
                channelSets: ${this.getAllParams(channelSets, false)}
                addToProductIds: ${JSON.stringify(addToProductIds)},
                deleteFromProductIds: ${JSON.stringify(removeFromProductIds)}
              ) {
                title
              }
            }
          `,
    });
  }

  createProduct(product: ProductModel, businessUuid: string): Observable<any> {
    let query: any = product.id ? QUERY_UPDATE : QUERY_CREATE;
    const currentSKU: string = product.sku;

    return this.apollo
      .use(ApolloBaseName.products)
      .mutate({
        mutation: query,
        variables: {
          product: this.getProductQLData(product, businessUuid),
        },
      })
      .pipe(
        tap(() => {
          this.lastCreatedProductSku = currentSKU;
        }),
        switchMap((gqlResult) => {
          if (product.variants && product.variants.length) {
            const variantsReq: Array<Observable<void>> = product.variants.map((variant) => {
              return this.updateOrCreateInventory(variant.sku, businessUuid, variant);
            });

            return combineLatest([...variantsReq]).pipe(map(() => of(gqlResult)))
              .pipe(switchMap((data) => {
                return data;
              }));
          } else {
            return this.updateOrCreateInventory(currentSKU, businessUuid, product).pipe(map(() => gqlResult));
          }
        }),
      );
  }

  getProductTranslation(id:string, language: string): Observable<Product | any> {
    return this.apollo
    .use(ApolloBaseName.products)
    .query({
      query: PRODUCT_LANGUAGE_QUERY,
      variables: {
        id,
        language,
      },
      fetchPolicy: NO_CACHE_POLICY,
    });
  }

  getContacts(): Observable<any> {
    return this.http
      .post(`${this.env.backend.contacts}/contacts`, this.contactsGQL)
      .pipe(
        map((result: any) => {
          if (result.errors && result.errors.length) {
            return throwError(result.errors[0]?.message);
          }

          return result.data.contacts;
        }),
        catchError((error) => {
          return throwError(error);
        }));
  }

  getContactsByIds(ids:string[]): Observable<any> {
    const contactsQ: any = gql`
        query ExampleQuery($businessId: String!, $filters: [FilterDto!]) {
          searchContacts(businessId: $businessId, filters: $filters) {
            contacts {
              _id
              businessId
              type
              fields {
                _id
                value
                field {
                  _id
                  name
                }
              }
            }
          }
        }
    `;

    const busId = this.envService.businessId;

    const variables = {
      businessId: busId,
      filters: [
        {
          field: '_id',
          fieldType: 'string',
          fieldCondition: 'is',
          value: '',
          valueIn: ids.map(a => a),
        },
      ],
    };

    return this.apollo.use(ApolloBaseName.contacts).query({
      query: contactsQ,
      variables:variables,
      fetchPolicy: NO_CACHE_POLICY,
    }).pipe(
      pluck('data', 'searchContacts'),
      map((data: any) =>  data.contacts)
    );;
  }

  public searchContacts(
    pagination = { page: 1, perPage: 20 },
    order: PeGridSortingInterface = {
      orderBy: PeGridSortingOrderByEnum.FirstName,
      direction: PeGridSortingDirectionEnum.Ascending,
    },
    filter = '' ): Observable<any> {
    const businessId = this.envService.businessId || this.envService.businessData._id;
    const query = graphqlTag`
      query {
        searchContacts(businessId: "${businessId}", filters: [{
          field: "fullName",
          fieldType: "string",
          fieldCondition: "contains",
          value: "${filter}"
        }],
        params: {
          orderDirection: "${order.direction}",
          orderBy: "${order.orderBy}",
          paginationLimit: ${pagination.perPage},
          pageNumber: ${pagination.page}
        }) {
          info {
            pagination {
              item_count
              page
              page_count
              per_page
            }
          }
          contacts {
            _id
            businessId
            type
            fields {
              _id
              value
              field {
                _id
                name
              }
            }
          }
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .subscribe({
        query,
      })
      .pipe(
        pluck('data', 'searchContacts'),
        map((data: any) => {
          return data.contacts;
        })
      );
  }


  public searchGroupContacts(
    pagination = { page: 1, perPage: 20 },
    order: PeGridSortingInterface = {
      orderBy: PeGridSortingOrderByEnum.FirstName,
      direction: PeGridSortingDirectionEnum.Ascending,
    },filter = ''
  ): Observable<any> {

    if (!filter){
      return of([]);
    }

    const filterObject = {
      name:{
        $regex:'.*' + filter + '.*',
      },
    };

    const options = {
      skip:0,
      limit:10 ,
      sort:{
        date_added:-1,
      },
    };

    const params = new HttpParams()
      .set('filter' , JSON.stringify( filterObject))
      .set('options' , JSON.stringify(options) );

    return this.http
      .get(`${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}` , { params:params })
      .pipe(
        map((folders: ContactsFolderInterface[]) => {
          return folders.map((folder) => {
            return {
              id: folder._id,
              image: folder?.image ?? 'assets/icons/folder-grid.png',
              title: folder.name,
            };
          });
        }),
        catchError((error) => {

          return throwError(error);
        }));
  }

  getProductCountrySetting(id:string, country: string): Observable<Product | any> {
    return this.apollo
    .use(ApolloBaseName.products)
    .query({
      query: PRODUCT_COUNTRY_QUERY,
      variables: {
        id,
        country,
      },
      fetchPolicy: NO_CACHE_POLICY,
    });
  }

  getProduct(id: string): Observable<Product | any> {
    return this.apollo
      .use(ApolloBaseName.products)
      .query({
        query: PRODUCT_QUERY,
        variables: {
          id,
        },
        fetchPolicy: NO_CACHE_POLICY,
      })
      .pipe(
        switchMap((result: ApolloQueryResult<{ [key: string]: Product }>) => {
          const prodData: any = (result || { data: {} }).data['product'] || {};
          if (prodData.businessUuid) {
            if (prodData.variants && prodData.variants.length) {
              const getTasks: Array<Observable<VariantsSection>> = prodData.variants.map((variant: VariantsSection) => {
                return this.getInventoryBySKU(variant.sku, prodData.businessUuid).pipe(
                  map((inventory) => {
                    return {
                      ...variant,
                      barcode: inventory.barcode,
                      inventory: inventory.stock,
                      lowInventory: inventory.lowStock,
                      emailLowStock: inventory.emailLowStock,
                      inventoryTrackingEnabled: inventory.isTrackable,
                    };
                  }),
                );
              });

              return combineLatest(getTasks).pipe(
                map((variants: VariantsSection[]) => {
                  result.data.product.variants = variants;

                  return result;
                }),
              );
            }
            if (prodData.sku) {
              return this.getInventoryBySKU(prodData.sku, prodData.businessUuid).pipe(
                map((inventory) => {
                  const data: InventoryInterface = inventory || ({} as any);
                  // Handle case when inventory sku comes from old DB but it not exists in new inventory DB
                  const exists = Boolean(prodData.sku && data.sku);
                  prodData.sku = exists ? data.sku : prodData.sku;
                  prodData.barcode = exists ? data.barcode : prodData.barcode;
                  prodData.inventory = exists ? data.stock : prodData.inventory;
                  prodData.lowInventory = exists ? data.lowStock : prodData.lowInventory;
                  prodData.emailLowStock = exists ? data.emailLowStock : prodData.emailLowStock;
                  prodData.inventoryTrackingEnabled = exists
                    ? data.isTrackable || false
                    : prodData.inventoryTrackingEnabled;

                  return result;
                }),
              );
            }
          }

          return of(result);
        }),
        shareReplay(1),
      );
  }

  postCopyProducts(productIds: string[], targetFolderId: string, businessId: string, prefix = 'copy')
    : Observable<any> {
    return this.apollo.use(ApolloBaseName.products).mutate({
      mutation: gql`
        mutation copyProducts(
          $businessId: String!
          $productIds: [String]!
          $targetFolderId: String
          $prefix: String
        ) {
          copyProducts(
            businessId: $businessId
            productIds: $productIds
            targetFolderId: $targetFolderId
            prefix: $prefix
          ) {
            products {
              images
              currency
              id
              title
              description
              price
              sale {
                onSales
                salePrice
                saleEndDate
                saleStartDate
              }
              vatRate
              sku
              barcode
              type
              active
              collections {
                _id
                name
                description
              }
              categories {
                id
                slug
                title
              }
              channelSets {
                id
                type
                name
              }
              variants {
                id
                images
                options {
                  name
                  value
                }
                description
                price
                sale {
                  onSales
                  salePrice
                  saleEndDate
                  saleStartDate
                }
                sku
                barcode
              }
              shipping {
                weight
                width
                length
                height
              }
            }
            info {
              pagination {
                page
                page_count
                per_page
                item_count
              }
            }
          }
        }
      `,
      variables: {
        businessId,
        productIds,
        targetFolderId,
        prefix,
      },
    });
  }

  removeStoreItem(ids: string[]): Observable<Responses.Empty | any> {
    return this.apollo.use(ApolloBaseName.products).mutate({
      mutation: DELETE_PRODUCT_QUERY,
      variables: {
        ids,
      },
    });
  }

  loadCollections(page: number, businessId: string, parentId?: string): Observable<CollectionsLoadedInterface> {
    let parentUrl: string;

    if (parentId === undefined) {
      parentUrl = '';
    } else if (parentId === null) {
      parentUrl = '/parent/';
    } else {
      parentUrl = `/parent/${parentId}`;
    }

    return this.http
      .get<CollectionsLoadedInterface>(
        `${this.env.backend.products}/collections/${businessId}${parentUrl}?page=${page}&perPage=100`,
      )
      .pipe(
        catchError((error: HttpErrorResponse) => of({} as CollectionsLoadedInterface)),
        shareReplay(1),
      );
  }

  getCollection(id: string, businessId: string): Observable<Collection> {
    return this.http.get<Collection>(`${this.env.backend.products}/collections/${businessId}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => of({} as Collection)),
      shareReplay(1),
    );
  }

  createOrUpdateCollection(collection: CollectionModel, businessId: string): Observable<Collection> {
    const requestCollection: Collection = {
      name: collection.name,
      image: collection.image,
      slug: collection.name.split(' ').join('_'),
      channelSets: [],
      activeSince: new Date(),
      parent: collection.parent,
    };
    if (collection.description) {
      requestCollection.description = collection.description;
    }
    if (collection.conditions?.type !== ConditionsType.NoCondition) {
      requestCollection.automaticFillConditions = {
        strict: collection.conditions?.type === ConditionsType.AllConditions,
        filters: collection.conditions?.filters
          ? collection.conditions.filters.map((condition) => {
            return {
              field: condition.key,
              fieldType: 'string',
              fieldCondition: condition.condition,
              value: `${condition.value}`,
            };
          })
          : [],
      };
    } else {
      requestCollection.automaticFillConditions = {
        strict: true,
        filters: [],
      };
    }

    if (collection._id) {
      return this.updateCollection(collection._id, requestCollection, businessId).pipe(
        switchMap(() => {
          // const initialProductsIds = [];
          const newProductsIds = [] as string[];

          if (newProductsIds.length > 0) {
            return this.addProductsToCollection(collection._id, newProductsIds, businessId);
          } else {
            return of(true);
          }
        }),
        switchMap(() => {
          const productsIds = collection.products.map(product => product.id);
          const deletedProductsIds = collection.initialProducts
            .map(product => product.id)
            .filter(id => !productsIds.includes(id));

          if (deletedProductsIds.length > 0) {
            return forkJoin(
              deletedProductsIds.map((deletedProductsId) => {
                return this.getProduct(deletedProductsId).pipe(
                  map((data) => {
                    const product: Product = data.data.product;
                    product.collections = product.collections.filter(
                      removedCollection => removedCollection._id !== collection._id,
                    );

                    return product;
                  }),
                  switchMap(product => this.createProduct(product, businessId)),
                );
              }),
            );
          } else {
            return of(true);
          }
        }),
        map(() => requestCollection),
      );
    } else {
      return this.createCollection(requestCollection, businessId);
    }
  }

  createCollection(collection: Collection, businessId: string): Observable<Collection> {
    return this.http.post<Collection>(`${this.env.backend.products}/collections/${businessId}`, collection).pipe(
      catchError((error: HttpErrorResponse) => of({} as Collection)),
      shareReplay(1),
    );
  }

  postCopyCollection(collectionIds: string[], parent: string, businessId: string, prefix = 'copy'): Observable<any> {
    return this.http.post<any>(
      `${this.env.backend.products}/collections/${businessId}/copy`,
      { collectionIds, parent: parent ?? null, prefix },
    ).pipe(
      catchError((error: HttpErrorResponse) => of({} as any)),
      shareReplay(1),
    );
  }

  updateCollection(collectionId: string, collection: Collection, businessId: string): Observable<Collection> {
    return this.http
      .patch<Collection>(`${this.env.backend.products}/collections/${businessId}/${collectionId}`, collection)
      .pipe(
        catchError((error: HttpErrorResponse) => of({} as Collection)),
        shareReplay(1),
      );
  }

  deleteCollections(ids: string[], businessId: string): Observable<Collection> {
    return this.http
      .request<Collection>('delete', `${this.env.backend.products}/collections/${businessId}/list`, { body: { ids } })
      .pipe(
        catchError((error: HttpErrorResponse) => of({} as Collection)),
        shareReplay(1),
      );
  }

  addProductsToCollection(collectionId: string, productsIds: string[], businessId: string): Observable<Collection> {
    return this.http
      .put<Collection>(`${this.env.backend.products}/collections/${businessId}/${collectionId}/products/associate`, {
        ids: productsIds,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => of({} as Collection)),
        shareReplay(1),
      );
  }

  getCategories(businessUuid: string, titleChunk: string, page: number, perPage: number): Observable<Category | any> {
    return this.apollo.use(ApolloBaseName.products).query({
      query: GET_CATEGORIES_QUERY,
      variables: {
        businessUuid,
        titleChunk,
        page: Number(page),
        perPage: Number(perPage),
      },
      fetchPolicy: NO_CACHE_POLICY,
    });
  }

  createCategory(businessUuid: string, title: string): Observable<Category | any> {
    return this.apollo.use(ApolloBaseName.products).mutate({
      mutation: CREATE_CATEGORY_QUERY,
      variables: {
        businessUuid,
        title,
      },
    });
  }

  isSkuUsed(sku: string, businessUuid: string, productId: string): Observable<any> {
    const checkTasks: Array<Observable<boolean>> = [
      this.apollo
        .use(ApolloBaseName.products)
        .query({
          query: IS_SKU_USED_QUERY,
          variables: {
            sku,
            businessUuid,
            productId,
          },
          fetchPolicy: NO_CACHE_POLICY,
        })
        .pipe(
          map(() => false),
          catchError(() => of(true)),
        ),
    ];

    if (sku) {
      checkTasks.push(
        this.http
          .get<InventoryInterface>(`${this.env.backend.inventory}/api/business/${businessUuid}/inventory/sku/${sku}`)
          .pipe(
            catchError((error: HttpErrorResponse) => {
              if (error.status === 404) {
                return of({
                  sku: '',
                });
              }

              return throwError(error);
            }),
            map((response: any) => !!response.sku),
          ),
      );
    }

    return combineLatest([...checkTasks]).pipe(map(([gqlQuery, mdb]) => gqlQuery || !!mdb));
  }

  getInventoryBySKU(sku: string, businessUuid: string): Observable<InventoryInterface> {
    if (!sku) {
      return of({} as InventoryInterface);
    } else  {
      return this.http
        .get<InventoryInterface>(`${this.env.backend.inventory}/api/business/${businessUuid}/inventory/sku/${sku}`)
        .pipe(
          catchError((error: HttpErrorResponse) => of({} as InventoryInterface)),
          shareReplay(1),
        );
    }
  }

  getInventoryList(businessUuid: string): Observable<InventoryInterface[]> {
    return this.http
      .get<InventoryInterface[]>(`${this.env.backend.inventory}/api/business/${businessUuid}/inventory`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          /* tslint:disable-next-line no-console */
          console.error(error);

          return of([]);
        }),
        shareReplay(1),
      );
  }

  postInventory(businessUuid: string, inventory: NewInventoryInterface): Observable<void> {
    return this.http
      .post<void>(`${this.env.backend.inventory}/api/business/${businessUuid}/inventory`, inventory)
      .pipe(map(() => null));
  }

  patchInventorySKU(sku: string, businessUuid: string, inventory: UpdateInventoryInterface): Observable<void> {
    return this.http
      .patch<void>(`${this.env.backend.inventory}/api/business/${businessUuid}/inventory/sku/${sku}`, inventory)
      .pipe(map(() => null));
  }

  patchInventoryStock(sku: string, businessUuid: string, quantity: number): Observable<void> {
    if (quantity < 0) {
      return this.http.patch<void>(
        `${this.env.backend.inventory}/api/business/${businessUuid}/inventory/sku/${sku}/subtract`,
        {
          quantity: -quantity,
        },
      );
    } else {
      return this.http.patch<void>(
        `${this.env.backend.inventory}/api/business/${businessUuid}/inventory/sku/${sku}/add`,
        {
          quantity,
        },
      );
    }
  }

  getApplicationConfig(businessId: string): Observable<any> {
    return of(this.env).pipe(
      switchMap((config: any) => {
        if (!(config && config.backend)) {
          return of(undefined);
        }
        const apiURL = `${config.backend.commerceos}/api/apps/business/${businessId}`;

        return this.http
          .get<any>(apiURL)
          .pipe(map((apps: any) => (apps || []).find((app: any) => app.code === 'products')));
      }),
    );
  }

  getPageElement(pageId: string, elementId: string): Observable<any> {
    return this.http.get<any>(`${this.env.backend.builder}/api/pages/${pageId}/${elementId}`);
  }

  patchPageElement(pageId: string, elementId: string, element: any): Observable<void> {
    return this.http.patch<void>(`${this.env.backend.builder}/api/pages/${pageId}/${elementId}`, element);
  }

  updatePageElement(pageId: string, elementId: string, elementProps: any): Observable<void> {
    return this.http.post<void>(`${this.env.backend.builder}/api/pages/${pageId}/actions`, [
      {
        type: 'element.update',
        payload: {
          elementId,
          elementProps,
        },
      },
    ]);
  }

  getBillingIntegrationConnectionStatus(businessUuid: string): Observable<{ installed: boolean }> {
    return this.http.get<{ installed: boolean }>(
      `${this.env.backend.connect}/api/business/${businessUuid}/integration/billing-subscriptions`,
    );
  }

  getBillingIntegrationDetails(): Observable<{ extension: { url: string } }> {
    return this.http.get<{ extension: { url: string } }>(
      `${this.env.backend.connect}/api/integration/billing-subscriptions`,
    );
  }

  getBillingIntegrationProduct(
    url: string,
    businessUuid: string,
    productUuid: string,
  ): Observable<RecurringBillingDataInterface> {
    return this.http.get<RecurringBillingDataInterface>(`${url}/products/${businessUuid}/${productUuid}`);
  }

  addBillingIntegrationProduct(
    url: string,
    businessUuid: string,
    data: AddBillingIntegrationProductInterface,
  ): Observable<void> {
    return this.http.post<void>(`${url}/products/${businessUuid}/enable`, data);
  }

  removeBillingIntegrationProduct(url: string, businessUuid: string, productUuid: string): Observable<void> {
    return this.http.post<void>(`${url}/products/${businessUuid}/disable/${productUuid}`, {});
  }

  getBusinessSetting() {
    return this.http.get<any>(`${this.env.backend.users}/api/business/${this.envService.businessId}`);
  }

  editBillingIntegrationProduct(
    url: string,
    businessUuid: string,
    productUuid: string,
    data: EditBillingIntegrationProductInterface,
  ): Observable<void> {
    return this.http.post<void>(`${url}/products/${businessUuid}/${productUuid}`, data);
  }

  private updateOrCreateInventory(
    sku: string,
    businessUuid: string,
    product: ProductInventoryInterface,
  ): Observable<void> {
    return this.getInventoryBySKU(sku, businessUuid).pipe(
      switchMap((inventory) => {
        if (!inventory.sku) {
          return this.postInventory(businessUuid, {
            sku,
            barcode: product.barcode,
            isNegativeStockAllowed: false,
            isTrackable: product.inventoryTrackingEnabled,
            stock: 0,
            lowStock: product.lowInventory,
            emailLowStock: product.emailLowStock,
          }).pipe(map(() => inventory));
        }

        return of(inventory);
      }),
      switchMap((inventory) => {
        // tslint:disable-next-line:one-variable-per-declaration
        const stock: number = this.getNumber(inventory.stock),
          count: number = this.getNumber(product.inventory);
        const updateTasks: Array<Observable<any>> = [];
        if (stock !== count) {
          updateTasks.push(this.patchInventoryStock(sku, businessUuid, count - stock));
        }
        if (
          inventory.barcode !== product.barcode
          || (inventory.isTrackable || false) !== product.inventoryTrackingEnabled
          || inventory.lowStock !== product.lowInventory
          || (inventory.emailLowStock ?? false) !== product.emailLowStock
        ) {
          updateTasks.push(
            this.patchInventorySKU(sku, businessUuid, {
              sku,
              barcode: product.barcode,
              lowStock: product.lowInventory,
              emailLowStock: product.emailLowStock,
              isTrackable: product.inventoryTrackingEnabled || false,
            }),
          );
        }
        if (!updateTasks.length) {
          return of(undefined);
        } else {
          return combineLatest([...updateTasks]).pipe(map(() => undefined));
        }
      }),
    );
  }

  private getProductQLData(product: ProductModel, businessUuid: string): any {
    const productTmp = {
      businessUuid,
      images: product.images,
      id: product.id || undefined,
      company: product.company,
      country: product.country,
      language: product.language,
      title: product.title,
      description: product.description,
      sale: {
        onSales: product.onSales,
        salePrice: product.salePrice,
        saleEndDate: product.saleEndDate && moment(product.saleEndDate, 'DD.MM.YYYY').format('YYYY-MM-DD'),
        saleStartDate: product.saleEndDate && moment(product.saleStartDate, 'DD.MM.YYYY').format('YYYY-MM-DD'),
      },
      price: product.price,
      priceTable: product.priceTable,
      recommendations: product.recommendations,
      vatRate: product.vatRate,
      sku: product.sku,
      barcode: product.barcode,
      type: product.type,
      active: product.active,
      channelSets: product.channelSets,
      categories: product.categories,
      collections: (product.collections || []).map(collection => collection._id),
      variants: (product.variants || []).map(variant => ({
        ...omit(variant, [
          'lowInventory',
          'emailLowStock',
          'salePrice',
          'onSales',
          'saleEndDate',
          'saleStartDate']),
        options: variant.options?.map((option) => {
          return {
            name: option.name,
            value: option.value,
            type: option.type,
          };
        }) || [],
        productType: undefined,
        available: undefined,
        inventory: undefined,
        inventoryTrackingEnabled: undefined,
      })),
      attributes: product.attributes,
      shipping: this.getShipping(product.shipping),
    };

    if (product?.seo?.title) {
      productTmp['seo'] = product.seo;
    }

    return productTmp;
  }

  private getShipping(shipping: ShippingSection): any {
    if (shipping) {
      return {
        weight: this.getNumber(shipping.weight),
        width: this.getNumber(shipping.width),
        length: this.getNumber(shipping.length),
        height: this.getNumber(shipping.height),
      };
    } else {
      return null;
    }
  }


  /* Folders */

  getFolderDocuments(folderId: string, searchData: any) {
    let path = `${this.env.backend.products}/folders/business/${this.envService.businessId}/root-documents`;
    if (folderId) {
      path = `${this.env.backend.products}/folders/business/${this.envService.businessId}/folder/${folderId}/documents`;
    }

    return this.http.get<any>(path, { params: this.getSearchParams(searchData) });
  }

  getSkusStock(skus) {
    let path = `${this.env.backend.inventory}/api/business/${this.envService.businessId}/inventory/sku/stock`;

    return this.http.post<FolderItem>(path, { skus });
  }

  getFlatFolders(): Observable<FolderItem[]> {
    return this.http.get<FolderItem[]>(`${this.env.backend.products}/folders/business/${this.envService.businessId}`);
  }

  getFolders(): Observable<FolderItem[]> {
    return this.http.get<FolderItem[]>(
      `${this.env.backend.products}/folders/business/${this.envService.businessId}/tree`
    );
  }

  postFolder(folderData: FolderItem): Observable<FolderItem> {
    return this.http.post<FolderItem>(
      `${this.env.backend.products}/folders/business/${this.envService.businessId}`, folderData
    );
  }

  patchFolder(folderData: FolderItem): Observable<FolderItem> {
    const folderId = folderData._id;
    delete folderData._id;

    return this.http.patch<FolderItem>(
      `${this.env.backend.products}/folders/business/${this.envService.businessId}/folder/${folderId}`, folderData
    );
  }

  patchFolderPosition(positions: any[]): Observable<FolderItem> {
    return this.http.post<FolderItem>(
      `${this.env.backend.products}/folders/business/${this.envService.businessId}/update-positions`,
      { positions }
    );
  }

  deleteFolder(folderId: string): Observable<FolderItem> {
    return this.http.delete<FolderItem>(
      `${this.env.backend.products}/folders/business/${this.envService.businessId}/folder/${folderId}`
    );
  }

  moveToFolder(folderId: string, documentId: string) {
    return this.http.post(`${this.env.backend.products}/folders/business/${this.envService.businessId}`
    + `/document/${documentId}/move-to-folder/${folderId}`, null);
  }

  moveToRoot(documentId: string) {
    return this.http.post(`${this.env.backend.products}/folders/business/${this.envService.businessId}`
    + `/document/${documentId}/move-to-root`, null);
  }

  defaultFolder(): Observable<FolderItem[]> {
    return this.http.get<FolderItem[]>(`${this.env.backend.products}/api/folders/product/default`);
  }

  defaultFolderDocuments(searchData) {
    return this.http.get(
      `${this.env.backend.products}/folders/product/default/documents`,
      { params: this.getSearchParams(searchData) }
    );
  }

  /* Rules */

  getRulesValues(): Observable<RuleValues> {
    return this.http.get<RuleValues>(`${this.env.backend.products}/rules/values`);
  }

  getRules(): Observable<any> {
    return this.http.get(`${this.env.backend.products}/rules/business/${this.envService.businessId}`);
  }

  createRule(data): Observable<any> {
    return this.http.post(`${this.env.backend.products}/rules/business/${this.envService.businessId}`, data);
  }

  updateRule(data, ruleId: string): Observable<any> {
    return this.http.patch(
      `${this.env.backend.products}/rules/business/${this.envService.businessId}/rule/${ruleId}`, data);
  }

  deleteRule(ruleId: string): Observable<any> {
    return this.http.delete(`${this.env.backend.products}/rules/business/${this.envService.businessId}/rule/${ruleId}`);
  }

  getRuleDetails(ruleId: string): Observable<any> {
    return this.http.get(
      `${this.env.backend.products}​/rules​/business​/${this.envService.businessId}​/rule​/${ruleId}`);
  }

  private getSearchParams(searchData: any): HttpParams {
    const searchDataCopy = cloneDeep(searchData);
    let searchParams: HttpParams = new HttpParams()
      .set('sort[0][field]',
        searchDataCopy.orderBy ? searchDataCopy.orderBy.replace(/p\./g, '') : ProductsOrderBy.UpdateAt)
      .set('sort[0][direction]', searchDataCopy.direction ? searchDataCopy.direction : Direction.DESC)
      .set('limit', searchDataCopy.perPage ? `${searchDataCopy.perPage}` : '10')
      .set('page', searchDataCopy.page ? `${searchDataCopy.page}` : '1')
      .set('filters[isHeadline][0][condition]', 'isNot')
      .set('filters[isHeadline][0][value][0]', 'true');

    if (Object.keys(searchDataCopy?.configuration ?? []).length) {
      const flattenParams: { [propName: string]: string } = flatten({ configuration: searchDataCopy.configuration });

      forIn(flattenParams, (propValue: string, propName: string) => {
        const httpParamName: string = propName.split('.')
          .map((element: string, index: number) => {
            if (index !== 0) {
              return  PARAMS_MAP[element] || `[${element}]`;
            }

            return 'filters';
          })
          .join('');

        searchParams = searchParams.set(httpParamName, propValue);
      });
    }

    // Products are sorted by title, but folders by name.
    if (searchDataCopy.orderBy === ProductsOrderBy.TitleRAW) {
      searchParams = searchParams.set('sort[1][field]', ProductsOrderBy.Name);
      searchParams = searchParams.set('sort[1][direction]',
        searchDataCopy.direction ? searchDataCopy.direction : Direction.DESC);
    }

    return searchParams;
  }

  private getNumber(val: number | string): number {
    let result = 0;
    if (typeof val !== 'number') {
      try {
        result = Number(val);
      } catch (error) {
        result = 0;
      }
    } else {
      result = val;
    }
    if (isNaN(result)) {
      result = 0;
    }

    return result;
  }

  private prepareRequest(filters: Filter[] = []): FormattedProductsRequest {
    const knownFieldFilterKeys: FieldFilterKey[] = Object.keys(FieldFilterKey).map(key => FieldFilterKey[key]);
    const formattedRequest: FormattedProductsRequest = {
      paginationLimit: 20,
      pageNumber: 1,
      orderBy: 'createdAt',
      orderDirection: 'desc',
      filters: [],
      useNewFiltration: false,
    };

    filters.forEach((filter: Filter) => {
      switch (filter.key) {
        case 'limit':
          formattedRequest.paginationLimit = filter.value as number;
          break;
        case 'page':
          formattedRequest.pageNumber = filter.value as number;
          break;
        case 'orderBy':
          formattedRequest.orderBy = filter.value as string;
          break;
        case 'direction':
          formattedRequest.orderDirection = filter.value as string;
          break;
        case SearchFilterKey:
          formattedRequest.search = filter.value as string;
          break;
        default:
          break;
      }

      if (
        knownFieldFilterKeys.indexOf(filter.key as FieldFilterKey) !== -1 &&
        this.collectionFilterIsNotEmpty(filter)
      ) {
        formattedRequest.filters.push({
          field: filter.key,
          fieldType: filter.key === FieldFilterKey.Price ? 'number' : 'string',
          fieldCondition: filter.condition,
          value:
            filter.key === FieldFilterKey.Collections
              ? this.splitCollectionId(filter.value.toString())
              : `${filter.value}`,
        });
        formattedRequest.useNewFiltration = filter.key === FieldFilterKey.Collections;
      }
    });

    return formattedRequest;
  }

  public getContactsGroups(): Observable<any> {
    return this.http
      .get(`${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}`)
      .pipe(
        map((folders: ContactsFolderInterface[]) => {
          return folders.map((folder) => {
            return {
              id: folder._id,
              image: folder?.image ?? 'assets/icons/folder-grid.png',
              title: folder.name,
            };
          });
        }),
        catchError((error) => {

          return throwError(error);
        }));
  }

  public getContactsGroupsByIds(ids:string[]): Observable<PeProductOptionInterface[]> {

    let filter = {
      _id:{
        $in:ids,
      },
    };

    let params = new HttpParams()
      .set('filter' , JSON.stringify(filter));

    return this.http
      .get(`${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}` , { params:params })
      .pipe(
        map((folders: ContactsFolderInterface[]) => {
          return folders.map((folder) => {
            return {
              id: folder._id,
              value:folder._id ,
              image: folder?.image ?? 'assets/icons/folder-grid.png',
              title: folder.name,
            };
          });
        }),
        catchError((error) => {

          return throwError(error);
        }));
  }

  private getAllParams(object: {}, removeBraces: boolean = true): string {
    const res: string = JSON.stringify(object).replace(/"\w+"\s*:/g, '$1:');

    return removeBraces ? res.substr(1, res.length - 1) : res;
  }

  private splitCollectionId(collectionIds: any): string {
    return collectionIds.replaceAll(',', '","');
  }

  private collectionFilterIsNotEmpty(filter: Filter): boolean {
    const arr: string[] = filter.value as string[];

    return arr.length > 0;
  }
}
