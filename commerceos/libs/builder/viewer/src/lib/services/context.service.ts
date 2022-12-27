import { Inject, Injectable, Injector, Optional } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebContextService } from '@pe/builder-context';

import { BUILDER_APP_STATE_SERVICE } from '../viewer.constants';

export enum ContextService {
  Company = 'company',
  Products = 'products',
  Shipments = 'shipments',
  Integrations = 'integrations',
}

export enum ContextParameterType {
  Static = 'static',
  Dynamic = 'dynamic',
}

export type ContextParameter = string | {
  contextParameterType: ContextParameterType;
  value: any;
};

export interface ContextSchema {
  [key: string]: {
    service: string | ContextService,
    method: string,
    params: ContextParameter[],
  };
}

@Injectable({ providedIn: 'any' })
export class ContextBuilder {
  services = this.injector.get(PebContextService);

  constructor(
    private injector: Injector,
    // TODO(@mivnv): Remove @Optional() after shop-client refactoring
    @Optional() @Inject(BUILDER_APP_STATE_SERVICE) private rootStateService: any,
  ) {}

  get state$(): Observable<any> {
    // TODO(@mivnv): Remove  '|| of(null)' after shop-client refactoring
    return this.rootStateService?.state$ || of(null);
  }

  get state(): any {
    return this.rootStateService?.state;
  }

  validateSchema(schema: ContextSchema): boolean {
    // TODO: Do!
    return true;
  }

  buildSchema(schema: ContextSchema): Observable<any> {

    const handleBlueprintPart = (plan): Observable<any> => {

      if (!plan || typeof plan !== 'object' || Object.keys(plan).length === 0) {
        return of({});
      }

      if (!this.services[plan.method]) {
        console.error(`-- Method ${plan.method} was not found in ${plan.service}`);
      }

      const params = this.resolveParams<any>(plan.params);
      const requiredArguments = this.services[plan.service][plan.method].length;

      if (params.length < requiredArguments) {
        console.error(`-- Not enough arguments (${params.length}) have been passed to ${plan.service}.${plan.method}`);
      }

      return this.services[plan.method](...params);
    };

    const schemaEmpty = !Object.keys(schema || {}).length;

    return (schemaEmpty
      ? of({})
      : combineLatest(
        Object.entries(schema).map(
          ([key, part]) => {
            const fetcher$ = (params: { [num: number]: any } = {}) => {
              return handleBlueprintPart({
                ...part,
                params: part?.params.map((param, i) => params[i] ?? param),
              });
            };

            return handleBlueprintPart(part).pipe(
              map(result => [key, { data: result, fetcher: fetcher$ }]),
            );
          },
        ),
      ).pipe(
        map(results => (Object as any).fromEntries(results)),
        map(results => ({
          ...this.state,
          ...results,
        })),
      )
    );
  }

  private resolveParams<T>(params: ContextParameter[]): T[] {
    return params.reduce((acc: any, curr: any) => {
      const param = curr?.contextParameterType === ContextParameterType.Dynamic ?
        this.resolveStateParameter(curr?.value) : curr;

      return [...acc, param];
    }, []);
  }

  private resolveStateParameter<T>(
    path: string,
    state = this.state,
  ): T {
    return path
      .split('.')
      .reduce((acc, curr) => (acc ? acc[curr] : null), state);
  }
}
