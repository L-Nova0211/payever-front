import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppLauncherService, HeaderService, WallpaperService } from '@app/services';
import { WidgetActionButtonComponent, WidgetCardComponent, WidgetStatisticsComponent } from '@modules/dashboard/shared-dashboard/components';
import { EditWidgetsService } from '@modules/dashboard/shared-dashboard/services';
import { LoaderService, ApiService } from '@modules/shared/services';
import { of } from 'rxjs';
import {
  FakeEnvService, FakePlatformService, FakeTranslateService, FakeRouter,
  FakeTranslationLoaderService, FakeWallpaperService, FakeMediaService,
} from 'test.helpers';

import { EnvService } from '@pe/common';
import { ButtonModule } from '@pe/ng-kit/modules/button';
import { PlatformService } from '@pe/ng-kit/modules/common';
import { I18nModule, TranslateService, TranslationLoaderService } from '@pe/ng-kit/modules/i18n';
import { SafeStylePipe, IconsPngUrlPipe, MediaService } from '@pe/ng-kit/modules/media';
import { MicroRegistryService } from '@pe/ng-kit/modules/micro';

import { ConnectWidgetComponent } from '..';
import { WidgetsApiService } from '../../../services';




// tslint:disable-next-line:max-line-length
const stub = [
  { installed: false, _id: 'e152e47f-9073-49a0-92e1-97da4b667861', integration: { _id: 'ed33ebdd-1fc1-4686-b9ef-fca7eb401c88', name: 'amazon', category: 'products', displayOptions: { _id: 'af3ecdc5-e194-4a7d-89dc-4f2289b91c5a', icon: '#payment-method-amazon', title: 'Amazon' }, installationOptions: { _id: '81612f6c-0aec-4f51-9d13-eb82eeaed18e', links: [{ _id: 'd2bcdc10-825f-415c-8d46-ed2b53639d45', type: 'img', url: 'https://payevertesting.blob.core.windows.net/miscellaneous/a10f7ba9-577f-4a3d-9203-87d625931bb6-Amazon.png' }], optionIcon: '#payment-method-amazon', price: 'integrations.products.amazon.price', category: 'integrations.products.amazon.category', developer: 'integrations.products.amazon.developer', languages: 'integrations.products.amazon.languages', description: 'integrations.products.amazon.description', appSupport: 'integrations.products.amazon.support_link', website: 'integrations.products.amazon.website_link', pricingLink: 'integrations.products.amazon.pricing_link' }, createdAt: '2019-03-05T18:00:00.000Z', updatedAt: '2019-03-05T19:00:00.000Z' }, createdAt: '2019-05-13T15:29:31.319Z', updatedAt: '2019-05-13T15:29:31.319Z', __v: 0 },
  { installed: false, _id: '8e24c7d3-3d57-48b0-b8b6-7a41c3f6c270', integration: { _id: '07056a9a-e75f-49da-89ad-ba0e02680935', name: 'ups', category: 'shippings', displayOptions: { _id: 'a88c631b-7819-4d00-bbeb-744b99dd7eed', icon: '#icon-shipping-ups-white', title: 'Ups' }, installationOptions: { _id: '9342dbd4-5fe2-4a69-94bb-782f00e0ef12', links: [{ _id: 'ecfb1eed-feb1-49e3-b440-60f0412ca194', type: 'img', url: 'https://payevertesting.blob.core.windows.net/miscellaneous/b995b26c-1963-4ead-8aaa-f2fb0fee90cc-1.png' }], optionIcon: '#icon-shipping-ups-white', price: 'integrations.shippings.ups.price', category: 'integrations.shippings.ups.description', developer: 'integrations.shippings.ups.developer', languages: 'integrations.shippings.ups.languages', description: 'integrations.shippings.ups.description', appSupport: 'integrations.shippings.ups.appSupport_link', website: 'integrations.shippings.ups.website_link', pricingLink: 'integrations.shippings.ups.pricing_link' }, createdAt: '2018-11-12T18:13:41.339Z', updatedAt: '2018-11-12T18:13:41.339Z' }, createdAt: '2019-05-13T15:29:31.373Z', updatedAt: '2019-05-13T15:29:31.373Z', __v: 0 },
  { installed: false, _id: '82ea6a75-581e-4962-8d5b-b933f8131b97', integration: { _id: '266bea2e-ae61-4d75-802e-6320416010f4', name: 'stripe_directdebit', category: 'payments', displayOptions: { _id: 'a18c60df-ffa2-41cb-9ee8-2bc5d3381a91', icon: '#icon-payment-option-stripe-direct-debit', title: 'integrations.payments.stripe_directdebit.title' }, installationOptions: { _id: 'b351dab8-8261-495d-afbd-00e2a3c337f1', links: [{ _id: '3f11a3d1-ec44-4121-8bc3-39cfa461878c', type: 'img', url: 'https://payevertesting.blob.core.windows.net/miscellaneous/08679314-a8e4-4ce5-9eec-9cd4d9546169-Stripe.png' }], optionIcon: '#icon-payment-option-stripe-direct-debit', price: 'integrations.payments.stripe_directdebit.price', category: 'integrations.payments.stripe_directdebit.category', developer: 'integrations.payments.stripe_directdebit.developer', languages: 'integrations.payments.stripe_directdebit.languages', description: 'integrations.payments.stripe_directdebit.description', appSupport: 'integrations.payments.stripe_directdebit.support_link', website: 'https://getpayever.com/checkout/', pricingLink: 'https://stripe.com/de/pricing/' }, createdAt: '2019-03-19T15:00:00.000Z', updatedAt: '2019-03-19T15:00:00.000Z' }, createdAt: '2019-05-13T15:29:31.384Z', updatedAt: '2019-05-13T15:29:31.384Z', __v: 0 },
  { installed: false, _id: 'c9d0db05-a90f-483c-85b4-5001463e1c01', integration: { _id: '044aace0-866c-4221-b37a-dccf9a8c5cd5', name: 'paypal', category: 'payments', displayOptions: { _id: 'b135c015-d2ca-4df2-bc60-78a786738280', icon: '#icon-payment-option-paypall', title: 'integrations.payments.paypal.title' }, installationOptions: { _id: '8d6ae90d-8929-4fde-9846-91c1a1d8b9b7', links: [{ _id: '9a3bc967-4273-4705-b6db-6b6b44c7462a', type: 'img', url: 'https://payeverstaging.blob.core.windows.net/products/d8ea98df-1ea7-4fb2-aaca-fab96e9eab8e-PayPal-min.png' }], optionIcon: '#icon-payment-option-paypall', price: 'integrations.payments.paypal.price', category: 'integrations.payments.paypal.category', developer: 'integrations.payments.paypal.developer', languages: 'integrations.payments.paypal.languages', description: 'integrations.payments.paypal.description', appSupport: 'integrations.payments.paypal.support_link', website: 'integrations.payments.paypal.website_link', pricingLink: 'integrations.payments.paypal.pricing_link' }, createdAt: '2018-11-12T18:13:41.339Z', updatedAt: '2018-11-12T18:13:41.339Z' }, createdAt: '2019-05-13T15:29:31.071Z', updatedAt: '2019-05-13T15:29:31.071Z', __v: 0 },
  { installed: false, _id: '8e24c7d3-3d57-48b0-b8b6-7a41c3f6c272', integration: { _id: '07056a9a-e75f-49da-89ad-ba0e02680935', name: 'ups', category: 'shippings', displayOptions: { _id: 'a88c631b-7819-4d00-bbeb-744b99dd7eed', icon: '#icon-shipping-ups-white', title: 'Ups' }, installationOptions: { _id: '9342dbd4-5fe2-4a69-94bb-782f00e0ef12', links: [{ _id: 'ecfb1eed-feb1-49e3-b440-60f0412ca194', type: 'img', url: 'https://payevertesting.blob.core.windows.net/miscellaneous/b995b26c-1963-4ead-8aaa-f2fb0fee90cc-1.png' }], optionIcon: '#icon-shipping-ups-white', price: 'integrations.shippings.ups.price', category: 'integrations.shippings.ups.description', developer: 'integrations.shippings.ups.developer', languages: 'integrations.shippings.ups.languages', description: 'integrations.shippings.ups.description', appSupport: 'integrations.shippings.ups.appSupport_link', website: 'integrations.shippings.ups.website_link', pricingLink: 'integrations.shippings.ups.pricing_link' }, createdAt: '2018-11-12T18:13:41.339Z', updatedAt: '2018-11-12T18:13:41.339Z' }, createdAt: '2019-05-13T15:29:31.373Z', updatedAt: '2019-05-13T15:29:31.373Z', __v: 0 },
  { installed: false, _id: '82ea6a75-581e-4962-8d5b-b933f8131b93', integration: { _id: '266bea2e-ae61-4d75-802e-6320416010f4', name: 'stripe_directdebit', category: 'payments', displayOptions: { _id: 'a18c60df-ffa2-41cb-9ee8-2bc5d3381a91', icon: '#icon-payment-option-stripe-direct-debit', title: 'integrations.payments.stripe_directdebit.title' }, installationOptions: { _id: 'b351dab8-8261-495d-afbd-00e2a3c337f1', links: [{ _id: '3f11a3d1-ec44-4121-8bc3-39cfa461878c', type: 'img', url: 'https://payevertesting.blob.core.windows.net/miscellaneous/08679314-a8e4-4ce5-9eec-9cd4d9546169-Stripe.png' }], optionIcon: '#icon-payment-option-stripe-direct-debit', price: 'integrations.payments.stripe_directdebit.price', category: 'integrations.payments.stripe_directdebit.category', developer: 'integrations.payments.stripe_directdebit.developer', languages: 'integrations.payments.stripe_directdebit.languages', description: 'integrations.payments.stripe_directdebit.description', appSupport: 'integrations.payments.stripe_directdebit.support_link', website: 'https://getpayever.com/checkout/', pricingLink: 'https://stripe.com/de/pricing/' }, createdAt: '2019-03-19T15:00:00.000Z', updatedAt: '2019-03-19T15:00:00.000Z' }, createdAt: '2019-05-13T15:29:31.384Z', updatedAt: '2019-05-13T15:29:31.384Z', __v: 0 },
  { installed: false, _id: 'c9d0db05-a90f-483c-85b4-5001463e1c04', integration: { _id: '044aace0-866c-4221-b37a-dccf9a8c5cd5', name: 'paypal', category: 'payments', displayOptions: { _id: 'b135c015-d2ca-4df2-bc60-78a786738280', icon: '#icon-payment-option-paypall', title: 'integrations.payments.paypal.title' }, installationOptions: { _id: '8d6ae90d-8929-4fde-9846-91c1a1d8b9b7', links: [{ _id: '9a3bc967-4273-4705-b6db-6b6b44c7462a', type: 'img', url: 'https://payeverstaging.blob.core.windows.net/products/d8ea98df-1ea7-4fb2-aaca-fab96e9eab8e-PayPal-min.png' }], optionIcon: '#icon-payment-option-paypall', price: 'integrations.payments.paypal.price', category: 'integrations.payments.paypal.category', developer: 'integrations.payments.paypal.developer', languages: 'integrations.payments.paypal.languages', description: 'integrations.payments.paypal.description', appSupport: 'integrations.payments.paypal.support_link', website: 'integrations.payments.paypal.website_link', pricingLink: 'integrations.payments.paypal.pricing_link' }, createdAt: '2018-11-12T18:13:41.339Z', updatedAt: '2018-11-12T18:13:41.339Z' }, createdAt: '2019-05-13T15:29:31.071Z', updatedAt: '2019-05-13T15:29:31.071Z', __v: 0 },
];

describe('ConnectWidgetComponent', function () {
  let comp: ConnectWidgetComponent;
  let fixture: ComponentFixture<ConnectWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ButtonModule,
        I18nModule,
        MatProgressSpinnerModule,
        MatCardModule,
      ],
      declarations: [
        ConnectWidgetComponent,
        WidgetCardComponent,
        IconsPngUrlPipe,
        SafeStylePipe,
        WidgetActionButtonComponent,
        WidgetStatisticsComponent,
        WidgetStatisticsComponent,
      ],
      providers: [
        {
          provide: WidgetsApiService,
          useValue: {
            getUninstalledConnectionsFilteredByCountry: () => of(stub),
          },
        },
        {
          provide: AppLauncherService,
          useValue: {},
        },
        {
          provide: MicroRegistryService,
          useValue: {},
        },
        {
          provide: EnvService,
          useValue: new FakeEnvService(),
        },
        {
          provide: Router,
          useValue: new FakeRouter(),
        },
        {
          provide: LoaderService,
          useValue: {},
        },
        {
          provide: PlatformService,
          useValue: new FakePlatformService(),
        },
        {
          provide: HeaderService,
          useValue: {},
        },
        {
          provide: TranslateService,
          useValue: new FakeTranslateService(),
        },
        {
          provide: TranslationLoaderService,
          useValue: new FakeTranslationLoaderService(),
        },
        {
          provide: WallpaperService,
          useValue: new FakeWallpaperService(),
        },
        {
          provide: ApiService,
          useValue: {},
        },
        {
          provide: EditWidgetsService,
          useValue: {},
        },
        {
          provide: MediaService,
          useValue: new FakeMediaService(),
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectWidgetComponent);
    comp = fixture.componentInstance;
  });

  describe('Constructor', () =>
    it('should create component', () => expect(comp).toBeDefined())
  );

  describe('Widget Connect content header', () => {

    it('should render the icon', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-header-container .widget-card-header-icon'));
      expect(element).not.toBeNull();
    });

    it('should render the title', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-header-container .widget-card-header-title'));
      expect(element).not.toBeNull();
    });

    it('should render the open button', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-header-buttons button.mat-button-rounded'));
      expect(element).not.toBeNull();
    });

    it('should render the more button', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-header-buttons button.widget-card-header-more'));
      expect(element).not.toBeNull();
    });

  });

  describe('Widget Connect content body', () => {

    it('should render Connect items', () => {
      fixture.detectChanges();
      const elements = fixture.debugElement
        .queryAll(By.css('.widget-card-content-body-content .connect-apps-item'));
      expect(elements && elements.length).toEqual(4);
    });

    it('should render item icon', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-body-content .connect-apps-item .connect-apps-item-wrapper svg'));
      expect(element).not.toBeNull();
    });

    it('should render item install button', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-body-content .connect-apps-item .connect-apps-item-wrapper .connect-apps-item-install'));
      expect(element).not.toBeNull();
    });

    it('should render item install button icon', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-body-content .connect-apps-item .connect-apps-item-wrapper .connect-apps-item-install svg'));
      expect(element).not.toBeNull();
    });

    it('should render item install button title', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-body-content .connect-apps-item .connect-apps-item-wrapper .connect-apps-item-install span'));
      expect(element).not.toBeNull();
    });

    // it('should render panel "More" content', () => {
    //   TestBed.get(EnvService).businessIdStorage$.next('id');
    //   fixture.detectChanges();
    //   const element = fixture.debugElement
    //     .queryAll(By.css('.widget-card-content-more .connect-apps-item'));
    //   expect(element.length).toBe(3);
    // });

  });

  describe('Widget Connect actions', () => {

    it('should not open integration if empty', () => {
      let routerCall = false;
      TestBed.get(Router).navigate$.subscribe(() => routerCall = true);
      comp.onGoToIntegration(undefined);
      expect(routerCall).toBeFalsy();
    });

    it('should open integration', () => {
      let routerCall = false;
      let integrations: any;
      TestBed.get(Router).navigate$.subscribe(() => routerCall = true);
      comp.integrations$.subscribe(integ => integrations = integ);
      comp.onGoToIntegration(integrations[0]);

      expect(routerCall).toBeTruthy();
    });

  });

});
