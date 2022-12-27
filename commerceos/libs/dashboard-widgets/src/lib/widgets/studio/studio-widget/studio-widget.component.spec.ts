import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppLauncherService, EnvService, HeaderService, WallpaperService } from '@app/services';
import { WidgetCardComponent, WidgetStatisticsComponent } from '@modules/dashboard/shared-dashboard/components';
import { EditWidgetsService } from '@modules/dashboard/shared-dashboard/services';
import { LoaderService, ApiService } from '@modules/shared/services';
import {
  FakeEnvService, FakeRouter, FakeLoaderService, FakePlatformService,
  FakeTranslateService, FakeWallpaperService, FakeTranslationLoaderService,
  FakeEnvironmentConfigService, FakeMicroLoaderService, FakeMicroRegistryService,
} from 'test.helpers';

import { ButtonModule } from '@pe/ng-kit/modules/button';
import { PlatformService, CommonModule } from '@pe/ng-kit/modules/common';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { I18nModule, TranslateService, TranslationLoaderService } from '@pe/ng-kit/modules/i18n';
import { MediaModule } from '@pe/ng-kit/modules/media';
import { MicroRegistryService, MicroLoaderService } from '@pe/ng-kit/modules/micro';


import { StudioWidgetComponent } from '..';
import { WidgetsApiService } from '../../../services';

import { BehaviorSubject } from 'rxjs';

describe('StudioWidgetComponent', function () {
  let comp: StudioWidgetComponent;
  let fixture: ComponentFixture<StudioWidgetComponent>;

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
        StudioWidgetComponent,
        WidgetCardComponent,
        WidgetStatisticsComponent,
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
          provide: TranslationLoaderService,
          useValue: new FakeTranslationLoaderService(),
        },
        {
          provide: EnvironmentConfigService,
          useValue: new FakeEnvironmentConfigService(),
        },
        {
          provide: MicroLoaderService,
          useValue: new FakeMicroLoaderService(),
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudioWidgetComponent);
    comp = fixture.componentInstance;
    comp.widget = {
      _id: '',
      defaultApp: true,
      installedApp: true,
      icon: '',
      title: 'Studio',
      type: '',
      installed: true,
    };
  });

  describe('Constructor', () =>
    it('should create component', () => expect(comp).toBeDefined())
  );

  describe('Widget Studio content', () => {

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

    it('should render the buy now button', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.install-studio.mat-button-rect-md.mat-button-no-padding'));
      expect(element).not.toBeNull();
    });

  });

  describe('Widget Studio actions', () => {

    it('should open studio', () => {
      fixture.detectChanges();
      const windowOpenSpy = spyOn(window, 'open').and.stub();


      comp.onOpenStudioClick();
      expect(windowOpenSpy).toHaveBeenCalled();
    });

  });
});
