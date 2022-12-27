import { HttpClient } from '@angular/common/http';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppLauncherService, HeaderService, WallpaperService } from '@app/services';
import { WidgetActionButtonComponent, WidgetCardComponent, WidgetStatisticsComponent } from '@modules/dashboard/shared-dashboard/components';
import { EditWidgetsService } from '@modules/dashboard/shared-dashboard/services';
import { IntegrationCategory } from '@modules/dashboard/widgets/interfaces/checkout.interface';
import { LoaderService, ApiService } from '@modules/shared/services';
import { BehaviorSubject } from 'rxjs';

// import { I18nModule, TranslateService, TranslationLoaderService } from '@pe/ng-kit/modules/i18n';
import { EnvService } from '@pe/common';
import { ButtonModule } from '@pe/ng-kit/modules/button';
import { PlatformService, CommonModule } from '@pe/ng-kit/modules/common';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { MediaModule } from '@pe/ng-kit/modules/media';
import { MicroRegistryService } from '@pe/ng-kit/modules/micro';


import { CheckoutWidgetComponent } from '..';
import { WidgetsApiService } from '../../../services';
import { StoreInfoComponent } from '../../shared';


import {
  FakeEnvService, FakeRouter, FakeLoaderService, FakePlatformService,
  FakeTranslateService, FakeWallpaperService, FakeTranslationLoaderService,
  FakeEnvironmentConfigService,
  FakeHttpClient,
} from 'test.helpers';

const checkouts: any[] = [
  // tslint:disable-next-line:max-line-length
  { settings: { testingMode: false, cspAllowedHosts: [], languages: [{ active: false, isDefault: false, _id: '5c3c9921108e4c002795e92c', code: 'no', name: 'Norsk' }, { active: false, isDefault: false, _id: '5c3c9921108e4c002795e92b', code: 'sv', name: 'Svenska' }, { active: true, isDefault: true, _id: '5c3c9921108e4c002795e92a', code: 'en', name: 'English' }, { active: false, isDefault: false, _id: '5c3c9921108e4c002795e929', code: 'es', name: 'Español' }, { active: false, isDefault: false, _id: '5c3c9921108e4c002795e928', code: 'de', name: 'Deutsch' }, { active: false, isDefault: false, _id: '5c3c9921108e4c002795e927', code: 'da', name: 'Dansk' }] }, default: false, subscriptions: [], _id: 'd076dbc6-7c1d-4256-a360-186ec1c68d9b', name: 'Checkout #2', logo: '35bd93c5-f04a-4590-8f2a-4a12196866f2-consultant.png', sections: [{ excluded_channels: ['api', 'dandomain', 'jtl', 'magento', 'oxid', 'plentymarkets', 'presta', 'shopify', 'shopware', 'woo_commerce', 'xt_commerce'], enabled: true, code: 'order', fixed: true, order: 0, subsections: [{ rules: [{ _id: '261e569a-7d98-444f-87b6-28cb21cf191e', type: 'flow_property', property: 'cart', operator: 'isNotEmpty' }], _id: '9a6ee51f-30d2-44f9-a880-3d0d4af5727b', code: 'cart' }, { rules: [{ _id: '3e809d11-0a15-4362-8c46-490e4520d428', type: 'flow_property', property: 'cart', operator: 'isEmpty' }], _id: '91cad3f0-d48a-4d37-a46f-5bfbacf36ad0', code: 'amount_reference' }], _id: '52431aec-1eb8-43f0-9e68-f5dd0242235b' }, { excluded_channels: ['api', 'dandomain', 'jtl', 'magento', 'oxid', 'plentymarkets', 'presta', 'shopify', 'shopware', 'woo_commerce', 'xt_commerce'], enabled: true, code: 'user', fixed: false, order: 1, subsections: [{ rules: [], _id: '9869c0b9-5c9f-47a4-b31c-1fc93c1cadaf', code: 'checkout-main-user' }], _id: '65f60b50-efe6-4853-9322-3d84e76b91a5' }, { excluded_channels: ['api', 'dandomain', 'jtl', 'magento', 'oxid', 'plentymarkets', 'presta', 'shopify', 'shopware', 'woo_commerce', 'xt_commerce'], enabled: true, code: 'address', fixed: false, order: 2, subsections: [{ rules: [], _id: 'ee04ca85-9885-4736-b468-f48691c95051', code: 'checkout-main-address' }], _id: 'a39083ab-9ebc-425b-8e46-e9a8433cbc6d' }, { excluded_channels: [], enabled: true, code: 'choosePayment', fixed: true, order: 3, subsections: [{ rules: [], _id: 'a25f79e0-7aa3-4b01-bdaa-473a24806feb', code: 'checkout-main-choose-payment' }], _id: 'd5575476-f548-4fc1-99c6-0301767a5ce1' }, { excluded_channels: [], enabled: true, code: 'payment', fixed: true, order: 4, subsections: [{ rules: [], _id: '85104cf5-2b71-441b-a47b-19c74e25ae2d', code: 'checkout-main-payment' }], _id: 'f9cdc349-50ed-41bb-b5c2-93c874924611' }], businessId: 'fbeca444-f5c5-4a7c-a326-7ad57556fd45', createdAt: '2019-02-25T08:15:19.744Z', updatedAt: '2019-02-25T15:18:53.500Z', __v: 0 },
  // tslint:disable-next-line:max-line-length
  { settings: { testingMode: false, cspAllowedHosts: [], languages: [{ active: false, isDefault: false, _id: '5c3c9921108e4c002795e92c', code: 'no', name: 'Norsk' }, { active: false, isDefault: false, _id: '5c3c9921108e4c002795e92b', code: 'sv', name: 'Svenska' }, { active: true, isDefault: true, _id: '5c3c9921108e4c002795e92a', code: 'en', name: 'English' }, { active: false, isDefault: false, _id: '5c3c9921108e4c002795e929', code: 'es', name: 'Español' }, { active: false, isDefault: false, _id: '5c3c9921108e4c002795e928', code: 'de', name: 'Deutsch' }, { active: false, isDefault: false, _id: '5c3c9921108e4c002795e927', code: 'da', name: 'Dansk' }], styles: { button: { color: { text: '#fff', fill: '#fff', borders: 'fff' }, corners: 'round-32' }, page: { background: '#fff' }, _id: '5c73a5d1b17c78002cb40234' } }, default: false, subscriptions: [], _id: 'f8f31cb5-ec92-43cc-b633-f2a5a0ed783f', name: 'Checkout #1', logo: 'f2ca7370-e87f-4e6c-8214-61d7ba3a99dc-team (1).png', sections: [{ excluded_channels: ['api', 'dandomain', 'jtl', 'magento', 'oxid', 'plentymarkets', 'presta', 'shopify', 'shopware', 'woo_commerce', 'xt_commerce'], enabled: true, code: 'order', fixed: true, order: 0, subsections: [{ rules: [{ _id: '261e569a-7d98-444f-87b6-28cb21cf191e', type: 'flow_property', property: 'cart', operator: 'isNotEmpty' }], _id: '9a6ee51f-30d2-44f9-a880-3d0d4af5727b', code: 'cart' }, { rules: [{ _id: '3e809d11-0a15-4362-8c46-490e4520d428', type: 'flow_property', property: 'cart', operator: 'isEmpty' }], _id: '91cad3f0-d48a-4d37-a46f-5bfbacf36ad0', code: 'amount_reference' }], _id: '52431aec-1eb8-43f0-9e68-f5dd0242235b' }, { excluded_channels: ['api', 'dandomain', 'jtl', 'magento', 'oxid', 'plentymarkets', 'presta', 'shopify', 'shopware', 'woo_commerce', 'xt_commerce'], enabled: true, code: 'user', fixed: false, order: 1, subsections: [{ rules: [], _id: '9869c0b9-5c9f-47a4-b31c-1fc93c1cadaf', code: 'checkout-main-user' }], _id: '65f60b50-efe6-4853-9322-3d84e76b91a5' }, { excluded_channels: ['api', 'dandomain', 'jtl', 'magento', 'oxid', 'plentymarkets', 'presta', 'shopify', 'shopware', 'woo_commerce', 'xt_commerce'], enabled: true, code: 'address', fixed: false, order: 2, subsections: [{ rules: [], _id: 'ee04ca85-9885-4736-b468-f48691c95051', code: 'checkout-main-address' }], _id: 'a39083ab-9ebc-425b-8e46-e9a8433cbc6d' }, { excluded_channels: [], enabled: true, code: 'choosePayment', fixed: true, order: 3, subsections: [{ rules: [], _id: 'a25f79e0-7aa3-4b01-bdaa-473a24806feb', code: 'checkout-main-choose-payment' }], _id: 'd5575476-f548-4fc1-99c6-0301767a5ce1' }, { excluded_channels: [], enabled: true, code: 'payment', fixed: true, order: 4, subsections: [{ rules: [], _id: '85104cf5-2b71-441b-a47b-19c74e25ae2d', code: 'checkout-main-payment' }], _id: 'f9cdc349-50ed-41bb-b5c2-93c874924611' }], businessId: 'fbeca444-f5c5-4a7c-a326-7ad57556fd45', createdAt: '2019-01-14T14:13:53.634Z', updatedAt: '2019-02-25T16:39:18.735Z', __v: 0 },
  // tslint:disable-next-line:max-line-length
  { settings: { testingMode: false, cspAllowedHosts: [], languages: [{ active: false, isDefault: false, _id: '5c3c9921108e4c002795e92c', code: 'no', name: 'Norsk' }, { active: false, isDefault: false, _id: '5c3c9921108e4c002795e92b', code: 'sv', name: 'Svenska' }, { active: true, isDefault: true, _id: '5c3c9921108e4c002795e92a', code: 'en', name: 'English' }, { active: false, isDefault: false, _id: '5c3c9921108e4c002795e929', code: 'es', name: 'Español' }, { active: false, isDefault: false, _id: '5c3c9921108e4c002795e928', code: 'de', name: 'Deutsch' }, { active: false, isDefault: false, _id: '5c3c9921108e4c002795e927', code: 'da', name: 'Dansk' }], styles: { button: { color: { text: '#fff', fill: '#fff', borders: 'fff' }, corners: 'round-32' }, page: { background: '#34815b' }, _id: '5c93ba044b8e850028868799' } }, default: true, subscriptions: [], _id: '282ea8c0-b0c5-4757-a7c7-399a85eb12cb', name: 'Test default', logo: '', sections: [{ _id: '87695a9d-ab32-4fa5-b958-cf637eb6340a', code: 'order', order: 0, enabled: true }, { _id: '939dfaa7-908e-478a-bc68-1018da075eb6', code: 'user', order: 1, enabled: true }, { _id: '67b70735-bd5c-4894-b17f-1e9e8a7a1515', code: 'address', order: 2, enabled: true }, { _id: 'aaa84f89-e4b9-47f9-80f9-decf697294ea', code: 'choosePayment', order: 3, enabled: true }, { _id: 'dc558619-fa10-4baf-978b-b2c33b1deb82', code: 'payment', order: 4, enabled: true }], businessId: 'fbeca444-f5c5-4a7c-a326-7ad57556fd45', createdAt: '2019-04-03T09:31:35.042Z', updatedAt: '2019-04-03T09:31:42.591Z', __v: 0 },
];

const integrations: any[] = [
  // tslint:disable-next-line:max-line-length
  { installed: false, _id: 'e152e47f-9073-49a0-92e1-97da4b667861', integration: { _id: 'ed33ebdd-1fc1-4686-b9ef-fca7eb401c88', name: 'amazon', category: 'payments', displayOptions: { _id: 'af3ecdc5-e194-4a7d-89dc-4f2289b91c5a', icon: '#payment-method-amazon', title: 'Amazon' }, installationOptions: { countryList: [], _id: '81612f6c-0aec-4f51-9d13-eb82eeaed18e', links: [{ _id: 'd2bcdc10-825f-415c-8d46-ed2b53639d45', type: 'img', url: 'https://payevertesting.blob.core.windows.net/miscellaneous/a10f7ba9-577f-4a3d-9203-87d625931bb6-Amazon.png' }], optionIcon: '#payment-method-amazon', price: 'integrations.products.amazon.price', category: 'integrations.products.amazon.category', developer: 'integrations.products.amazon.developer', languages: 'integrations.products.amazon.languages', description: 'integrations.products.amazon.description', appSupport: 'integrations.products.amazon.support_link', website: 'integrations.products.amazon.website_link', pricingLink: 'integrations.products.amazon.pricing_link' }, createdAt: '2019-03-05T18:00:00.000Z', updatedAt: '2019-03-05T19:00:00.000Z' }, createdAt: '2019-05-13T15:29:31.319Z', updatedAt: '2019-05-13T15:29:31.319Z', __v: 0 },
  // tslint:disable-next-line:max-line-length
  { installed: false, _id: '8e24c7d3-3d57-48b0-b8b6-7a41c3f6c270', integration: { _id: '07056a9a-e75f-49da-89ad-ba0e02680935', name: 'ups', category: 'shippings', displayOptions: { _id: 'a88c631b-7819-4d00-bbeb-744b99dd7eed', icon: '#icon-shipping-ups-white', title: 'Ups' }, installationOptions: { countryList: [], _id: '9342dbd4-5fe2-4a69-94bb-782f00e0ef12', links: [{ _id: 'ecfb1eed-feb1-49e3-b440-60f0412ca194', type: 'img', url: 'https://payevertesting.blob.core.windows.net/miscellaneous/b995b26c-1963-4ead-8aaa-f2fb0fee90cc-1.png' }], optionIcon: '#icon-shipping-ups-white', price: 'integrations.shippings.ups.price', category: 'integrations.shippings.ups.description', developer: 'integrations.shippings.ups.developer', languages: 'integrations.shippings.ups.languages', description: 'integrations.shippings.ups.description', appSupport: 'integrations.shippings.ups.appSupport_link', website: 'integrations.shippings.ups.website_link', pricingLink: 'integrations.shippings.ups.pricing_link' }, createdAt: '2018-11-12T18:13:41.339Z', updatedAt: '2018-11-12T18:13:41.339Z' }, createdAt: '2019-05-13T15:29:31.373Z', updatedAt: '2019-05-13T15:29:31.373Z', __v: 0 },
  // tslint:disable-next-line:max-line-length
  { installed: true, _id: '8e24c7d3-3d57-48b0-b8b6-7a41c3f6c271', integration: { _id: '07056a9a-e75f-49da-89ad-ba0e02680935', name: 'ups', category: IntegrationCategory.Payments, displayOptions: { _id: 'a88c631b-7819-4d00-bbeb-744b99dd7eed', icon: '#icon-shipping-ups-white', title: 'Ups' }, installationOptions: { countryList: [], _id: '9342dbd4-5fe2-4a69-94bb-782f00e0ef12', links: [{ _id: 'ecfb1eed-feb1-49e3-b440-60f0412ca194', type: 'img', url: 'https://payevertesting.blob.core.windows.net/miscellaneous/b995b26c-1963-4ead-8aaa-f2fb0fee90cc-1.png' }], optionIcon: '#icon-shipping-ups-white', price: 'integrations.shippings.ups.price', category: 'integrations.shippings.ups.description', developer: 'integrations.shippings.ups.developer', languages: 'integrations.shippings.ups.languages', description: 'integrations.shippings.ups.description', appSupport: 'integrations.shippings.ups.appSupport_link', website: 'integrations.shippings.ups.website_link', pricingLink: 'integrations.shippings.ups.pricing_link' }, createdAt: '2018-11-12T18:13:41.339Z', updatedAt: '2018-11-12T18:13:41.339Z' }, createdAt: '2019-05-13T15:29:31.373Z', updatedAt: '2019-05-13T15:29:31.373Z', __v: 0 },
  // tslint:disable-next-line:max-line-length
  { installed: true, _id: '8e24c7d3-3d57-48b0-b8b6-7a41c3f6c272', integration: { _id: '07056a9a-e75f-49da-89ad-ba0e02680935', name: 'ups', category: IntegrationCategory.Applications, displayOptions: { _id: 'a88c631b-7819-4d00-bbeb-744b99dd7eed', icon: '#icon-shipping-ups-white', title: 'Ups' }, installationOptions: { countryList: [], _id: '9342dbd4-5fe2-4a69-94bb-782f00e0ef12', links: [{ _id: 'ecfb1eed-feb1-49e3-b440-60f0412ca194', type: 'img', url: 'https://payevertesting.blob.core.windows.net/miscellaneous/b995b26c-1963-4ead-8aaa-f2fb0fee90cc-1.png' }], optionIcon: '#icon-shipping-ups-white', price: 'integrations.shippings.ups.price', category: 'integrations.shippings.ups.description', developer: 'integrations.shippings.ups.developer', languages: 'integrations.shippings.ups.languages', description: 'integrations.shippings.ups.description', appSupport: 'integrations.shippings.ups.appSupport_link', website: 'integrations.shippings.ups.website_link', pricingLink: 'integrations.shippings.ups.pricing_link' }, createdAt: '2018-11-12T18:13:41.339Z', updatedAt: '2018-11-12T18:13:41.339Z' }, createdAt: '2019-05-13T15:29:31.373Z', updatedAt: '2019-05-13T15:29:31.373Z', __v: 0 },
];

class FakeWidgetsApiService {
  checkoutList$: BehaviorSubject<any> = new BehaviorSubject(checkouts);
  integrationList$: BehaviorSubject<any> = new BehaviorSubject(integrations);

  getCheckoutList = () => this.checkoutList$;
  getIntegrationList = () => this.integrationList$;

}

describe('CheckoutWidgetComponent', function () {
  let comp: CheckoutWidgetComponent;
  let fixture: ComponentFixture<CheckoutWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ButtonModule,
        // I18nModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MediaModule,
        CommonModule,
      ],
      declarations: [
        CheckoutWidgetComponent,
        WidgetCardComponent,
        WidgetStatisticsComponent,
        WidgetActionButtonComponent,
        StoreInfoComponent,
      ],
      providers: [
        {
          provide: WidgetsApiService,
          useValue: new FakeWidgetsApiService(),
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
          useValue: new FakeLoaderService(),
        },
        {
          provide: PlatformService,
          useValue: new FakePlatformService(),
        },
        {
          provide: HeaderService,
          useValue: {},
        },
        // {
        //   provide: TranslateService,
        //   useValue: new FakeTranslateService()
        // },
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
        // {
        //   provide: TranslationLoaderService,
        //   useValue: new FakeTranslationLoaderService()
        // },
        {
          provide: EnvironmentConfigService,
          useValue: new FakeEnvironmentConfigService(),
        },
        {
          provide: HttpClient,
          useValue: new FakeHttpClient(),
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutWidgetComponent);
    comp = fixture.componentInstance;
  });

  describe('Constructor', () =>
    it('should create component', () => expect(comp).toBeDefined())
  );

  describe('Widget Checkout content header', () => {

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

  describe('Widget Checkout content body', () => {

    it('should render default checkout', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-body-content .checkout-container'));
      expect(element).not.toBeNull();
    });

    it('should render install button if no checkouts', () => {
      const service = TestBed.get(WidgetsApiService);
      service.checkoutList$.next([]);
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-body .install-app-button'));
      expect(element).not.toBeNull();
    });

    it('should render payment items', () => {
      fixture.detectChanges();
      const elements = fixture.debugElement
        .queryAll(By.css('.widget-card-content-more .checkout-more-details.left-side .checkout-integration-item'));
      expect(elements.length).toBe(2);
    });

    it('should render payment items icons', () => {
      let paymentMethods: any;
      fixture.detectChanges();
      const elements = fixture.debugElement
        .queryAll(By.css('.widget-card-content-more .checkout-more-details.left-side .checkout-integration-item use'));

      comp.paymentMethods$.subscribe(pm => paymentMethods = pm);
      expect(elements.map(e => e.nativeElement.href.baseVal)).toEqual(jasmine.arrayContaining(paymentMethods.map((p: any) => p.icon)));
    });

    it('should render channels items', () => {
      fixture.detectChanges();
      const elements = fixture.debugElement
      .queryAll(By.css('.widget-card-content-more .checkout-more-details.left-side .checkout-integration-item'));
      expect(elements.length).toBe(2);
    });

    it('should render channels items icons', () => {
      let channels: any;
      fixture.detectChanges();
      const elements = fixture.debugElement
        .queryAll(By.css('.widget-card-content-more .checkout-more-details.right-side .checkout-integration-item use'));

      comp.channels$.subscribe(pm => channels = pm);
      expect(elements.map(e => e.nativeElement.href.baseVal)).toEqual(jasmine.arrayContaining(channels.map((p: any) => p.icon)));
    });

  });

  describe('Widget Checkout actions', () => {

    it('should navigate on add checkout', () => {
      let routing = false;
      TestBed.get(Router).navigate$.subscribe(() => routing = true);

      comp.onAddNewCheckout();
      expect(routing).toBeTruthy();
    });

    it('should navigate on edit checkout', () => {
      let routing = false;
      TestBed.get(Router).navigate$.subscribe(() => routing = true);

      comp.onEditCheckout({} as any);
      expect(routing).toBeTruthy();
    });

    it('should navigate on add payment', () => {
      let routing = false;
      TestBed.get(Router).navigate$.subscribe(() => routing = true);

      comp.onAddPayments();
      expect(routing).toBeTruthy();
    });

    it('should navigate on add channel', () => {
      let routing = false;
      TestBed.get(Router).navigate$.subscribe(() => routing = true);

      comp.onAddChannel();
      expect(routing).toBeTruthy();
    });

  });

  describe('Widget Checkout data', () => {

    it('should render default checkout if exists', () => {
      const service = TestBed.get(WidgetsApiService);
      let defPayment: any;
      service.checkoutList$.next(checkouts.slice().map((c, index) => {
        if (index === 1) {
          c.default = true;
        }

        return c;
      }));

      comp.defaultPayment$.subscribe(p => defPayment = p[0]);
      expect(defPayment.default).toBeTruthy();
    });

  });
});
