import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { Collection, CollectionsLoadedInterface } from '../../../../interfaces/products/collection.interface';
import { Direction } from '../../../../interfaces/products/direction.enum';
import { ProductsOrderBy } from '../../../../interfaces/products/order-by.enum';
import { Order } from '../../../../interfaces/products/order.interface';
import { PaginationCamelCase } from '../../../../interfaces/products/pagination.interface';
import { Product, ProductsResponse } from '../../../../interfaces/products/product.interface';
import { AbstractService } from '../../../../services/abstract.service';

import { ProductsApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProductsListService extends AbstractService implements OnDestroy {
  private productsStream$ = new BehaviorSubject<Product[]>([]);
  private loadingStream$ = new BehaviorSubject<boolean>(false);
  private searchStringStream$ = new BehaviorSubject<string>(null);
  private orderStream$ = new BehaviorSubject<Order>({
    by: 'createdAt',
    direction: Direction.DESC,
  });

  private paginationStream$ = new BehaviorSubject<PaginationCamelCase>({
    page: 1,
    pageCount: 1,
    perPage: 20,
    itemCount: 20,
  });

  private collectionsStream$ = new BehaviorSubject<Collection[]>([]);

  products$ = this.productsStream$.asObservable();
  loading$ = this.loadingStream$.asObservable();
  searchString$ = this.searchStringStream$.asObservable();
  order$ = this.orderStream$.asObservable();
  collections$ = this.collectionsStream$.asObservable();
  pagination$ = this.paginationStream$.asObservable();

  set products(items: Product[]) {
    this.productsStream$.next(items);
  }

  get products(): Product[] {
    return this.productsStream$.value;
  }

  set loading(value: boolean) {
    this.loadingStream$.next(value);
  }

  get loading(): boolean {
    return this.loadingStream$.value;
  }

  set searchString(value: string) {
    this.searchStringStream$.next(value);
  }

  get searchString(): string {
    return this.searchStringStream$.value;
  }

  set order(value: Order) {
    this.orderStream$.next(value);
  }

  get order(): Order {
    return this.orderStream$.value;
  }

  set pagination(value: PaginationCamelCase) {
    this.paginationStream$.next(value);
  }

  get pagination(): PaginationCamelCase {
    return this.paginationStream$.value;
  }

  set collections(items: Collection[]) {
    this.collectionsStream$.next(items);
  }

  get collections(): Collection[] {
    return this.collectionsStream$.value;
  }

  get hasNextPage(): boolean {
    return this.pagination.page < this.pagination.pageCount;
  }

  constructor(private productsApiService: ProductsApiService, private envService: EnvService) {
    super();
  }

  loadNextPage() {
    if (this.hasNextPage) {
      this.patchPagination({
        page: this.pagination.page + 1,
      });
    }
  }

  toggleOrderByField(field: ProductsOrderBy, direction?: Direction) {
    const updatedDirection =
      direction ?? (this.order.by === field ? (this.order.direction === Direction.ASC ? Direction.DESC : Direction.ASC) : Direction.DESC);
    this.order = {
      by: field,
      direction: updatedDirection,
    };
  }

  loadProducts(filters: any[], loadMore = false): Observable<ProductsResponse> {
    this.loading = true;

    return this.productsApiService
      .getProducts(filters, this.envService.businessId, [], this.searchString, this.pagination, this.order)
      .pipe(
        map((data: ProductsResponse) => ({
          ...data,
          data: {
            ...data.data,
            getProducts: {
              ...data.data.getProducts,
              products: data.data.getProducts.products.filter(Boolean),
            },
          },
        })),
        tap(({ data }: ProductsResponse) => {
          const { info, products } = data.getProducts;
          const pagination = info.pagination;

          this.products = loadMore ? [...this.products, ...products] : products;
          this.pagination = {
            page: pagination.page,
            pageCount: pagination.page_count,
            perPage: pagination.per_page,
            itemCount: pagination.item_count,
          };
        }),
        finalize(() => (this.loading = false)),
      );
  }

  addProductsToCollection(collectionId: string, selectedIds: string[]): Observable<Collection> {
    return this.productsApiService.addProductsToCollection(collectionId, selectedIds, this.envService.businessId);
  }

  resetProducts() {
    this.searchString = '';

    return this.loadProducts([]);
  }

  loadCollections(): Observable<CollectionsLoadedInterface> {
    return this.productsApiService.loadCollections(1, this.envService.businessId).pipe(
      tap((data: CollectionsLoadedInterface) => {
        this.collectionsStream$.next(data.collections);
      }),
    );
  }

  patchPagination(value: Partial<PaginationCamelCase>) {
    this.pagination = {
      ...this.pagination,
      ...value,
    };
  }

  ngOnDestroy() {
    this.productsStream$.next([]);
    super.ngOnDestroy();
  }
}
