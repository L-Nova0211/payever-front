import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppLauncherService, EnvService, HeaderService, WallpaperService } from '@app/services';
import { WidgetActionButtonComponent, WidgetCardComponent, WidgetStatisticsComponent } from '@modules/dashboard/shared-dashboard/components';
import { EditWidgetsService } from '@modules/dashboard/shared-dashboard/services';
import { LoaderService, ApiService } from '@modules/shared/services';
import { combineLatest } from 'rxjs';
import {
  FakeEditWidgetsService, FakeTranslateService, FakePlatformService, FakeRouter,
  FakeEnvService, FakeWallpaperService, FakeMediaService,
} from 'test.helpers';

import { ButtonModule } from '@pe/ng-kit/modules/button';
import { PlatformService } from '@pe/ng-kit/modules/common';
import { I18nModule, TranslateService, TranslationLoaderService } from '@pe/ng-kit/modules/i18n';
import { MicroRegistryService } from '@pe/ng-kit/modules/micro';
import { IconsPngUrlPipe, SafeStylePipe, MediaService } from '@pe/ng-kit/src/kit/media';

import { TutorialWidgetComponent } from '../';
import { WidgetsApiService } from '../../../services';


const tutorials: any[] = [
  {
    _id: '0b53fcef-11a6-45ed-8579-7603aee42a7b', $init: true,
    title: 'payever Checkout', icon: '#icon-apps-payments', url: 'https://getpayever.com/help/checkout/',
    type: 'checkout', watched: false, order: 50,
  },
  {
    _id: '24568b8d-2fbb-43cf-9ef1-9e1523219e32', $init: true,
    title: 'payever Transactions', icon: '#icon-apps-orders', url: 'https://getpayever.com/help/transactions/',
    type: 'transactions', watched: false, order: 80,
  },
  {
    _id: '35c33640-cc49-47f3-b137-f6c0a110ae0a', $init: true,
    title: 'payever Connect', icon: '#icon-apps-app-market', url: 'https://getpayever.com/help/connect/',
    type: 'connect', watched: false, order: 70,
  },
  {
    _id: '38a8aa9c-784c-4c4e-a603-7da71a446af3', $init: true,
    title: 'payever Shop', icon: '#icon-apps-store', url: 'https://getpayever.com/help/shop/',
    type: 'shop', watched: false, order: 40,
  },
  {
    _id: '56a4545e-36c6-44a1-b381-90c67b89bbc2', $init: true,
    title: 'payever Marketing', icon: '#icon-apps-marketing', url: 'https://getpayever.com/help/mail/',
    type: 'marketing', watched: false, order: 30,
  },
  {
    _id: '6c969c34-e79b-4ec5-b11b-ff45aff397e4', $init: true,
    title: 'payever Settings', icon: '#icon-apps-settings', url: 'https://getpayever.com/help/settings/',
    type: 'settings', watched: false, order: 0,
  },
  {
    _id: 'c4a68f1e-e8ac-418c-a6d0-acc1e906d9a9', $init: true,
    title: 'payever Point of sale', icon: '#icon-apps-pos', url: 'https://getpayever.com/help/point-of-sale/',
    type: 'pos', watched: false, order: 10,
  },
  {
    _id: 'fe7d398c-194c-46ca-b00a-943d928919ba', $init: true,
    title: 'payever Products', icon: '#icon-apps-products', url: 'https://getpayever.com/help/products/',
    type: 'products', watched: false, order: 60,
  },
];

describe('TutorialWidgetComponent', function () {
  let comp: TutorialWidgetComponent;
  let fixture: ComponentFixture<TutorialWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ButtonModule,
        I18nModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatListModule,
      ],
      declarations: [
        TutorialWidgetComponent,
        WidgetCardComponent,
        IconsPngUrlPipe,
        SafeStylePipe,
        WidgetStatisticsComponent,
        WidgetActionButtonComponent,
      ],
      providers: [
        {
          provide: WidgetsApiService,
          useValue: {},
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
          provide: WallpaperService,
          useValue: new FakeWallpaperService(),
        },
        {
          provide: ApiService,
          useValue: {},
        },
        {
          provide: EditWidgetsService,
          useValue: new FakeEditWidgetsService(tutorials),
        },
        {
          provide: TranslationLoaderService,
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
    fixture = TestBed.createComponent(TutorialWidgetComponent);
    comp = fixture.componentInstance;
  });

  describe('Constructor', () =>
    it('should create component', () => expect(comp).toBeDefined())
  );

  describe('Widget Tutorial list', () => {
    it('should request data', () => {
      let value;
      comp.widgetTutorials$.subscribe(list => value = list);
      expect(value).toBeDefined();
    });
    it('should split in two list: first contains 2 items', () => {
      let value: any[];
      comp.firstTutorials$.subscribe(list => value = list);
      expect(value.length).toEqual(2);
    });
    it('should split in two list: second contains rest items', () => {
      let includes: boolean;
      combineLatest(
        comp.firstTutorials$,
        comp.widgetTutorials$
      ).subscribe(([firstList, secondList]) => {
        includes = firstList.reduce((res, i) => res || (secondList.includes(i)), false);
      });
      expect(includes).toBeFalsy();
    });
  });

  describe('Widget Tutorial content', () => {

    it('should render first two items', () => {
      fixture.detectChanges();
      const elements = fixture.debugElement
        .queryAll(By.css('.widget-card-content .mat-list-item-content'));
      expect(elements.length).toEqual(2);
    });

    it('should render rest items', () => {
      let value: any[];
      fixture.detectChanges();
      const elements = fixture.debugElement
        .queryAll(By.css('.widget-card-content-more .mat-list-item-content'));
      comp.widgetTutorials$.subscribe(items => value = items);
      expect(elements.length - value.length).toEqual(0);
    });

    it('should render first two items with default', () => {
      let hasDefault: any;
      const defType = comp['defaultTutorial'];

      const editWidgetsService = TestBed.get(EditWidgetsService);
      const tutors = tutorials.slice();
      tutors[0].type = defType;
      editWidgetsService.widgetTutorials$.next(tutors);
      comp.firstTutorials$.subscribe(firsts => hasDefault = firsts.find(t => t.type === defType));

      expect(hasDefault).toBeDefined();
    });

    it('item should render the icon', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-more .mat-list-item-content sgv.icon-play-tutorial'));
      expect(element).toBeDefined();
    });

    it('item should render the title', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-more .mat-list-item-content span.tutorial-title'));
      expect(element).toBeDefined();
    });

    it('item should not render watch mark', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-more .mat-list-item-content .tutorial-watched'));
      expect(element || undefined).toBeUndefined();
    });

    it('item should render watch mark', () => {
      const editService = TestBed.get(EditWidgetsService);
      editService.widgetTutorials$.next(tutorials.map(t => ({
        ...t,
        watched: true,
      })));
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-more .mat-list-item-content .tutorial-watched'));
      expect(element).toBeDefined();
    });

    it('item should render the watch button', () => {
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.widget-card-content-more .mat-list-item-content button.install-button'));
      expect(element).toBeDefined();
    });

  });

  describe('Widget Tutorial actions', () => {

    it('should mark as watched and navigate to tutorial', () => {
      let tutorial: any;
      const editWidgetsService = TestBed.get(EditWidgetsService);

      spyOn(window, 'open');

      comp.firstTutorials$.subscribe(tutors => tutorial = tutors[0]);
      comp.onWatchTutorial(tutorial);

      expect(editWidgetsService.watched).toBeTruthy();

      expect(window.open).toHaveBeenCalled();
    });

    it('should not navigate if url is empty', () => {
      let tutorial: any;

      spyOn(window, 'open');

      comp.firstTutorials$.subscribe(tutors => tutorial = tutors[0]);
      tutorial.watched = true;
      tutorial.url = '';
      comp.onWatchTutorial(tutorial);

      expect(window.open).not.toHaveBeenCalled();
    });

    it('should emit uninstall', () => {
      let uninstall = false;
      comp.uninstall.subscribe(() => uninstall = true);

      comp.onUninstall();

      expect(uninstall).toBeTruthy();
    });

  });

});
