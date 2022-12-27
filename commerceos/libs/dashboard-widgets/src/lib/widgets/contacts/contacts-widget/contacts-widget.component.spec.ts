import { HttpClient } from '@angular/common/http';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppLauncherService, EnvService, HeaderService, WallpaperService } from '@app/services';
import { WidgetActionButtonComponent, WidgetCardComponent, WidgetStatisticsComponent } from '@modules/dashboard/shared-dashboard/components';
import { EditWidgetsService } from '@modules/dashboard/shared-dashboard/services';
import { LoaderService, ApiService } from '@modules/shared/services';
import { BehaviorSubject } from 'rxjs';
import {
  FakeEnvService, FakeRouter, FakeLoaderService, FakePlatformService,
  FakeTranslateService, FakeWallpaperService, FakeMicroRegistryService, FakeEnvironmentConfigService, FakeHttpClient,
} from 'test.helpers';

import { ButtonModule } from '@pe/ng-kit/modules/button';
import { PlatformService, CommonModule } from '@pe/ng-kit/modules/common';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { I18nModule, TranslateService } from '@pe/ng-kit/modules/i18n';
import { MediaModule } from '@pe/ng-kit/modules/media';
import { MicroRegistryService } from '@pe/ng-kit/modules/micro';

import { ContactsWidgetComponent } from '..';
import { WidgetsApiService } from '../../../services';

describe('ContactsWidgetComponent', function () {
  let comp: ContactsWidgetComponent;
  let fixture: ComponentFixture<ContactsWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ButtonModule,
        I18nModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatDividerModule,
        MatListModule,
        MediaModule,
        CommonModule,
      ],
      declarations: [
        ContactsWidgetComponent,
        WidgetCardComponent,
        WidgetStatisticsComponent,
        WidgetActionButtonComponent,
      ],
      providers: [
        {
          provide: WidgetsApiService,
          useValue: {
            getMarketingData: () => new BehaviorSubject([{}]),
          },
        },
        {
          provide: AppLauncherService,
          useValue: {},
        },
        {
          provide: MicroRegistryService,
          useValue: new FakeMicroRegistryService(),
        },
        {
          provide: EnvService,
          useValue: new FakeEnvService('id'),
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
        {
          provide: TranslateService,
          useValue: new FakeTranslateService(),
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
    fixture = TestBed.createComponent(ContactsWidgetComponent);
    comp = fixture.componentInstance;
    comp.widget = {
      _id: '',
      defaultApp: true,
      installedApp: true,
      icon: '',
      title: 'Marketing',
      type: '',
      installed: true,
    };
  });

  describe('Constructor', () =>
    it('should create component', () => expect(comp).toBeDefined())
  );

  describe('Widget Contacts content header', () => {

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

  describe('Widget Contacts content body', () => {

    it('should render sections tag', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-body-content .sections-wrapper'));
      expect(element).not.toBeNull();
    });

    it('should render section infos', () => {
      fixture.detectChanges();
      const elements = fixture.debugElement
        .queryAll(By.css('.widget-card-content-body-content .sections-wrapper .section-info'));
      expect(elements.length).toBe(comp.sections.length);
    });

    it('should render add button', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-body-content button.add-contact'));
      expect(element).not.toBeNull();
    });

  });

});
