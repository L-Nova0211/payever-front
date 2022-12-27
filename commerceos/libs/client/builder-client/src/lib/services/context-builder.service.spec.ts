import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ContextService, CONTEXT_SERVICES, PebElementContextState } from '@pe/builder-core';

import { ContextParameterType, ContextSchema, PebClientContextBuilderService } from './context-builder.service';
import { PebClientStateService } from './state.service';

describe('ContextBuilder', () => {

  let service: PebClientContextBuilderService;
  let rootState: any;

  beforeEach(() => {

    const contextServices = {
      [ContextService.Company]: {
        getLogo: jasmine.createSpy('getLogo').and.returnValue(of({
          state: PebElementContextState.Ready,
          data: {
            src: 'picture.jpg',
          },
        })),
      },
      [ContextService.Products]: {
        getByIds: jasmine.createSpy('getByIds').and.callFake((ids: string[]) => of({})),
      },
      [ContextService.Integrations]: {},
    };

    TestBed.configureTestingModule({
      providers: [
        PebClientContextBuilderService,
        { provide: PebClientStateService, useValue: {} },
        { provide: CONTEXT_SERVICES[ContextService.Company], useValue: contextServices[ContextService.Company] },
        { provide: CONTEXT_SERVICES[ContextService.Products], useValue: contextServices[ContextService.Products] },
        {
          provide: CONTEXT_SERVICES[ContextService.Integrations],
          useValue: contextServices[ContextService.Integrations],
        },
      ],
    });

    service = TestBed.inject(PebClientContextBuilderService);
    rootState = TestBed.inject(PebClientStateService);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should return true on validate schema', () => {

    expect(service.validateSchema({})).toBe(true);

  });

  it('should build schema', () => {

    const warnSpy = spyOn(console, 'warn');
    let schema: ContextSchema;

    rootState = {
      value: 'test',
    };
    service[`rootStateService`] = rootState;

    // empty schema
    service.buildSchema(schema).subscribe((result) => {
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

    service.buildSchema(schema).subscribe((result) => {
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

    service.buildSchema(schema).subscribe((result) => {
      expect(result.ids.data).toEqual({});
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

    service.buildSchema(schema).subscribe((result) => {
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

    service.buildSchema(schema).subscribe((result) => {
      expect(result.noMethod.data).toEqual({});
    });
    expect(warnSpy).toHaveBeenCalled();

    // no service
    schema = {
      noService: {
        service: 'test' as any,
        method: 'getTest',
        params: [],
      },
    };

    service.buildSchema(schema as any).subscribe((result) => {
      expect(result.noService.data).toEqual({});
    });
    expect(warnSpy).toHaveBeenCalled();

    // no plan
    schema = {
      noPlan: {} as any,
    };

    service.buildSchema(schema as any).subscribe((result) => {
      expect(result.noPlan.data).toEqual({});
    });

  });

});
