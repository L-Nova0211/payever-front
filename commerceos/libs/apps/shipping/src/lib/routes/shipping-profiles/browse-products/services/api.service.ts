import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { Apollo } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import graphqlTag from 'graphql-tag';
import { combineLatest, forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { PEB_SHIPPING_API_PATH } from '../../../../enums/constants';
import {
  CREATE_CATEGORY_QUERY,
  DELETE_PRODUCT_QUERY,
  GET_CATEGORIES_QUERY,
  GET_PRODUCT_RECOMMENDATIONS_QUERY,
  GET_RECOMMENDATIONS_QUERY,
  IS_SKU_USED_QUERY,
  NO_CACHE_POLICY,
  PRODUCT_QUERY,
  QUERY_CREATE,
  QUERY_UPDATE,
} from '../../../../gql-queries/queries';
import { ShippingBoxInterface } from '../../../../interfaces';
import { RecurringBillingDataInterface } from '../../../../interfaces/products/billing.interface';
import { ChannelSetInterface } from '../../../../interfaces/products/channel-set.interface';
import { CollectionModel } from '../../../../interfaces/products/collection-model';
import { ConditionsType } from '../../../../interfaces/products/collection.enum';
import { Collection, CollectionsLoadedInterface } from '../../../../interfaces/products/collection.interface';
import { Direction } from '../../../../interfaces/products/direction.enum';
import { FieldFilterKey, SearchFilterKey } from '../../../../interfaces/products/filter.enum';
import { Filter, FormattedFilter } from '../../../../interfaces/products/filter.interface';
import { Order } from '../../../../interfaces/products/order.interface';
import { PaginationCamelCase } from '../../../../interfaces/products/pagination.interface';
import { ProductTypes } from '../../../../interfaces/products/product.enum';
import { Product, ProductInventoryInterface, ProductModel } from '../../../../interfaces/products/product.interface';
import { Responses } from '../../../../interfaces/products/response.interface';
import {
  Category,
  InventoryInterface,
  NewInventoryInterface,
  ShippingSection,
  UpdateInventoryInterface,
  VariantsSection,
} from '../../../../interfaces/products/section.interface';

const PRODUCT_FIELDS = `
  images
  id
  title
  description
  onSales
  price
  salePrice
  vatRate
  sku
  barcode
  currency
  type
  active
  categories{title}
  collections{_id, name, description}
  variants{id, images, options { name, value }, description, onSales, price, salePrice, sku, barcode}
  channelSets{id, type, name}
  shipping{weight, width, length, height}`;

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

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  public static model: ProductModel = {
    id: null,
    images: [],
    title: '',
    description: '',
    available: false,
    onSales: false,
    productType: ProductTypes.Physical,
    price: 0.0,
    salePrice: null,
    vatRate: 0,
    sku: '',
    inventory: 0,
    inventoryTrackingEnabled: false,
    barcode: '',
    categories: [],
    collections: [],
    channelSets: [],
    active: true,
    variants: [],
    shipping: null,
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
  };

  constructor(private apollo: Apollo,
              private http: HttpClient,
              private apmService: ApmService,
              @Inject(PEB_SHIPPING_API_PATH) private shippingApiPath: string,
              @Inject(PE_ENV) private env: EnvironmentConfigInterface) {}

  getProducts(
    filters: Filter[] = [],
    businessId: string,
    filterById: string[] = [],
    search: string = '',
    pagination: PaginationCamelCase = { page: 1, perPage: 20 },
    order: Order = { by: '', direction: Direction.DESC },
  ): Observable<any> {
    const request: FormattedProductsRequest = this.prepareRequest(filters);
    const ProductsQuery: any = graphqlTag`
      query {
        getProducts (
          businessUuid: "${businessId}",
          paginationLimit: ${pagination.perPage},
          pageNumber: ${pagination.page},
          orderBy: "${order.by}",
          orderDirection: "${order.direction}",
          filterById: ${JSON.stringify(filterById)},
          search: "${search || ''}",
          useNewFiltration: ${request.useNewFiltration},
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
            ${PRODUCT_FIELDS}
          }
          info {
            ${PRODUCT_LIST_INFO}
          }
        }
      }
    `;

    return this.apollo.use('products').subscribe({
      query: ProductsQuery,
      fetchPolicy: NO_CACHE_POLICY,
    });
  }

  getProductRecommendations(id: string): Observable<any> {
    return this.apollo.use('products').query({
      query: GET_PRODUCT_RECOMMENDATIONS_QUERY,
      variables: {
        id,
      },
      fetchPolicy: NO_CACHE_POLICY,
    });
  }

  getRecommendations(businessUuid: string): Observable<any> {
    return this.apollo.use('products').query({
      query: GET_RECOMMENDATIONS_QUERY,
      variables: {
        businessUuid,
      },
      fetchPolicy: NO_CACHE_POLICY,
    });
  }

  getWidgetProducts(businessId: string, includeIds: string[]): Observable<any> {
    const ProductsQuery: any = graphqlTag`
      query {
        getProducts (
          businessUuid: "${businessId}",
          paginationLimit: 100,
          pageNumber: 1,
          ${includeIds ? `includeIds: [${includeIds.map(i => `"${i}"`)}]` : ''}
        ) {
          products {
            ${PRODUCT_FIELDS}
          }
          info {
            ${PRODUCT_LIST_INFO}
          }
        }
      }
    `;

    return this.apollo.use('products').query({
      query: ProductsQuery,
      fetchPolicy: NO_CACHE_POLICY,
    });
  }

  getProductsByChannelSet(
    businessUuid: string,
    marketplaceId: string,
    existInMarketplace: boolean,
    filterById: string[] = [],
    unfilterById: string[] = [],
    filters: Filter[] = [],
  ): Observable<any> {
    const request: FormattedProductsRequest = this.prepareRequest(filters);
    const ProductsQuery: any = graphqlTag`
      query {
        getProductsByMarketplace (
          businessUuid: "${businessUuid}",
          orderBy: "${request.orderBy}",
          orderDirection: "${request.orderDirection}",
          pageNumber: ${request.pageNumber},
          paginationLimit: ${request.paginationLimit},
          channelSetId: "${marketplaceId}",
          existInChannelSet: ${existInMarketplace},
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
            .join('')}]
        ) {
          products {
            ${PRODUCT_FIELDS}
          }
          info {
            isChannelWithExisting
            ${PRODUCT_LIST_INFO}
          }
        }
      }
    `;

    return this.apollo.use('products').query({
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
    return this.apollo.use('products').mutate({
      mutation: graphqlTag`
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
    let query: any;
    const currentSKU: string = product.sku;
    if (product.id) {
      query = QUERY_UPDATE;
    } else {
      query = QUERY_CREATE;
    }

    return this.apollo
      .use('products')
      .mutate({
        mutation: query,
        variables: {
          product: this.getProductQLData(product, businessUuid),
        },
      })
      .pipe(
        switchMap((gqlResult) => {
          if (product.variants && product.variants.length) {
            const variantsReq: Observable<void>[] = product.variants.map((variant) => {
              return this.updateOrCreateInventory(variant.sku, businessUuid, variant);
            });

            return combineLatest([...variantsReq]).pipe(map(() => of(gqlResult)));
          }

          return this.updateOrCreateInventory(currentSKU, businessUuid, product).pipe(map(() => gqlResult));

        }),
      );
  }

  getProduct(id: string): Observable<Product | any> {
    return this.apollo
      .use('products')
      .query({
        query: PRODUCT_QUERY,
        variables: {
          id,
        },
        fetchPolicy: NO_CACHE_POLICY,
      })
      .pipe(
        switchMap((result: ApolloQueryResult<any>) => {
          const prodData: any = (result || { data: {} }).data.product || {};
          if (prodData.businessUuid) {
            if (prodData.variants && prodData.variants.length) {
              const getTasks: Observable<VariantsSection>[] = prodData.variants.map((variant: VariantsSection) => {
                return this.getInventoryBySKU(variant.sku, prodData.businessUuid).pipe(
                  map((inventory) => {
                    return {
                      ...variant,
                      barcode: inventory.barcode,
                      inventory: inventory.stock,
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
                  prodData.inventoryTrackingEnabled = exists ? data.isTrackable || false : prodData.inventoryTrackingEnabled;

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

  removeStoreItem(ids: string[]): Observable<Responses.Empty | any> {
    return this.apollo.use('products').mutate({
      mutation: DELETE_PRODUCT_QUERY,
      variables: {
        ids,
      },
    });
  }

  loadCollections(page: number, businessId: string): Observable<CollectionsLoadedInterface> {
    return this.http
      .get<CollectionsLoadedInterface>(`${this.env.backend.products}/collections/${businessId}?page=${page}&perPage=100`)
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
    };
    if (collection.description) {
      requestCollection.description = collection.description;
    }
    if (collection.conditions?.type !== ConditionsType.NoCondition) {
      requestCollection.automaticFillConditions = {
        strict: collection.conditions?.type === ConditionsType.AllConditions,
        filters: collection.conditions.filters
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
          const newProductsIds = [] as string[];

          if (newProductsIds.length > 0) {
            return this.addProductsToCollection(collection._id, newProductsIds, businessId);
          }

          return of(true);

        }),
        switchMap(() => {
          const productsIds = collection.products.map(product => product.id);
          const deletedProductsIds = collection.initialProducts.map(product => product.id).filter(id => !productsIds.includes(id));

          if (deletedProductsIds.length > 0) {
            return forkJoin(
              deletedProductsIds.map((deletedProductsId) => {
                return this.getProduct(deletedProductsId).pipe(
                  map((data) => {
                    const product: Product = data.data.product;
                    product.collections = product.collections.filter(removedCollection => removedCollection._id !== collection._id);

                    return product;
                  }),
                  switchMap(product => this.createProduct(product, businessId)),
                );
              }),
            );
          }

          return of(true);

        }),
        map(() => requestCollection as Collection),
      );
    }

    return this.createCollection(requestCollection, businessId);

  }

  createCollection(collection: Collection, businessId: string): Observable<Collection> {
    return this.http.post<Collection>(`${this.env.backend.products}/collections/${businessId}`, collection).pipe(
      catchError((error: HttpErrorResponse) => of({} as Collection)),
      shareReplay(1),
    );
  }

  updateCollection(collectionId: string, collection: Collection, businessId: string): Observable<Collection> {
    return this.http.patch<Collection>(`${this.env.backend.products}/collections/${businessId}/${collectionId}`, collection).pipe(
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
    return this.apollo.use('products').query({
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
    return this.apollo.use('products').mutate({
      mutation: CREATE_CATEGORY_QUERY,
      variables: {
        businessUuid,
        title,
      },
    });
  }

  isSkuUsed(sku: string, businessUuid: string, productId: string): Observable<any> {
    const checkTasks: Observable<boolean>[] = [
      this.apollo
        .use('products')
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
        this.http.get<InventoryInterface>(`${this.env.backend.inventory}/api/business/${businessUuid}/inventory/sku/${sku}`).pipe(
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
    }

    return this.http.get<InventoryInterface>(`${this.env.backend.inventory}/api/business/${businessUuid}/inventory/sku/${sku}`).pipe(
        catchError((error: HttpErrorResponse) => of({} as InventoryInterface)),
        shareReplay(1),
      );

  }

  getInventoryList(businessUuid: string): Observable<InventoryInterface[]> {
    return this.http.get<InventoryInterface[]>(`${this.env.backend.inventory}/api/business/${businessUuid}/inventory`).pipe(
      catchError((err) => {
        this.apmService.apm.captureError(JSON.stringify(err));

        return of([]);
      }),
      shareReplay(1),
    );
  }

  postInventory(businessUuid: string, inventory: NewInventoryInterface): Observable<void> {
    return this.http.post<void>(`${this.env.backend.inventory}/api/business/${businessUuid}/inventory`, inventory).pipe(map(() => null));
  }

  patchInventorySKU(sku: string, businessUuid: string, inventory: UpdateInventoryInterface): Observable<void> {
    return this.http
      .patch<void>(`${this.env.backend.inventory}/api/business/${businessUuid}/inventory/sku/${sku}`, inventory)
      .pipe(map(() => null));
  }

  patchInventoryStock(sku: string, businessUuid: string, quantity: number): Observable<void> {
    if (quantity < 0) {
      return this.http.patch<void>(`${this.env.backend.inventory}/api/business/${businessUuid}/inventory/sku/${sku}/subtract`, {
        quantity: -quantity,
      });
    }

    return this.http.patch<void>(`${this.env.backend.inventory}/api/business/${businessUuid}/inventory/sku/${sku}/add`, {
        quantity,
      });

  }

  getApplicationConfig(businessId: string): Observable<any> {
    return of(this.env).pipe(
      switchMap((config: any) => {
        if (!(config && config.backend)) {
          return of(undefined);
        }
        const apiURL = `${config.backend.commerceos}/api/apps/business/${businessId}`;

        return this.http.get<any>(apiURL).pipe(map((apps: any) => (apps || []).find((app: any) => app.code === 'products')));
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
    return this.http.get<{ extension: { url: string } }>(`${this.env.backend.connect}/api/integration/billing-subscriptions`);
  }

  getBillingIntegrationProduct(url: string, businessUuid: string, productUuid: string): Observable<RecurringBillingDataInterface> {
    return this.http.get<RecurringBillingDataInterface>(`${url}/products/${businessUuid}/${productUuid}`);
  }

  addBillingIntegrationProduct(url: string, businessUuid: string, data: AddBillingIntegrationProductInterface): Observable<void> {
    return this.http.post<void>(`${url}/products/${businessUuid}/enable`, data);
  }

  removeBillingIntegrationProduct(url: string, businessUuid: string, productUuid: string): Observable<void> {
    return this.http.post<void>(`${url}/products/${businessUuid}/disable/${productUuid}`, {});
  }

  editBillingIntegrationProduct(
    url: string,
    businessUuid: string,
    productUuid: string,
    data: EditBillingIntegrationProductInterface,
  ): Observable<void> {
    return this.http.post<void>(`${url}/products/${businessUuid}/${productUuid}`, data);
  }

  private updateOrCreateInventory(sku: string, businessUuid: string, product: ProductInventoryInterface): Observable<void> {
    return this.getInventoryBySKU(sku, businessUuid).pipe(
      switchMap((inventory) => {
        if (!inventory.sku) {
          return this.postInventory(businessUuid, {
            sku,
            barcode: product.barcode,
            isNegativeStockAllowed: false,
            isTrackable: product.inventoryTrackingEnabled,
            stock: 0,
          }).pipe(map(() => inventory));
        }

        return of(inventory);
      }),
      switchMap((inventory) => {
        const stock: number = this.getNumber(inventory.stock),
          count: number = this.getNumber(product.inventory);
        const updateTasks: Observable<any>[] = [];
        if (stock !== count) {
          updateTasks.push(this.patchInventoryStock(sku, businessUuid, count - stock));
        }
        if (inventory.barcode !== product.barcode || (inventory.isTrackable || false) !== product.inventoryTrackingEnabled) {
          updateTasks.push(
            this.patchInventorySKU(sku, businessUuid, {
              sku,
              barcode: product.barcode,
              isTrackable: product.inventoryTrackingEnabled || false,
            }),
          );
        }
        if (!updateTasks.length) {
          return of(undefined);
        }

        return combineLatest([...updateTasks]).pipe(map(() => undefined));

      }),
    );
  }

  private getProductQLData(product: ProductModel, businessUuid: string): any {
    return {
      businessUuid,
      images: product.images,
      id: product.id || undefined,
      title: product.title,
      description: product.description,
      onSales: product.onSales,
      price: product.price,
      recommendations: product.recommendations,
      salePrice: product.salePrice,
      vatRate: product.vatRate,
      sku: product.sku,
      barcode: product.barcode,
      type: product.type,
      active: product.active,
      channelSets: product.channelSets,
      categories: product.categories,
      collections: (product.collections || []).map(collection => collection._id),
      variants: (product.variants || []).map(variant => ({
        ...variant,
        options:
          variant.options?.map((option) => {
            return {
              name: option.name,
              value: option.value,
            };
          }) || [],
        productType: undefined,
        available: undefined,
        inventory: undefined,
        inventoryTrackingEnabled: undefined,
      })),
      shipping: this.getShipping(product.shipping),
    };
  }

  private getShipping(shipping: ShippingSection): any {
    if (shipping) {
      return {
        weight: this.getNumber(shipping.weight),
        width: this.getNumber(shipping.width),
        length: this.getNumber(shipping.length),
        height: this.getNumber(shipping.height),
      };
    }

    return null;

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
      result = val as number;
    }
    if (isNaN(result)) {
      result = 0;
    }

    return result;
  }

  private prepareRequest(filters: Filter[] = []): FormattedProductsRequest {
    const knownFieldFilterKeys: FieldFilterKey[] = Object.values(FieldFilterKey);
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

      if (knownFieldFilterKeys.indexOf(filter.key as FieldFilterKey) !== -1 && this.collectionFilterIsNotEmpty(filter)) {
        formattedRequest.filters.push({
          field: filter.key,
          fieldType: filter.key === FieldFilterKey.Price ? 'number' : 'string',
          fieldCondition: filter.condition,
          value: filter.key === FieldFilterKey.Collections ? this.splitCollectionId(filter.value.toString()) : `${filter.value}`,
        });
        formattedRequest.useNewFiltration = filter.key === FieldFilterKey.Collections;
      }
    });

    return formattedRequest;
  }

  private getAllParams(object: {}, removeBraces: boolean = true): string {
    const res: string = JSON.stringify(object).replace(/"(\w+)"\s*:/g, '$1:');

    return removeBraces ? res.substr(1, res.length - 1) : res;
  }

  private splitCollectionId(collectionIds: any): string {
    return collectionIds.replaceAll(',', '","');
  }

  private collectionFilterIsNotEmpty(filter: Filter): boolean {
    const arr: string[] = filter.value as string[];

    return arr.length > 0;
  }

  getCarrierBoxes(businessId) {
    const baseUrl = `${this.shippingApiPath}/business/${businessId}/shipping-box`;

    return this.http.get(`${baseUrl}/carrier-boxes`);
  }

  actionPackage(data: any, businessId, id: string = null) {
    const baseUrl = `${this.shippingApiPath}/business/${businessId}/shipping-box`;

    if (id) {
      const payload: ShippingBoxInterface = {
        name: data.data.name,
        dimensionUnit: data.data.dimensionUnit,
        weightUnit: data.data.weightUnit,
        length: data.data.length,
        width: data.data.width,
        height: data.data.height,
        weight: data.data.weight,
        type: data.data.type,
        isDefault: data.data.isDefault,
      };

      return this.http.put(`${baseUrl}/${id}`, payload);
    }

    return this.http.post(`${baseUrl}`, data);
  }

  addCarrierPackage(payload, businessId) {
    const baseUrl = `${this.shippingApiPath}/business/${businessId}/shipping-box/multi`;

    return this.http.post(`${baseUrl}`, payload);
  }

  deletePackage(id: string, businessId) {
    const baseUrl = `${this.shippingApiPath}/business/${businessId}/shipping-box`;

    return this.http.delete(`${baseUrl}/${id}`);
  }
}
