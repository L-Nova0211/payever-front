import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import {  PEB_EDITOR_API_PATH } from '@pe/builder-api';
import { PEB_SHOPS_API_PATH } from '@pe/builder-api';
import {
  PebEnvService,
  PebIntegrationActionParams,
  PebIntegrationActionQueryType,
  PebIntegrationActionResponseType,
} from '@pe/builder-core';
import { PE_ENV } from '@pe/common';


import { PebContextService } from './peb-context.service';


describe('PebContextApi', () => {

  let api: PebContextService;
  let http: HttpTestingController;
  let editorApiPath: string;

  beforeEach(() => {

    const envServiceMock = {
      shopId: 'shop-001',
      businessId: 'b-001',
      channelId: 'ch-001',
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PebContextService,
        { provide: PebEnvService, useValue: envServiceMock },
        { provide: PE_ENV, useValue: {} },
        { provide: PEB_EDITOR_API_PATH, useValue: 'editor-api' },
        { provide: PEB_SHOPS_API_PATH, useValue: 'shops-api' },
      ],
    });

    api = TestBed.inject(PebContextService);

    http = TestBed.inject(HttpTestingController);
    editorApiPath = TestBed.inject(PEB_EDITOR_API_PATH);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should fetch integrations', () => {

    const errorSpy = spyOn(console, 'error');
    const url = `${editorApiPath}/api/context/cache/v2`;
    const responseMock = {
      integrations: [{ id: 'i-001' }],
    };
    let req: TestRequest;

    /**
     * http request returns null
     */
    api.fetchIntegrations().subscribe(result => expect(result).toEqual([]));

    req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('GET');
    expect(errorSpy).not.toHaveBeenCalled();

    /**
     * http request returns mocked data
     */
    api.fetchIntegrations().subscribe(result => expect(result).toEqual(responseMock.integrations as any));

    req = http.expectOne(url);
    req.flush(responseMock);

    expect(errorSpy).not.toHaveBeenCalled();

    /**
     * http request throws error
     */
    api.fetchIntegrations().subscribe(result => expect(result).toEqual([]));

    req = http.expectOne(url);
    req.flush('Error', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.calls.argsFor(0)[0].status).toBe(500);

  });

  it('should fetch action', () => {

    const fetchRestSpy = spyOn<any>(api, 'fetchIntegrationRestAction').and.returnValue(of(null));
    const fetchGqlSpy = spyOn<any>(api, 'fetchIntegrationGqlAction').and.returnValue(of(null));
    const integration: any = { id: 'i-001' };
    const action: any = {
      id: 'a-001',
      queryType: PebIntegrationActionQueryType.Rest,
    };
    const filter = {
      fieldCondition: 'in',
      value: ['test'],
    };
    const order = {
      field: 'createdAt',
      direction: 'desc',
    };
    const pagination = {
      offset: 10,
      limit: 5,
    };
    const data = { test: 'data' };

    /**
     * action is null
     */
    api.fetchIntegrationAction({
      integration,
      action: null,
    }).subscribe();

    expect(fetchGqlSpy).toHaveBeenCalledWith({
      integration,
      action: null,
      id: '',
      filter: [],
      order: [],
      pagination: {},
      data: null,
    });
    expect(fetchRestSpy).not.toHaveBeenCalled();

    /**
     * action is set
     * action.queryType is PebIntegrationActionQueryType.Rest
     */
    fetchGqlSpy.calls.reset();

    api.fetchIntegrationAction({
      integration,
      action,
      pagination,
      data,
      id: action.id,
      filter: [filter],
      order: [order],
    });
    expect(fetchRestSpy).toHaveBeenCalledWith({
      integration,
      action,
      pagination,
      data,
      id: action.id,
      filter: [filter],
      order: [order],
    });
    expect(fetchGqlSpy).not.toHaveBeenCalled();

  });

  it('should fetch integration rest action', () => {

    const integration = {
      id: 'i-001',
      envUrl: 'test.env.url',
      url: 'url/integration/i-001',
    };
    const action = {
      id: 'a-001',
      method: 'POST',
      url: '/action/a-001',
      params: { test: true },
      responseType: PebIntegrationActionResponseType.Single,
    };
    const getParamsSpy = spyOn<any>(api, 'getIntegrationRestActionParams').and.returnValue(action.params);
    const errorSpy = spyOn(console, 'error');
    const url = `${integration.url}${action.url}`;
    let req: TestRequest;

    /**
     * action.responseType is 'single'
     */
    api[`fetchIntegrationRestAction`]({
      integration,
      action,
    } as any).subscribe(result => expect(result).toBeNull());

    req = http.expectOne(url);
    req.flush('Error', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(req.request.method).toEqual(action.method);
    expect(req.request.body).toEqual(action.params);
    expect(getParamsSpy).toHaveBeenCalledWith(action.params, '', [], [], {
      offset: 0,
      limit: 100,
    }, null);
    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.calls.argsFor(0)[0].status).toBe(500);

    /**
     * action.responseType is 'list'
     */
    action.responseType = PebIntegrationActionResponseType.List;

    api[`fetchIntegrationRestAction`]({
      integration,
      action,
      id: action.id,
    } as any).subscribe(result => expect(result).toEqual([]));

    req = http.expectOne(url);
    req.flush('Error', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(getParamsSpy).toHaveBeenCalledWith(action.params, action.id, [], [], {
      offset: 0,
      limit: 100,
    }, null);

  });

  it('should fetch integration gql action', () => {

    const integration = {
      id: 'i-001',
      envUrl: 'test.env.url',
      url: 'url/integration/i-001',
    };
    const action = {
      id: 'a-001',
      method: 'GET',
      url: '/action/a-001',
      params: 'test: true',
      meta: 'meta',
      queryType: PebIntegrationActionQueryType.Rest,
      responseType: PebIntegrationActionResponseType.Single,
    };
    const getParamsSpy = spyOn<any>(api, 'getIntegrationGqlActionParams').and.returnValue(action.params);
    const convertSpy = spyOn<any>(api, 'convertMetaToString').and.returnValue('test.meta');
    const dataMock = {
      GET: { result: 'data' },
    };
    const url = `${integration.url}${action.url}`;
    let req: TestRequest;

    /**
     * action.responseType is 'single'
     */
    api[`fetchIntegrationGqlAction`]({
      integration,
      action,
    } as any).subscribe(result => expect(result).toEqual(dataMock.GET));

    req = http.expectOne(url);
    req.flush({ data: dataMock });

    expect(req.request.method).toEqual('POST');
    expect(req.request.body[action.queryType]).not.toContain('totalCount');
    expect(getParamsSpy).toHaveBeenCalledWith(action.params, '', [], [], {
      offset: 0,
      limit: 100,
    });
    expect(convertSpy).toHaveBeenCalledWith(action.meta);

    /**
     * action.responseType is 'list'
     */
    action.responseType = PebIntegrationActionResponseType.List;

    api[`fetchIntegrationGqlAction`]({
      integration,
      action,
      id: action.id,
    } as any).subscribe(result => expect(result).toEqual(dataMock.GET));

    req = http.expectOne(url);
    req.flush({ data: dataMock });

    expect(req.request.body[action.queryType]).toContain('totalCount');
    expect(getParamsSpy).toHaveBeenCalledWith(action.params, action.id, [], [], {
      offset: 0,
      limit: 100,
    });

  });

  it('should convert meta to string', () => {

    const metas = {
      test: {
        type: 'boolean',
        subtype: 'value',
      },
      test2: {
        type: 'object',
        subtype: 'value',
      },
    };

    expect(api[`convertMetaToString`](metas)).toEqual('test test2');

  });

  it('should get integration rest action params', () => {

    const paramsMock = Object.values(PebIntegrationActionParams);
    const id = 'a-001';
    const filter = {
      fieldCondition: 'in',
      value: ['test'],
    };
    const order = {
      field: 'createdAt',
      direction: 'desc',
    };
    const pagination = {
      offset: 10,
      limit: 5,
    };
    const data = { test: 'data' };

    /**
     * arguments except params has default values
     */
    expect(api[`getIntegrationRestActionParams`](paramsMock)).toEqual({
      [PebIntegrationActionParams.Data]: null,
      [PebIntegrationActionParams.Filter]: [],
      [PebIntegrationActionParams.Business]: 'b-001',
      [PebIntegrationActionParams.Shop]: 'shop-001',
      [PebIntegrationActionParams.Order]: [],
      [PebIntegrationActionParams.Id]: '',
      [PebIntegrationActionParams.Offset]: 0,
      [PebIntegrationActionParams.Limit]: 100,
      [PebIntegrationActionParams.ChannelSet]: 'ch-001',
    });

    /**
     * all arguments set
     */
    expect(api[`getIntegrationRestActionParams`](paramsMock, id, [filter], [order], pagination, data)).toEqual({
      [PebIntegrationActionParams.Data]: data,
      [PebIntegrationActionParams.Filter]: [filter],
      [PebIntegrationActionParams.Business]: 'b-001',
      [PebIntegrationActionParams.Shop]: 'shop-001',
      [PebIntegrationActionParams.Order]: [order],
      [PebIntegrationActionParams.Id]: id,
      [PebIntegrationActionParams.Offset]: pagination.offset,
      [PebIntegrationActionParams.Limit]: pagination.limit,
      [PebIntegrationActionParams.ChannelSet]: 'ch-001',
    });

  });

  it('should get integration gql action params', () => {

    const convertSpy = spyOn<any>(api, 'convertFiltersToString').and.returnValue('converted');
    const paramsMock = Object.values(PebIntegrationActionParams);
    const id = 'a-001';
    const filter = {
      fieldCondition: 'in',
      value: ['test'],
    };
    const order = {
      field: 'createdAt',
      direction: 'desc',
    };
    const pagination = {
      offset: 10,
      limit: 5,
    };

    /**
     * argument params is null
     */
    expect(api[`getIntegrationGqlActionParams`](null)).toEqual('');
    expect(convertSpy.calls.allArgs()).toEqual(Array(2).fill([[]]));

    /**
     * arguments except params has default values
     */
    expect(api[`getIntegrationGqlActionParams`](paramsMock))
      .toEqual('business: "b-001", shop: "shop-001", order: "converted", filter: "converted", offset: 0, limit: 100, data: , channelSet: "ch-001", id: "",');

    /**
     * all arguments set
     */
    expect(api[`getIntegrationGqlActionParams`](paramsMock, id, [filter], [order], pagination))
      .toEqual('business: "b-001", shop: "shop-001", order: "converted", filter: "converted", offset: 10, limit: 5, data: , channelSet: "ch-001", id: "a-001",');

  });

  it('should convert filters to string', () => {

    const filters = [{
      fieldCondition: 'in',
      value: ['test'],
    }];

    expect(api[`convertFiltersToString`](filters)).toEqual(JSON.stringify(filters).replace(/\"/g, '\\"'));

  });

});
