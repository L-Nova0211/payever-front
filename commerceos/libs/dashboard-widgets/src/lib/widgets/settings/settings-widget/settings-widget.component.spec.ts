import { HttpClient } from '@angular/common/http';
import { TestBed, async, ComponentFixture, fakeAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppLauncherService, EnvService, HeaderService, WallpaperService } from '@app/services';
import { WidgetCardComponent, WidgetStatisticsComponent } from '@modules/dashboard/shared-dashboard/components';
import { EditWidgetsService } from '@modules/dashboard/shared-dashboard/services';
import { LoaderService, ApiService } from '@modules/shared/services';

import {
  FakeEnvService, FakeRouter, FakeLoaderService, FakePlatformService,
  FakeTranslateService, FakeWallpaperService, FakeAuthService, FakeMicroRegistryService, FakeEnvironmentConfigService, FakeHttpClient,
} from 'test.helpers';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { ButtonModule } from '@pe/ng-kit/modules/button';
import { PlatformService, CommonModule } from '@pe/ng-kit/modules/common';
import { I18nModule, TranslateService } from '@pe/ng-kit/modules/i18n';
import { MediaModule } from '@pe/ng-kit/modules/media';
import { MicroRegistryService } from '@pe/ng-kit/modules/micro';


import { SettingsWidgetComponent } from '..';
import { WidgetsApiService } from '../../../services';

import { BehaviorSubject, throwError } from 'rxjs';

import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';

const SVG_WALLPAPER = '#icon-settings-dashboard-skin-48';
const SVG_LANGUAGE = '#icon-settings-translations-48';

class FakeWidgetsApiService {

}

describe('SettingsWidgetComponent', function () {
  let comp: SettingsWidgetComponent;
  let fixture: ComponentFixture<SettingsWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ButtonModule,
        I18nModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MediaModule,
        CommonModule,
      ],
      declarations: [
        SettingsWidgetComponent,
        WidgetCardComponent,
        WidgetStatisticsComponent,
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
          useValue: new FakeMicroRegistryService(),
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
          provide: AuthService,
          useValue: new FakeAuthService(),
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
    fixture = TestBed.createComponent(SettingsWidgetComponent);
    comp = fixture.componentInstance;
  });

  describe('Constructor', () =>
    it('should create component', () => expect(comp).toBeDefined())
  );

  describe('Widget Settings content header', () => {

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

    it('should not render the more button', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-header-buttons button.widget-card-header-more'));
      expect(element).toBeNull();
    });

  });

  describe('Widget Settings content body', () => {

    it('should render edit wallpaper button', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css(`.widget-card-content-body-content button [*|href="${SVG_WALLPAPER}"]`));
      expect(element).not.toBeNull();
    });

    it('should render edit language button', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css(`.widget-card-content-body-content button [*|href="${SVG_LANGUAGE}"]`));
      expect(element).not.toBeNull();
    });

  });

  describe('Widget Settings actions', () => {

    it('should open edit wallpaper for business', () => {
      const router = TestBed.get(Router);

      spyOn(router, 'navigate');

      comp.onEditWallpaper();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should open edit wallpaper for personal', () => {
      const envService = TestBed.get(EnvService),
        loaderService = TestBed.get(LoaderService);
      envService.isPersonalMode = true;
      const router = TestBed.get(Router);

      spyOn(router, 'navigate').and.returnValue(new Promise(res => res()));
      spyOn(loaderService, 'loadMicroScript').and.returnValue(new BehaviorSubject(''));

      comp.onEditWallpaper();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should open edit wallpaper if micro started', () => {
      const microRegistryService = TestBed.get(MicroRegistryService),
        loaderService = TestBed.get(LoaderService);
      const router = TestBed.get(Router);

      spyOn(router, 'navigate').and.returnValue(new Promise(res => res()));
      spyOn(microRegistryService, 'getMicroConfig').and.returnValue({
        started: true,
      });

      spyOn(loaderService, 'loadMicroScript').and.returnValue(new BehaviorSubject(''));

      comp.onEditWallpaper();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should handle error on open edit wallpaper', () => {
      const microRegistryService = TestBed.get(MicroRegistryService),
        loaderService = TestBed.get(LoaderService);
      const router = TestBed.get(Router);

      spyOn(router, 'navigate').and.returnValue(new Promise(res => res()));
      spyOn(microRegistryService, 'getMicroConfig').and.returnValue({
        started: true,
      });

      spyOn(loaderService, 'loadMicroScript').and.returnValue(throwError(''));

      comp.onEditWallpaper();
      expect(router.navigate).not.toHaveBeenCalled();
    });


    it('should open edit language for business', () => {
      const router = TestBed.get(Router);

      spyOn(router, 'navigate');

      comp.onEditLanguage();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should open edit language for personal', () => {
      const envService = TestBed.get(EnvService),
        loaderService = TestBed.get(LoaderService);
      envService.isPersonalMode = true;
      const router = TestBed.get(Router);

      spyOn(router, 'navigate').and.returnValue(new Promise(res => res()));
      spyOn(loaderService, 'loadMicroScript').and.returnValue(new BehaviorSubject(''));

      comp.onEditLanguage();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should open edit language if micro started', () => {
      const microRegistryService = TestBed.get(MicroRegistryService),
        loaderService = TestBed.get(LoaderService);
      const router = TestBed.get(Router);

      spyOn(router, 'navigate').and.returnValue(new Promise(res => res()));
      spyOn(microRegistryService, 'getMicroConfig').and.returnValue({
        started: true,
      });

      spyOn(loaderService, 'loadMicroScript').and.returnValue(new BehaviorSubject(''));

      comp.onEditLanguage();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should handle error on open edit language', () => {
      const microRegistryService = TestBed.get(MicroRegistryService),
        loaderService = TestBed.get(LoaderService);
      const router = TestBed.get(Router);

      spyOn(router, 'navigate').and.returnValue(new Promise(res => res()));
      spyOn(microRegistryService, 'getMicroConfig').and.returnValue({
        started: true,
      });

      spyOn(loaderService, 'loadMicroScript').and.returnValue(throwError(''));

      comp.onEditLanguage();
      expect(router.navigate).not.toHaveBeenCalled();
    });

  });

});
