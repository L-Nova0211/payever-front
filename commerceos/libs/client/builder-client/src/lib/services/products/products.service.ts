import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, EMPTY, merge, Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, pluck, takeUntil, tap } from 'rxjs/operators';

import { PebElementContextState } from '@pe/builder-core';
import { PE_ENV } from '@pe/common';

import { PebClientStateService } from '../state.service';
import { PebClientStoreService } from '../store.service';

interface Filters {
  variants: string[];
  categories: string[];
}

@Injectable()
export class ProductsService {
  destroyed$: Observable<boolean> = EMPTY;

  private filtersStream$ = new BehaviorSubject<Filters>({
    variants: [],
    categories: [],
  });

  filters$: Observable<Filters> = this.filtersStream$.asObservable();
  sortBy$: Observable<string> = this.stateService.state$.pipe(
    map(state => state['@category'].data?.sortBy),
    distinctUntilChanged(),
    takeUntil(this.destroyed$),
  );

  private initialFilters = [];

  get activeCategoryTitle() {
    return this.stateService.state['@category'].data.title;
  }

  get sortByCategory() {
    return this.stateService.state['@category'].data.sortBy;
  }

  set sortByCategory(sortBy: string) {
    this.stateService.patchCategoryData({ sortBy });
    this.getCategoryProductsData(null);
  }

  get categoryFilters(): any[] {
    return this.stateService.state['@category'].data.variants;
  }

  get app() {
    return this.clientStore.app;
  }

  get theme() {
    return this.clientStore.theme;
  }

  constructor(
    @Inject(PE_ENV) private env: any,
    private http: HttpClient,
    private clientStore: PebClientStoreService,
    @Inject(PLATFORM_ID) private platform: string,
    private stateService: PebClientStateService,
  ) {
  }

  getProductById(id: string) {
    return this.http.post(
      `${this.env.backend.products}/products`,
      {
        query: `{
          getProductForBuilder (
            business: "${this.app.businessId}",
            id: "${id}",
          ) {
            result {
              id
              title
              imagesUrl
              videosUrl
              active
              currency
              vatRate
              price
              priceAndCurrency
              salePrice
              stock
              type
              description
              sku
              barcode
              categories { id title slug }
              recommendations { id images name }
              variants { id options { value } description price sku }
              attributes { name value type }
            }
          }
        }`,
      }
    ).pipe(
      pluck('data', 'getProductForBuilder'),
    );
  }

  getProductBySlug(slug: string) {
    return this.http.post(
      `${this.env.backend.products}/products`,
      {
        query: `{
          getProductBySlugForBuilder (
            slug: "${slug}",
            business: "${this.app.businessId}",
          ) {
            result {
              id
              title
              imagesUrl
              videosUrl
              active
              currency
              vatRate
              price
              priceAndCurrency
              salePrice
              stock
              type
              description
              sku
              barcode
              categories { id title slug }
              recommendations { id images name }
              variants { id options { value } description price sku }
              attributes { name value type }
            }
          }
        }`
      }
    ).pipe(
      pluck('data', 'getProductBySlugForBuilder'),
    );
  }

  getById(id: string) {
    this.stateService.updateProductState(id, PebElementContextState.Loading);

    return this.http
      .post(`${this.env.backend.products}/products`, {
        operationName: 'getProducts',
        query: `query getProducts {
        product(id: "${id}") {
          businessUuid
          imagesUrl
          _id
          title
          description
          price
          salePrice
          currency
          variants {
            id
            title
            description
            price
            salePrice
            images
            options {
              _id
              name
              value
            }
            sku
          }
        }
      }
      `,
        variables: {},
      })
      .pipe(
        map((result: any) => {
          const product = result?.data?.product;
          if (product) {
            return this.mapProductData(product);
          }

          return product;
        }),
      );
  }

  getByIds(ids: string[]) {
    return merge(
      of({ state: PebElementContextState.Loading }),
      this.http
        .post(`${this.env.backend.products}/products`, {
          query: `{
          getProducts(businessUuid: "${this.app.business.id}", includeIds: [${ids.map(
            i => `"${i}"`,
          )}], paginationLimit: 20, pageNumber: 1) {
            products {
              imagesUrl
              _id
              title
              description
              price
              salePrice
              currency
            }
          }
        }`,
        })
        .pipe(
          map((result: any) => result.data.getProducts.products),
          map(data => data.map(this.mapProductData)),
          map(data => ({
            state: PebElementContextState.Ready,
            data,
          })),
          catchError(err =>
            of({
              state: PebElementContextState.Error,
              data: [],
            }),
          ),
        ),
    );
  }

  private mapProductData(product) {
    return {
      id: product?._id,
      title: product.title,
      description: product?.description,
      price: product.price,
      salePrice: product.salePrice,
      currency: product.currency,
      image: product.imagesUrl[0],
      images: product.imagesUrl,
      variants: product.variants
        ? product.variants.map(v => ({
            id: v?.id,
            title: v.title,
            description: v?.description,
            price: v.price,
            salePrice: v.salePrice,
            options: v.options,
            images: v.images.map(i => `${this.env.custom.storage}/products/${i}`),
          }))
        : null,
    };
  }

  getProductsCategories() {
    return this.http
      .post(`${this.env.backend.products}/products`, {
        query: `{
        getUsedCategories (
          businessUuid: "${this.app.business.id}",
        ) {
          id
          title
        }
      }`,
      })
      .pipe(
        map((result: any) => result.data.getUsedCategories),
        catchError(err => of([])),
      );
  }

  getCategoryFilters(filters: any[]) {
    filters =
      (filters &&
        filters.length &&
        [].reduce((acc, curr, index) => {
          if (index % 2 !== 0) {
            acc[acc.length - 1].filters.push(curr);

            return acc;
          }

          return [
            ...acc,
            {
              field: 'options',
              fieldType: 'nested',
              fieldCondition: 'is',
              filters: [curr],
            },
          ];
        }, [])) ||
      [];

    return this.http
      .post(`${this.env.backend.products}/${this.app.business.id}/filter-options`, [
        this.activeCategoryTitle
          ? {
              fieldType: 'parent',
              fieldCondition: 'is',
              field: 'parentProduct',
              filters: [
                {
                  fieldType: 'nested',
                  fieldCondition: 'is',
                  field: 'categories',
                  filters: [
                    {
                      field: 'title',
                      fieldType: 'string',
                      fieldCondition: 'is',
                      value: this.activeCategoryTitle,
                    },
                  ],
                },
              ],
            }
          : {},
        ...filters,
      ])
      .pipe(
        map((f: { name: string; values: string[] }[]) =>
          f.map(({ name, values }) => ({
            name,
            active: false,
            disabled: false,
            children: values.map(value => ({
              name: value,
              active: false,
              disabled: false,
            })),
          })),
        ),
        tap(f => (this.initialFilters = f)),
        catchError(err => of([])),
      );
  }

  getCategoryCategories(currentCategoryTitle: string) {
    return this.http
      .post(`${this.env.backend.products}/products`, {
        query: `{
        getUsedCategories(businessUuid: "${this.app.business.id}") {
        _id
        slug
        title
      }
    }`,
      })
      .pipe(
        map((result: any) => result?.data?.getUsedCategories),
        map(categories =>
          categories.map(category => ({
            ...category,
            active:
              decodeURIComponent(currentCategoryTitle) === category.title ||
              decodeURIComponent(currentCategoryTitle) === category.slug,
          })),
        ),
        catchError(err => of([])),
      );
  }

  getCategoryProductsData(filters: Filters) {
    if (!this.app?.business?.id) {
      return EMPTY;
    }

    const productsApi: string = this.env.backend.products;

    return this.http
      .post(`${productsApi}/products`, {
        query: `{
          getProducts(
            businessUuid: "${this.app.business.id}",
            paginationLimit: 100,
            pageNumber: 1,
            orderBy: "price",
            orderDirection: "${this.sortByCategory}",
            filters: [
              ${
                this.activeCategoryTitle
                  ? `
                  {
                    fieldType: "nested",
                    fieldCondition: "is",
                    field: "categories",
                    filters: [
                      {
                        field: "title",
                        fieldType: "string",
                        fieldCondition: "is",
                        value: "${this.activeCategoryTitle}",
                      }
                    ]
                  },
                `
                  : ''
              }
              ${
                filters && filters.variants?.length
                  ? `
              {
                field:"variant",
                fieldType:"child",
                fieldCondition: "is",
                filters: ${JSON.stringify(
                  (filters &&
                    filters.variants?.length && {
                      field: 'options',
                      fieldType: 'nested',
                      fieldCondition: 'is',
                      filters: filters.variants.reduce((acc, curr, index) => {
                        acc.push({
                          field: 'value',
                          fieldType: 'string',
                          fieldCondition: 'is',
                          value: curr,
                        });

                        return acc;
                      }, []),
                    }) ||
                    '',
                ).replace(/\"([^(\")"]+)\":/g, '$1:')},
              }
              `
                  : ''
              }
            ],
            useNewFiltration: true,
          ) {
            products {
              imagesUrl
              _id
              title
              description
              price
              salePrice
              currency
            }
          }
        }
        `,
      })
      .pipe(
        filter((result: any) => result && result.data && result.data.getProducts),
        map(result =>
          result.data.getProducts.products
            .filter(p => !!p)
            .map(p => ({
              data: this.mapProductData(p),
              state: PebElementContextState.Ready,
            })),
        ),
        catchError(err => of([])),
      );
  }

  toggleVariant(name: string) {
    const prevData = this.stateService.state['@category'].data;
    const prevFilterSteamValue = this.filtersStream$.value;
    const parent = prevData.variants.find(f => f.children.some(child => child.name === name));
    const isFilterExists = prevFilterSteamValue.variants.some(f => f === name);
    const newFilterSteamValue = isFilterExists
      ? prevFilterSteamValue.variants.filter(f => f !== name)
      : [...prevFilterSteamValue.variants, name];
    this.stateService.patchCategoryData({
      ...prevData,
      variants: prevData.variants.map(f =>
        f === parent
          ? {
              ...parent,
              children: parent.children
                .map(child =>
                  child.name === name
                    ? {
                        ...child,
                        active: !child.active,
                      }
                    : child,
                )
                .sort((a, b) => (a.active && !b.active ? -1 : 1)),
            }
          : f,
      ),
    });

    this.filtersStream$.next({
      ...this.filtersStream$.value,
      variants: newFilterSteamValue,
    });
  }

  resetFilters() {
    this.stateService.patchCategoryData({
      variants: this.initialFilters,
    });
    this.filtersStream$.next({ variants: [], categories: [] });
  }

  toggleFilters() {
    const prevData = this.stateService.state['@category'].data;
    this.stateService.patchCategoryData({
      shownFilters: !prevData.shownFilters,
    });
  }

  toggleFilter(fr: any) {
    const prevData = this.stateService.state['@pos-catalog'].data;
    const prevFilterSteamValue: any = this.filtersStream$.value;
    const parent = prevData.filters.find(f => f.children.some(child => child.name === fr.name));
    const isFilterExists = prevFilterSteamValue.some(f => f === fr.name);
    const newFilterSteamValue = isFilterExists
      ? prevFilterSteamValue.filter(f => f !== fr.name)
      : [...prevFilterSteamValue, fr.name];
    this.stateService.patchCategoryData({
      ...prevData,
      filters: prevData.filters.map(f =>
        f === parent
          ? {
              ...parent,
              children: parent.children
                .map(child =>
                  child.name === fr.name
                    ? {
                        ...child,
                        active: !child.active,
                      }
                    : child,
                )
                .sort((a, b) => (a.active && !b.active ? -1 : 1)),
            }
          : f,
      ),
    });

    this.filtersStream$.next(newFilterSteamValue);
  }
}
