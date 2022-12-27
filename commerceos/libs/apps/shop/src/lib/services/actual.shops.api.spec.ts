import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PebEnvService } from '@pe/builder-core';

import { PebActualShopsApi, PEB_SHOPS_API_PATH } from './actual.shops.api';

describe('PebActualShopsApi', () => {

  let api: PebActualShopsApi;
  let http: HttpTestingController;
  let shopApiPath: string;
  let envService: jasmine.SpyObj<PebEnvService>;

  beforeEach(() => {

    const envServiceMock = {
      businessId: '000-111',
      shopId: '222',
    };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        PebActualShopsApi,
        { provide: PEB_SHOPS_API_PATH, useValue: 'shops-api' },
        { provide: PebEnvService, useValue: envServiceMock },
      ],
    });

    api = TestBed.inject(PebActualShopsApi);

    http = TestBed.inject(HttpTestingController);
    shopApiPath = TestBed.inject(PEB_SHOPS_API_PATH);
    envService = TestBed.inject(PebEnvService);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should get business id', () => {

    expect(api[`businessId`]).toEqual(envService.businessId);

  });

  it('should get shops list', () => {

    const { businessId } = envService;
    const url = `${shopApiPath}/business/${businessId}/shop`;
    let request: TestRequest;

    // is default = FALSE
    api.getShopsList().subscribe();

    // is default = TRUE
    api.getShopsList(true).subscribe();

    const reqList = http.match(req => req.url === url);

    expect(reqList.length).toBe(2);
    expect(reqList.every(req => req.request.method === 'GET')).toBe(true);

    // is default = FALSE
    request = reqList[0];
    expect(request.request.params.keys().length).toBe(0);

    // is default = TRUE
    request = reqList[1];
    expect(request.request.params.get('isDefault')).toEqual('true');

    reqList.forEach((req) => {
      req.flush(of([]));
    });

  });

  it('should get single shop', () => {

    const { businessId, shopId } = envService;
    const url = `${shopApiPath}/business/${businessId}/shop/${shopId}`;

    api.getSingleShop(shopId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should create shop', () => {

    const { businessId } = envService;
    const payload = { test: true };
    const url = `${shopApiPath}/business/${businessId}/shop`;

    api.createShop(payload).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(payload);

    req.flush(of({}));

  });

  it('should validate shop name', () => {

    const { businessId } = envService;
    const name = 'shop';
    const url = `${shopApiPath}/business/${businessId}/shop/isValidName?name=${name}`;

    api.validateShopName(name).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should delete shop', () => {

    const { businessId, shopId } = envService;
    const url = `${shopApiPath}/business/${businessId}/shop/${shopId}`;

    api.deleteShop(shopId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('DELETE');

    req.flush(of(null));

  });

  it('should update shop', () => {

    const { businessId, shopId } = envService;
    const payload = { id: shopId, test: true };
    const url = `${shopApiPath}/business/${businessId}/shop/${shopId}`;

    api.updateShop(payload).subscribe();

    const req = http.expectOne(url);

    delete payload.id;

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

  });

  it('should mark shop as default', () => {

    const { businessId, shopId } = envService;
    const url = `${shopApiPath}/business/${businessId}/shop/${shopId}/default`;

    api.markShopAsDefault(shopId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

    req.flush(of({}));

  });

  it('should get default shop', () => {

    const { businessId } = envService;
    const url = `${shopApiPath}/business/${businessId}/shop/default`;

    api.getDefaultShop().subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should update shop access config', () => {

    const { businessId, shopId } = envService;
    const url = `${shopApiPath}/business/${businessId}/shop/access/${shopId}`;
    const payload = { isLive: true };

    api.updateShopAccessConfig(shopId, payload).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

    req.flush(of({}));

  });

  it('should get shop preview', () => {

    const { businessId, shopId } = envService;
    const url = `${shopApiPath}/business/${businessId}/shop/${shopId}/preview`;
    let request: TestRequest;

    // w/o include
    api.getShopPreview(shopId).subscribe();

    request = http.expectOne(req => req.url === url);
    expect(request.request.method).toEqual('GET');
    expect(request.request.params.get('page')).toEqual('front');

    request.flush(of({}));

    // w/ include
    api.getShopPreview(shopId, ['published']).subscribe();

    request = http.expectOne(req => req.url === url);
    expect(request.request.method).toEqual('GET');
    expect(request.request.params.get('page')).toEqual('front');

    request.flush(of({}));

  });

  it('should check is live', () => {

    const { businessId, shopId } = envService;
    const url = `${shopApiPath}/business/${businessId}/shop/access/${shopId}/is-live`;

    api.checkIsLive(shopId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of(true));

  });

  it('should patch is live', () => {

    const { businessId, shopId } = envService;
    const url = `${shopApiPath}/business/${businessId}/shop/access/${shopId}`;
    const isLive = true;

    api.patchIsLive(shopId, isLive).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ isLive });

    req.flush(of(null));

  });

  it('should get all domains', () => {

    const { businessId, shopId } = envService;
    const url = `${shopApiPath}/business/${businessId}/shop/${shopId}/domain`;

    api.getAllDomains(shopId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should add social image', () => {

    const accessId = 'access-001';
    const image = 'image.jpg';
    const url = `${shopApiPath}/business/${envService.businessId}/shop/access/${accessId}`;

    api.addSocialImage(accessId, image).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ socialImage: image });

    req.flush(of({}));

  });

  it('should add domain', () => {

    const { businessId, shopId } = envService;
    const url = `${shopApiPath}/business/${businessId}/shop/${shopId}/domain`;
    const domain = 'test';

    api.addDomain(shopId, domain).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ name: domain });

    req.flush(of({}));

  });

  it('should check domain', () => {

    const { businessId, shopId } = envService;
    const domainId = 'dom-001';
    const url = `${shopApiPath}/business/${businessId}/shop/${shopId}/domain/${domainId}/check`;

    api.checkDomain(shopId, domainId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

    req.flush(of({}));

  });

  it('should patch domain', () => {

    const { businessId, shopId } = envService;
    const domainId = 'dom-001';
    const domain = 'test';
    const url = `${shopApiPath}/business/${businessId}/shop/${shopId}/domain/${domainId}`;

    api.patchDomain(shopId, domainId, domain).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ name: domain });

    req.flush(of({}));

  });

  it('should delete domain', () => {

    const { businessId, shopId } = envService;
    const domainId = 'dom-001';
    const url = `${shopApiPath}/business/${businessId}/shop/${shopId}/domain/${domainId}`;

    api.deleteDomain(shopId, domainId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('DELETE');

    req.flush(of({}));

  });

  afterAll(() => {

    http.verify();

  });

});
