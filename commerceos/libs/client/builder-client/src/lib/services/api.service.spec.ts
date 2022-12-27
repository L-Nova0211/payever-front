import { DOCUMENT } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PebScreen } from '@pe/builder-core';
import { AppType, APP_TYPE } from '@pe/common';

import { PebClientApiService } from './api.service';

describe('ApiService', () => {

  let service: PebClientApiService;
  let http: HttpTestingController;
  let env: any;

  beforeEach(() => {

    const envMock = {
      backend: {
        shop: 'be-shop',
      },
    };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        PebClientApiService,
        { provide: DOCUMENT, useValue: document },
        { provide: 'ENVIRONMENT', useValue: envMock },
        { provide: 'THEME', useValue: {} },
        { provide: APP_TYPE, useValue: AppType.Shop }],
    });

    service = TestBed.inject(PebClientApiService);
    http = TestBed.inject(HttpTestingController);
    env = TestBed.inject('ENVIRONMENT' as any);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get shop source', () => {

    const shopId = 'shop-001';
    const url = `${env.backend.shop}/api/shop/${shopId}/theme`;

    service.getAppSource(shopId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush({});

  });

  it('should get shop source page', () => {

    const shopId = 'shop-001';
    const pageId = 'p-001';
    const variant = 'variant';
    const screen = PebScreen.Desktop;
    let url = `${env.backend.shop}/api/shop/${shopId}/theme/page`;
    let req: TestRequest;

    // w/o pageId & variant & screen
    service.getAppSourcePage(shopId, null, null).subscribe();

    req = http.expectOne(r => r.url === url);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.has('variant')).toBe(false);
    expect(req.request.params.has('screen')).toBe(false);

    req.flush({});

    // w/ pageId & variant & screen
    url = `${env.backend.shop}/api/shop/${shopId}/theme/page/${pageId}`;

    service.getAppSourcePage(shopId, pageId, variant, screen).subscribe();

    req = http.expectOne(r => r.url === url);

    expect(req.request.params.get('variant')).toEqual(variant);
    expect(req.request.params.get('screen')).toEqual(PebScreen.Desktop);

    req.flush({});

  });

  it('should get shop source page screen stylesheet', () => {

    const shopId = 'shop-001';
    const pageId = 'p-001';
    const screen = PebScreen.Desktop;
    const url = `${env.backend.shop}/api/shop/${shopId}/theme/page/${pageId}/stylesheet/${screen}`;

    service.getAppSourcePageScreenStylesheet(shopId, pageId, screen).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush({});

  });

  // afterAll(() => {
  //
  //   http.verify();
  //
  // });

});
