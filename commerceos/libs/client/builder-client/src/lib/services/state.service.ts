import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

import {
  PebElementContext,
  PebElementContextState,
  PebFilterParams,
  PebIntegrationTag,
  PebLanguage,
  PebOrderParams,
  PebScreen,
} from '@pe/builder-core';
import { PE_ENV } from '@pe/common';

import { ContextCart } from '../modules/checkout/interfaces/cart.interfaces';

import { PebClientStoreService } from './store.service';

export type Product = any;

export interface CategoryFilter {
  name: string;
}

export interface Category {
  sortBy: string;
  shownFilters: boolean;
  activatedFilters: CategoryFilter[];
  disabledFilters: CategoryFilter[];
  title: string;
  image?: string;
  variants: any[];
  categories: any[];
  products: Product[];
}

export interface PebClientState {
  '@search'?: string;
  '@cart'?: PebElementContext<ContextCart[]>;
  '@category'?: PebElementContext<Category>;
  '@product-details'?: PebElementContext<any>;
  '@product-filters'?: PebElementContext<PebFilterParams>;
  '@product-sort'?: PebElementContext<PebOrderParams>;
  '@mobile-menu'?: PebElementContext<{
    opened: boolean,
  }>;
  '@logo'?: PebElementContext<string>;
  '@company-logo'?: PebElementContext<{ src: string }>;
}

const INITIAL_STATE: PebClientState = {
  '@cart': {
    state: PebElementContextState.Empty,
    data: null,
  },
  '@search': '',
  '@category': {
    data: {
      sortBy: 'asc',
      shownFilters: true,
      title: '',
      image: '',
      variants: [],
      categories: [],
      activatedFilters: [],
      disabledFilters: [],
      products: [],
    },
    state: PebElementContextState.Ready,
  },
  '@product-filters': {
    state: PebElementContextState.Ready,
    data: [],
  },
  '@product-sort': {
    state: PebElementContextState.Ready,
    data: [],
  },
  '@product-details': {
    state: PebElementContextState.Empty,
    data: null,
  },
  '@mobile-menu': {
    state: PebElementContextState.Ready,
    data: {
      opened: false,
    },
  },
  [`@${PebIntegrationTag.BuilderShop}-languages`]: {
    state: PebElementContextState.Empty,
    data: [],
  },
  '@logo': {
    state: PebElementContextState.Empty,
    data: null,
  },
  '@company-logo': {
    state: PebElementContextState.Empty,
    data: null,
  },
};

@Injectable()
export class PebClientStateService {

  readonly categoriesSubject$ = new ReplaySubject<any[]>(1);
  readonly categories$ = this.categoriesSubject$.asObservable();
  // readonly routes$ = this.categories$.pipe(
  //   map(categories => buildRoutes(this.theme, categories)),
  //   share(),
  // );

  get app() {
    return this.clientStore.app;
  }

  get theme() {
    return this.clientStore.theme;
  }

  constructor(
    private clientStore: PebClientStoreService,
    @Optional() @Inject('USER_AGENT_SCREEN') private userAgentScreen: PebScreen,
    @Optional() @Inject('CATEGORIES') private categories: any[],
    @Optional() @Inject(PE_ENV) private env: any,
    @Inject(PLATFORM_ID) platformId: any,
    private http: HttpClient,
  ) {
    if (categories) {
      this.categoriesSubject$.next(categories);
    } else if (isPlatformBrowser(platformId)) {
      this.fetchCategories().pipe(
        take(1),
      ).subscribe(c => this.categoriesSubject$.next(c));
    }
    if (this.userAgentScreen === PebScreen.Mobile) {
      this.patchCategoryData({ shownFilters: false });
    }
    if (this.app?.picture || true) {
      this.patch({
        '@logo': {
          state: PebElementContextState.Ready,
          data: this.app?.picture ?? this.app?.logo,
        },
        '@company-logo': {
          state: PebElementContextState.Ready,
          data: { src: this.app?.picture ?? this.app?.logo },
        },
      });
    }
  }

  private readonly stateSubject$ = new BehaviorSubject<PebClientState>(
    INITIAL_STATE,
  );

  get state$(): Observable<PebClientState> {
    return this.stateSubject$.asObservable();
  }

  get state(): PebClientState {
    return this.stateSubject$.value;
  }

  patch(value: Partial<PebClientState> | any): void {
    this.stateSubject$.next({
      ...this.state,
      ...value,
    });
  }

  setLanguages(languages: PebLanguage[]): void {
    this.patch({
      [`@${PebIntegrationTag.BuilderShop}-languages`]: {
        state: PebElementContextState.Ready,
        data: languages,
      },
    });
  }

  setProductFilters(value: PebFilterParams): void {
    this.stateSubject$.next({
      ...this.state,
      '@product-filters': {
        ...this.state['@product-filters'],
        data: value,
      },
    });
  }

  setProductSort(value: PebOrderParams): void {
    this.stateSubject$.next({
      ...this.state,
      '@product-sort': {
        ...this.state['@product-sort'],
        data: value,
      },
    });
  }

  patchCategory(value: Partial<PebElementContext<Category>>) {
    this.stateSubject$.next({
      ...this.state,
      '@category': {
        ...this.state['@category'],
        ...value,
      },
    });
  }

  patchCategoryData(value: Partial<Category>) {
    this.stateSubject$.next({
      ...this.state,
      '@category': {
        ...this.state['@category'],
        data: {
          ...this.state['@category'].data,
          ...value,
        },
      },
    });
  }

  updateProductState(productId: string, state: PebElementContextState) {
    const products = this.state['@category']?.data?.products.map(product =>
      product.data.id === productId ? { ...product, state } : product,
    );
    this.patchCategoryData({ products });
  }

  private fetchCategories(): Observable<any[]> {
    const methodAll = 'getCategoriesForBuilder';
    const methodByProducts = 'getCategoriesByProductsForBuilder';

    const fetchFunc = (method, path) => {
      const body = {
        query: `{
      ${method} (
        business:"${this.app.businessId}", filter: "[]", offset: 0, order: "[]",
      ) {
        result {
          id name description slug parent { id name description }
        }
        totalCount
      }
    }`,
      };

      return this.http.post(`${this.env.backend?.products}/${path}`, {
        body: JSON.stringify(body),
        method: 'POST',
        headers: [
          ['content-type', 'application/json'],
          ['accept', 'application/json, text/plain, */*'],
        ],
      }).pipe(
        map((r: any) => r?.data?.[method]?.result ?? []),
        catchError(() => of([])),
      );
    };

    return forkJoin([
      fetchFunc(methodAll, 'categories'),
      fetchFunc(methodByProducts, 'products'),
    ]).pipe(
      map(categories => categories.reduce((acc, c) => ([...acc, ...c]), [])),
    );
  }

}
