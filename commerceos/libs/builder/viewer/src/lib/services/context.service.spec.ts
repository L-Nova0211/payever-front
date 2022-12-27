import { TestBed } from '@angular/core/testing';
import { ContextService, CONTEXT_SERVICES, PebElementContextState } from '@pe/builder-core';
import { CompanyContext, ContextSchema } from '@pe/builder-editor';
import { of } from 'rxjs';
import { BUILDER_APP_STATE_SERVICE } from '../../../../../../src/modules/viewer/src';
import { ContextBuilder, ContextParameterType } from './context.service';

describe('ContextBuilder', () => {

  let service: ContextBuilder;
  let rootState: any;

  beforeEach(() => {

    const companyContextSpy = jasmine.createSpyObj<CompanyContext>('CompanyContext', {
      getLogo: of({
        state: PebElementContextState.Ready,
        data: { src: 'picture.jpg' },
      }),
    });

    const productsContextSpy = jasmine.createSpyObj('ProductsContext', ['getProductDetails']);
    productsContextSpy.getByIds = (ids: [string]) => {
      return of({});
    };

    TestBed.configureTestingModule({
      providers: [
        ContextBuilder,
        { provide: CONTEXT_SERVICES[ContextService.Company], useValue: companyContextSpy },
        { provide: CONTEXT_SERVICES[ContextService.Products], useValue: productsContextSpy },
        { provide: BUILDER_APP_STATE_SERVICE, useValue: null },
      ],
    });

    service = TestBed.inject(ContextBuilder);
    rootState = TestBed.inject(BUILDER_APP_STATE_SERVICE);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get state$', () => {

    // root state service is null
    service.state$.subscribe((state) => {
      expect(state).toBeNull();
    });

    // root state is defined
    rootState = {
      state$: of({ test: true }),
    };
    service[`rootStateService`] = rootState;
    service.state$.subscribe((state) => {
      expect(state.test).toBe(true);
    });

  });

  it('should get state', () => {

    // root state service is null
    expect(service.state).toBeUndefined();

    // root state is defined
    rootState = {
      state: { test: true },
    };
    service[`rootStateService`] = rootState;
    expect(service.state.test).toBe(true);

  });

  it('should validate schema', () => {

    expect(service.validateSchema({})).toBe(true);

  });

  it('should build schema', () => {

    const errorSpy = spyOn(console, 'error');
    let schema: ContextSchema;

    rootState = {
      value: 'test',
    };
    service[`rootStateService`] = rootState;

    // empty schema
    service.buildSchema(schema as any).subscribe((result) => {
      expect(result).toEqual({});
    });

    // normal schema
    schema = {
      logo: {
        service: ContextService.Company,
        method: 'getLogo',
        params: [],
      },
    };

    service.buildSchema(schema as any).subscribe((result) => {
      expect(result.logo.data).toEqual({
        state: PebElementContextState.Ready,
        data: {
          src: 'picture.jpg',
        },
      });
      result.logo.fetcher();
    });

    // schema w/ params
    // w/ error
    schema = {
      ids: {
        service: ContextService.Products,
        method: 'getByIds',
        params: [],
      },
    };

    service.buildSchema(schema as any).subscribe((result) => {
      expect(result.ids.data).toEqual({});
      expect(errorSpy).toHaveBeenCalled();
    });

    // schema w/ params
    // w/o error
    schema.ids.params = [
      {
        contextParameterType: ContextParameterType.Dynamic,
        value: '13',
      },
      {
        contextParameterType: ContextParameterType.Static,
        value: '13',
      },
    ];

    service.buildSchema(schema as any).subscribe((result) => {
      expect(result.ids.data).toEqual({});
      result.ids.fetcher({
        0: {
          contextParameterType: ContextParameterType.Dynamic,
          value: '13',
        },
      });
    });

    // no method
    schema = {
      noMethod: {
        service: ContextService.Products,
        method: 'getTest',
        params: [],
      },
    };

    expect(() => {
      service.buildSchema(schema as any).subscribe();
    }).toThrowError();
    expect(errorSpy).toHaveBeenCalled();

    // no service
    schema = {
      noService: {
        service: 'test' as any,
        method: 'getTest',
        params: [],
      },
    };

    expect(() => {
      service.buildSchema(schema as any).subscribe();
    }).toThrowError();
    expect(errorSpy).toHaveBeenCalled();

    // no plan
    schema = {
      noPlan: {} as any,
    };

    service.buildSchema(schema as any).subscribe((result) => {
      expect(result.noPlan.data).toEqual({});
    });

  });

  it('should resolve params', () => {

    const params = [
      'test',
      {
        contextParameterType: ContextParameterType.Dynamic,
        value: '13',
      },
      undefined,
    ];

    rootState = {
      value: 'test',
    };
    service[`rootStateService`] = rootState;

    expect(service[`resolveParams`](params as any)).toEqual([
      'test',
      null,
      undefined,
    ]);

  });

  it('should resolve state params', () => {

    const path = '/test.payever';
    rootState = {
      value: { test: true },
    };
    service[`rootStateService`] = rootState;

    expect(service[`resolveStateParameter`](path)).toBeNull();

  });

});
