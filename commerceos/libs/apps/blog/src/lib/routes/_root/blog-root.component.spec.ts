import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MessageBus, PebEnvService } from '@pe/builder-core';
import { AppThemeEnum } from '@pe/common';
import { TranslatePipe, TranslationLoaderService } from '@pe/i18n';

import { AbbreviationPipe } from '../../misc/pipes/abbreviation.pipe';

import { PebBlogComponent } from './blog-root.component';
import { SidebarAnimationProgress } from './sidebar.animation';

describe('PebShopComponent', () => {

  let fixture: ComponentFixture<PebBlogComponent>;
  let component: PebBlogComponent;
  let router: any;
  let route: any;
  let translationLoaderService: jasmine.SpyObj<TranslationLoaderService>;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let envService: jasmine.SpyObj<PebEnvService>;

  beforeEach(async(() => {

    const translationLoaderServiceSpy = jasmine.createSpyObj<TranslationLoaderService>('TranslationLoaderService', [
      'loadTranslations',
    ]);

    const routeMock = {
      snapshot: {
        data: {
          shop: { id: 'shop-001' },
        },
        children: [],
      },
    };

    const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', [
      'listen',
      'emit',
    ]);
    messageBusSpy.listen.and.returnValue(of(null));

    const envServiceMock = {
      shopId: 'shop-001',
      businessData: undefined,
    };

    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
      ],
      declarations: [
        PebBlogComponent,
        TranslatePipe,
        AbbreviationPipe,
      ],
      providers: [
        { provide: Router, useValue: {} },
        { provide: TranslationLoaderService, useValue: translationLoaderServiceSpy },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: PebEnvService, useValue: envServiceMock },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebBlogComponent);
      component = fixture.componentInstance;

      router = TestBed.inject(Router);
      route = TestBed.inject(ActivatedRoute);
      translationLoaderService = TestBed.inject(TranslationLoaderService) as jasmine.SpyObj<TranslationLoaderService>;
      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
      envService = TestBed.inject(PebEnvService);

      router.events = of(null);
      router.url = '/test';

      translationLoaderService.loadTranslations.and.returnValue(of(false));

    });

  }));

  it('should be defined', () => {

    const cdrSpy = {
      markForCheck: jasmine.createSpy('markForCheck'),
    } as any;

    fixture.detectChanges();

    // w/o businessData
    expect(component).toBeDefined();
    expect(component.theme).toEqual(AppThemeEnum.default);

    // w/o businessData.themeSettings
    envService.businessData = {
      themeSettings: undefined,
    } as any;

    component = new PebBlogComponent(
      router,
      translationLoaderService,
      route,
      messageBus,
      envService,
      cdrSpy,
    );

    expect(component.theme).toEqual(AppThemeEnum.default);

    // w/ themeSettings
    envService.businessData.themeSettings = {
      theme: AppThemeEnum.light,
    };

    component = new PebBlogComponent(
      router,
      translationLoaderService,
      route,
      messageBus,
      envService,
      cdrSpy,
    );

    expect(component.theme).toEqual(AppThemeEnum.light);

  });

  it('should set grid animation progress', () => {

    const nextSpy = spyOn(component[`gridAnimationProgressStream$`], 'next').and.callThrough();
    const value = SidebarAnimationProgress.Done

    component.gridAnimationProgress$.subscribe(progress => expect(progress).toEqual(value));
    component.gridAnimationProgress = value;

    expect(nextSpy).toHaveBeenCalledWith(value);

  });

  it('should init translations on init', () => {

    const initSpy = spyOn<any>(component, 'initTranslations');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const event = new NavigationEnd(13, 'test', '');

    router.events = of(event);

    // w/o children
    component.ngOnInit();

    expect(component.blog).toEqual({ id: 'shop-001' });
    expect(detectSpy).toHaveBeenCalled();
    expect(messageBus.emit).toHaveBeenCalledWith('shop.navigate.dashboard', 'shop-001');
    expect(initSpy).toHaveBeenCalled();

    // w/ children
    messageBus.emit.calls.reset();

    route.snapshot.children = [{ test: true }];

    component.ngOnInit();

    expect(messageBus.emit).not.toHaveBeenCalled();

  });

  it('should get active link', () => {

    const nodeId = 'url/test';

    router.url = 'active/url/test';

    expect(component.getActiveLink(nodeId)).toBe(true);

  });

  it('should toggle sidebar', () => {

    const markSpy = spyOn(component[`cdr`], 'markForCheck');

    // TRUE
    component.toggleSidebar(true);

    expect(component.isSidebarClosed).toBe(true);
    expect(markSpy).toHaveBeenCalled();

    // FALSE
    component.toggleSidebar();

    expect(component.isSidebarClosed).toBe(false);

  });

  it('should navigate to link', () => {

    const id = 'test';
    const toggleSpy = spyOn(component, 'toggleSidebar');

    // innerWidth > 720
    component.navigateTolLink(id);

    expect(messageBus.emit).toHaveBeenCalledWith(`shop.navigate.${id}`, 'shop-001');
    expect(toggleSpy).not.toHaveBeenCalled();

    // innerWidth <= 720
    Object.defineProperty(window, 'innerWidth', { value: 720 });

    component.navigateTolLink(id);

    expect(toggleSpy).toHaveBeenCalledWith(true);

  });

  it('should init translations', () => {

    const warnSpy = spyOn(console, 'warn');
    const nextSpy = spyOn(component.translationsReady$, 'next');


    // w/o error
    translationLoaderService.loadTranslations.and.returnValue(of(true));

    component[`initTranslations`]();

    expect(warnSpy).not.toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalledWith(true);

    // w/ error
    translationLoaderService.loadTranslations.and.returnValue(throwError('test error'));

    component[`initTranslations`]();

    expect(warnSpy).toHaveBeenCalled();

  });

});
