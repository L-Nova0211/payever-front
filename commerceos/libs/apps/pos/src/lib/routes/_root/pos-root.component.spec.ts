import { NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { EMPTY, of, Subject, throwError } from 'rxjs';

import { EnvService, MessageBus, PeDestroyService, PE_ENV } from '@pe/common';
import { TranslationLoaderService } from '@pe/i18n';

import { PosEnvService } from '../../services/pos/pos-env.service';

import { PebPosComponent } from './pos-root.component';
import { SidebarAnimationProgress } from './sidebar.animation';

@Pipe({
  name: 'translate',
})
class TranslatePipeMock {

  transform() { }

}

@Pipe({
  name: 'abbreviation',
})
class AbbreviationPipeMock {

  transform() { }

}

describe('PebShopComponent', () => {

  let fixture: ComponentFixture<PebPosComponent>;
  let component: PebPosComponent;
  let translationLoaderService: jasmine.SpyObj<TranslationLoaderService>;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let envService: jasmine.SpyObj<PosEnvService>;
  let domSanitizer: jasmine.SpyObj<DomSanitizer>;
  let router: any;
  let route: any;

  beforeEach(waitForAsync(() => {

    const routerSpy = jasmine.createSpyObj<Router>('Router', ['parseUrl']);

    const translationLoaderServiceSpy = jasmine.createSpyObj<TranslationLoaderService>('TranslationLoaderService', {
      loadTranslations: of(true),
    });

    const routeMock = {
      snapshot: {
        data: {
          terminal: { _id: 'pos-001' },
        },
        children: [],
      },
    };

    const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', [
      'listen',
      'emit',
    ]);
    messageBusSpy.listen.and.returnValue(of(null));

    envService = {
      posId: 'pos-001',
      businessData: null,
    } as any;

    const destroyServiceMock = new Subject<void>();

    const envMock = {
      custom: { cdn: 'c-cdn' },
    };

    const domSanitizerSpy = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
      bypassSecurityTrustResourceUrl: 'bypassed.resource.url',
    });

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [
        PebPosComponent,
        TranslatePipeMock,
        AbbreviationPipeMock,
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: TranslationLoaderService, useValue: translationLoaderServiceSpy },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: EnvService, useValue: envService },
        { provide: PeDestroyService, useValue: destroyServiceMock },
        { provide: PE_ENV, useValue: envMock },
        { provide: DomSanitizer, useValue: domSanitizerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebPosComponent);
      component = fixture.componentInstance;

      router = TestBed.inject(Router);
      route = TestBed.inject(ActivatedRoute);
      translationLoaderService = TestBed.inject(TranslationLoaderService) as jasmine.SpyObj<TranslationLoaderService>;
      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
      envService = TestBed.inject(EnvService) as jasmine.SpyObj<PosEnvService>;
      domSanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;

      router.events = EMPTY;
      router.url = 'url/test';
      router.parseUrl.and.returnValue({
        root: {
          children: {
            primary: {
              segments: [],
            },
          },
        },
      } as any);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set theme on construct', () => {

    /**
     * envService.businessData is null
     */
    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings is null
     */
    envService.businessData = { themeSettings: null };

    fixture = TestBed.createComponent(PebPosComponent);
    component = fixture.componentInstance;

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings.theme is set
     */
    envService.businessData.themeSettings = { theme: 'light' };

    fixture = TestBed.createComponent(PebPosComponent);
    component = fixture.componentInstance;

    expect(component.theme).toEqual('light');

  });

  it('should set grid animation progress', () => {

    const nextSpy = spyOn(component[`gridAnimationProgressStream$`], 'next').and.callThrough();
    const value = SidebarAnimationProgress.Done

    component.gridAnimationProgress$.subscribe(progress => expect(progress).toEqual(value));
    component.gridAnimationProgress = value;

    expect(nextSpy).toHaveBeenCalledWith(value);

  });

  it('should get active link', () => {

    const urlTree = {
      root: {
        children: {
          primary: {
            segments: [
              { path: 'pos' },
              { path: 'node-001' },
            ],
          },
        },
      },
    };

    router.parseUrl.and.returnValue(urlTree as any);

    expect(component.getActiveLink('node')).toBe(false);
    expect(component.getActiveLink('node-001')).toBe(true);
    expect(router.parseUrl).toHaveBeenCalledWith(router.url);

  });

  it('should toggle sidebar', () => {

    const markSpy = spyOn(component[`cdr`], 'markForCheck');

    /**
     * argument toggle is TRUE
     */
    component.toggleSidebar(true);

    expect(component.isSidebarClosed).toBe(true);
    expect(markSpy).toHaveBeenCalled();

    /**
     * argument toggle is undefined as default
     */
    component.toggleSidebar();

    expect(component.isSidebarClosed).toBe(false);

  });

  it('should navigate to link', () => {

    const id = 'test';
    const toggleSpy = spyOn(component, 'toggleSidebar');

    spyOnProperty(window, 'innerWidth').and.returnValues(1000, 500);

    /**
     * window.innerWidth is 1000 (> 720)
     */
    component.navigateTolLink(id);

    expect(messageBus.emit).toHaveBeenCalledWith(`pos.navigate.${id}`, envService.posId);
    expect(toggleSpy).not.toHaveBeenCalled();

    /**
     * window.innerWidth is 500 (<= 720)
     */
    component.navigateTolLink(id);

    expect(toggleSpy).toHaveBeenCalledWith(true);

  });

  it('should handle ng init', () => {

    const initSpy = spyOn<any>(component, 'initTranslations');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const event = new NavigationEnd(13, 'test', '');

    router.events = of(event);

    // w/o children
    component.ngOnInit();

    expect(component.terminal).toEqual({ _id: envService.posId });
    expect(detectSpy).toHaveBeenCalled();
    expect(messageBus.emit).toHaveBeenCalledWith('pos.navigate.dashboard', envService.posId);
    expect(initSpy).toHaveBeenCalled();

    // w/ children
    messageBus.emit.calls.reset();

    route.snapshot.children = [{ test: true }];

    component.ngOnInit();

    expect(messageBus.emit).not.toHaveBeenCalled();

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

  it('should create tree', () => {

    const cdnIconSpy = spyOn<any>(component, 'getCDNIcon').and.callFake((key: string) => key);

    const tree = component[`createTree`]();
    expect(tree).toEqual([
      {
        id: 'connect',
        name: 'pos-app.navigation.connect',
        image: 'app-icon-connect.svg',
      },
      {
        id: 'settings',
        name: 'pos-app.navigation.settings',
        image: 'app-icon-settings.svg',
      },
    ]);
    tree.forEach(i => expect(cdnIconSpy).toHaveBeenCalledWith(i.image));

  });

  it('should get cdn icon', () => {

    expect(component[`getCDNIcon`]('test-icon.svg')).toEqual('bypassed.resource.url');
    expect(domSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('c-cdn/icons/test-icon.svg');

  });

});
