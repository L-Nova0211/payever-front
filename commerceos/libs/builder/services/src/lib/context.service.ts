import { Injectable, Injector } from '@angular/core';
import { isEmpty } from 'lodash';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import {
  mockCartProducts,
  mockPosCatalog,
  mockShopCategory,
  mockProductDetails,
  PebContextService,
} from '@pe/builder-context';
import {
  ContextService,
  PebElementContext,
  PebElementContextState,
  PebFilterParams,
  PebLanguage,
  PebOrderParams,
} from '@pe/builder-core';


export enum ContextParameterType {
  Static = 'static',
  Dynamic = 'dynamic',
}

export type ContextParameter =
  | string
  | number
  | Array<string | number>
  | {
    contextParameterType: ContextParameterType;
    value: string | number;
  };

// TODO(@dmlukichev): Check why this typing has been disabled
export interface ContextSchema {
  [key: string]: ContextPlan;
}

export interface ContextPlan {
  service: ContextService;
  method: string;
  params: ContextParameter[];
}

export interface RootState {
  '@search'?: string;
  '@cart'?: PebElementContext<
    Array<{
      count: number;
      product: any; // TODO: add typings
    }>
  >;
  '@category'?: PebElementContext<{
    sortBy: string;
    shownFilters: boolean;
    activatedFilters: any[];
    disabledFilters: any[];
  }>;
  '@product-filters'?: PebElementContext<PebFilterParams>;
  '@product-sort'?: PebElementContext<PebOrderParams>;
  '@product-details'?: {};
  '@mobile-menu'?: PebElementContext<{
    routes: any[];
  }>;
  '@pos-catalog': PebElementContext<any>;
  '@languages': PebElementContext<{ selected: PebLanguage, available: PebLanguage[] }>;
  '@products-detail'?: PebElementContext<any>;
}

const INITIAL_STATE: RootState = {
  '@cart': {
    data: mockCartProducts,
    state: PebElementContextState.Ready,
  },
  '@search': '',
  '@category': mockShopCategory,
  '@product-details': mockProductDetails,
  '@product-filters': {
    state: PebElementContextState.Ready,
    data: [],
  },
  '@product-sort': {
    state: PebElementContextState.Ready,
    data: [],
  },
  '@mobile-menu': {
    state: PebElementContextState.Empty,
    data: {
      routes: [],
    },
  },
  '@languages': {
    state: PebElementContextState.Ready,
    data: {
      selected: PebLanguage.English,
      available: [PebLanguage.English],
    },
  },
  '@pos-catalog': mockPosCatalog,
  '@products-detail': {
    state: PebElementContextState.Ready,
    data: {},
  },
};

// TODO: should be reusable for editor and client
@Injectable({ providedIn: 'any' })
export class ContextBuilder {
  private readonly rootStateSubject$ = new BehaviorSubject<RootState>(
    INITIAL_STATE,
  );

  private readonly cacheData = new Map();
  services = this.injector.get(PebContextService);

  constructor(
    private injector: Injector,
  ) {}

  // TODO: Move to own service
  get rootState$(): Observable<RootState> {
    return this.rootStateSubject$.asObservable();
  }

  get rootState(): RootState {
    return this.rootStateSubject$.value;
  }

  patchRootState(value: RootState): void {
    this.rootStateSubject$.next({
      ...this.rootState,
      ...value,
    });
  }

  validateSchema(schema: ContextSchema): boolean {
    // TODO: Do!
    return true;
  }

  buildSchema(schema: ContextSchema): any {
    const schemaEmpty = !schema || !Object.keys(schema).length;

    return (schemaEmpty
      ? of({})
      : forkJoin(
          Object.entries(schema).reduce(
            (acc, [key, value]) => {
              const fetcher$ = this.getFetcher(value);

              return {
                ...acc,
                [key]: this.handleBlueprintPart(value).pipe(
                  catchError((err) => {
                    console.warn('build context error', err);

                    return of(null);
                  }),
                  map(data => ({ data, fetcher: fetcher$ })),
                ),
              };
            },
            {},
          ),
        )
    ).pipe(
      map(results => ({
        ...INITIAL_STATE,
        ...results,
      })),
    );
  }

  private getFetcher(value) {
    return (params: { [num: number]: any } = {}) => {
      return this.handleBlueprintPart({
        ...value,
        ...(value?.params?.length ? {
          params: value.params.map((param, i) => params[i] ?? param),
        } : null),
      });
    };
  }

  handleBlueprintPart(plan: ContextPlan): Observable<any> {
    if (!plan || typeof plan !== 'object' || isEmpty(plan)) {
      return of({
        state: PebElementContextState.Empty,
      });
    } else {

      if (!this.services[plan.method]) {
        console.error(
          `-- Method ${plan.method} was not found in ${plan.service}`,
        );
      }

      const params = this.resolveParams(plan.params);

      const requiredArguments = this.services[plan.method].length;


      if (params.length < requiredArguments) {
        console.error(
          `-- Not enough arguments (${params.length}) have been passed to ${plan.service}.${plan.method}`,
        );
      }

      const cached = this.getCache(plan);
      if (cached) {
        return of(cached);
      }

      return this.services[plan.method](...params).pipe(
        tap(value => this.setCache(plan, value)),
      );
    }
  }

  private resolveParams(params: ContextParameter[]): ContextParameter[] {
    return params.reduce((acc: any, curr: any) => {
      const param = curr?.contextParameterType === ContextParameterType.Dynamic ?
        this.resolveStateParameter(curr?.value) : curr;

      return [...acc, param];
    }, []);
  }

  private resolveStateParameter(
    path: string,
    state: RootState = this.rootState,
  ): RootState {
    return path
      .split('.')
      .reduce((acc, curr) => (acc ? acc[curr] : null), state);
  }

  private setCache(plan: ContextPlan, value: any) {
    this.cacheData.set(`${plan.service}-${plan.method}-${JSON.stringify(plan.params)}`, value);
  }

  private getCache(plan: ContextPlan): any {
    return this.cacheData.get(`${plan.service}-${plan.method}-${JSON.stringify(plan.params)}`);
  }

  clearCache() {
    this.cacheData.clear();
  }
}
