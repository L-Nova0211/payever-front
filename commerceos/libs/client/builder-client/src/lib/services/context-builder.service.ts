import { Injectable, Injector } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PebContextService } from '@pe/builder-context';
import { CONTEXT_SERVICES } from '@pe/builder-core';
import { PebClientState, PebClientStateService } from './state.service';


export enum ContextService {
  Company = 'company',
  Products = 'products',
  Shipments = 'shipments',
  Integrations = 'integrations'
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

@Injectable()
export class PebClientContextBuilderService {

  services = {
    [ContextService.Company]: this.injector.get(CONTEXT_SERVICES[ContextService.Company]),
    [ContextService.Products]: this.injector.get(CONTEXT_SERVICES[ContextService.Products]),
    [ContextService.Integrations]: this.injector.get(PebContextService),
    // [ContextService.Shipments]: this.injector.get(CONTEXT_SERVICES[ContextService.Shipments]),
  };

  constructor(
    private injector: Injector,
    private rootStateService: PebClientStateService,
    private apmService: ApmService,
  ) {}

  validateSchema(schema: ContextSchema): boolean {
    // TODO: Do!
    return true;
  }

  buildSchema(schema: ContextSchema): Observable<any> {
    const handleBlueprintPart = (plan): Observable<any> => {
      if (!(plan instanceof Object)) {
        return of({});
      }

      if (!this.services[plan.service]) {
        console.warn(`-- Service ${plan.service} was not found`);

        return of({});
      }

      if (!this.services[plan.service][plan.method]) {
        console.warn(`-- Method ${plan.method} was not found in ${plan.service}`);

        return of({});
      }

      const params = this.resolveParams<any[]>(plan.params);
      const requiredArguments = this.services[plan.service][plan.method].length;

      if (params.length < requiredArguments) {
        console.warn(`-- Not enough arguments (${params.length}) have been passed to ${plan.service}.${plan.method}`);

        return of({});
      }

      return this.services[plan.service][plan.method](...params);
    };

    const schemaEmpty = !schema || !Object.keys(schema).length;

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
                catchError((err) => {
                  console.error(err);
                  this.apmService.apm.captureError(err);

                  return of(undefined);
                })
              );
            },
          ),
        ).pipe(
          map(results => Object.values(results).reduce((acc, result: [string, any]) => {
            if (result?.length >= 2) {
              acc[result[0]] = result[1];
            }

            return acc;
          }, {})),
        )
    );
  }

  private resolveParams<T>(params: ContextParameter[]): T {
    return params.reduce((acc: any, curr) => {
      // TODO: resolve state params
      // const param = typeof curr === 'string' || typeof curr === 'number'
      //   ? curr
      //   : (curr.type === ContextParameterType.Dynamic
      //     ? this.resolveStateParameter(curr.value as string)
      //     : curr.value);

      // const param = curr?.type ===
      const param = typeof curr !== 'string' && curr?.contextParameterType === ContextParameterType.Dynamic ?
        this.resolveStateParameter(curr?.value) : curr;

      return [ ...acc, param ];
    }, []);
  }

  private resolveStateParameter<T>(
    path: string,
    state: PebClientState = this.rootStateService.state,
  ): T {
    return path.split('.').reduce((acc, curr) => acc ? acc[curr] : null, state);
  }

}
