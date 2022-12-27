import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CompanyContext } from '@pe/builder-context';
import { ContextService, CONTEXT_SERVICES, PebElementContextState } from '@pe/builder-core';

import { ContextBuilder, ContextParameterType, ContextSchema } from './context.service';

describe('ContextBuilder', () => {

  let service: ContextBuilder;

  beforeEach(() => {

    const companyContextSpy = jasmine.createSpyObj<CompanyContext>('CompanyContext', {
      getLogo: of({
        state: PebElementContextState.Ready,
        data: {
          src: 'picture.jpg',
        },
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
        { provide: CONTEXT_SERVICES[ContextService.Integrations], useValue: {} },
      ],
    });

    service = TestBed.inject(ContextBuilder);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get rootState$', () => {

    service.rootState$.subscribe((state) => {
      expect(state['@cart'].state).toBe(PebElementContextState.Ready);
    });

  });

  it('should get rootState', () => {

    expect(service.rootState['@cart'].state).toBe(PebElementContextState.Ready);

  });

  it('should patch root state', () => {

    const value = {
      '@cart': null,
    };

    service.patchRootState(value as any);

    expect(service[`rootStateSubject$`].value['@cart']).toBeNull();

  });

  it('should validate schema', () => {

    expect(service.validateSchema({})).toBe(true);

  });

  it('should build schema', () => {

    const errorSpy = spyOn(console, 'error');
    let schema: ContextSchema = {};

    // empty schema
    service.buildSchema(schema as any).subscribe((result) => {
      expect(result['@cart'].state).toEqual(PebElementContextState.Ready);
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
    });

    // call again to cover cache part
    service.buildSchema(schema as any).subscribe();

    // schema w/ params
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
      expect(result.noPlan.data).toEqual({ state: PebElementContextState.Empty });
    });

  });

  it('should get fetcher', () => {

    let fetcher: any;

    // w/o value & params
    fetcher = service[`getFetcher`](null);

    fetcher().subscribe(data => expect(data.state).toEqual(PebElementContextState.Empty));

    // w/ value
    // w/o params
    fetcher = service[`getFetcher`]({});

    fetcher().subscribe(data => expect(data.state).toEqual(PebElementContextState.Empty));

    // w/ value & params
    fetcher = service[`getFetcher`]({
      service: ContextService.Company,
      method: 'getLogo',
      params: [
        'name',
        'title',
      ],
    });

    fetcher(['name']).subscribe(data => expect(data).toEqual({
      state: PebElementContextState.Ready,
      data: {
        src: 'picture.jpg',
      },
    }));

  });

  it('should resolve params', () => {

    const params = [
      ['test'],
      { type: ContextParameterType.Static, value: 'true' },
      { type: ContextParameterType.Dynamic, value: 'test.payever' },
      { contextParameterType: ContextParameterType.Dynamic, value: 'test.payever' },
    ];

    // w/ undefined
    service[`resolveParams`]([undefined]);

    // w/ params
    expect(service[`resolveParams`](params as any)).toEqual([
      ['test'],
      { type: 'static', value: 'true' },
      { type: 'dynamic', value: 'test.payever' },
      null,
    ]);

  });

  it('should clear cache', () => {

    const spy = spyOn(service[`cacheData`], 'clear').and.callThrough();

    service.clearCache();

    expect(spy).toHaveBeenCalled();

  });

  afterAll(() => {

    service.clearCache();

  });

});
