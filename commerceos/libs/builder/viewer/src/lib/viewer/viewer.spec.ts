import { Location } from '@angular/common';
import { PLATFORM_ID, SimpleChange } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import * as pebCore from '@pe/builder-core';
import {
  PebElementType,
  PebInteractionType,
  PebLanguage,
  PebScreen,
} from '@pe/builder-core';
import * as pebRenderer from '@pe/builder-renderer';
import { PebRenderer } from '@pe/builder-renderer';
import { of } from 'rxjs';
import { isEmpty, take } from 'rxjs/operators';
import { ContextBuilder } from '../services/context.service';
import { SCREEN_FROM_WIDTH } from '../viewer.constants';
import * as utils from '../viewer.utils';
import { PebViewer, ViewerLocationStrategy } from './viewer';

describe('PebViewer', () => {

  let fixture: ComponentFixture<PebViewer>;
  let component: PebViewer;
  let location: jasmine.SpyObj<Location>;
  let contextBuilder: jasmine.SpyObj<ContextBuilder>;
  let screenFromWidthSpy: jasmine.Spy;
  let renderer: jasmine.SpyObj<PebRenderer>;

  const ctxBuilderState: any = { test: 'context.builder.state' };

  beforeAll(() => {

    Object.defineProperty(pebRenderer, 'fromResizeObserver', {
      value: pebRenderer.fromResizeObserver,
      writable: true,
    });

    Object.defineProperty(utils, 'getThemePageByLocation', {
      value: utils.getThemePageByLocation,
      writable: true,
    });

    Object.defineProperty(pebCore, 'applyRecursive', {
      value: pebCore.applyRecursive,
      writable: true,
    });

  });

  beforeEach(waitForAsync(() => {

    screenFromWidthSpy = jasmine.createSpy('screenFromWidth').and.returnValue(PebScreen.Desktop);

    renderer = jasmine.createSpyObj<PebRenderer>('PebRenderer', {
      applyBuildOutAnimation: of(null),
    });

    const contextBuilderSpy = jasmine.createSpyObj<ContextBuilder>('ContextBuilder', ['buildSchema'], {
      state$: of(ctxBuilderState),
    });

    const locationSpy = jasmine.createSpyObj<Location>('Location', ['go', 'onUrlChange']);

    TestBed.configureTestingModule({
      declarations: [PebViewer],
      providers: [
        { provide: SCREEN_FROM_WIDTH, useValue: screenFromWidthSpy },
        { provide: ContextBuilder, useValue: contextBuilderSpy },
        { provide: Location, useValue: locationSpy },
        { provide: ActivatedRoute, useValue: {} },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    }).overrideComponent(PebViewer, {
      set: { providers: [] },
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebViewer);
      component = fixture.componentInstance;
      component.renderer = renderer;

      contextBuilder = TestBed.inject(ContextBuilder) as jasmine.SpyObj<ContextBuilder>;
      location = TestBed.inject(Location) as jasmine.SpyObj<Location>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set locale', () => {

    const nextSpy = spyOn(component.locale$, 'next');

    component.locale = PebLanguage.German;

    expect(nextSpy).toHaveBeenCalledWith(PebLanguage.German);

  });

  it('should set screen$ on construct', fakeAsync(() => {

    const fromResizeSpy = spyOn(pebRenderer, 'fromResizeObserver');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');

    /**
     * component.screen is null
     * component.hostWidth is 1920
     */
    fromResizeSpy.and.returnValue(of({
      width: 1920,
      height: 700,
    }));

    component.screen = null;
    component.screen$.subscribe();
    component.viewInit$.next();

    expect(fromResizeSpy).toHaveBeenCalledWith(fixture.nativeElement);
    expect(component.hostWidth).toBe(1920);
    expect(component.scale).toBe(1);
    expect(screenFromWidthSpy).toHaveBeenCalledWith(1920);
    expect(detectSpy).not.toHaveBeenCalled();

    tick(100);

    expect(detectSpy).toHaveBeenCalled();

    /**
     * component.screen is PebScreen.Tablet
     * component.hostWidth is 384
     */
    fromResizeSpy.and.returnValue(of({
      width: 384,
      height: 700,
    }));

    component.screen = PebScreen.Tablet;
    component.viewInit$.next();

    tick(100);

    expect(component.hostWidth).toBe(384);
    expect(component.scale).toBe(0.5);
    expect(screenFromWidthSpy).toHaveBeenCalledWith(384);

  }));

  it('should set location$ on construct', () => {

    location.onUrlChange.and.callFake((callback) => { callback(null, null) });
    window.location.hash = 'test';

    /**
     * component.platformId is 'server'
     */
    component.location$.pipe(take(1)).subscribe(res => expect(res).toEqual(''));

    /**
     * component.platformId is 'browser'
     */
    component[`platformId`] = 'browser';
    component.location$.pipe(take(1)).subscribe(res => expect(res).toEqual('test'));

  });

  it('should set pageSnapshot$ on construct', () => {

    const theme = {
      data: null,
      application: null,
      routing: [{
        routeId: 'r-001',
        pageId: 'p-001',
        url: 'pages/p-001',
      }],
      context: { test: 'theme.ctx' },
    };
    const page = {
      id: 'p-001',
      template: {
        id: 'tpl-001',
        type: PebElementType.Document,
        children: [{
          id: 'child-001',
          type: PebElementType.Shape,
        }],
      },
      stylesheets: {
        [PebScreen.Tablet]: { 'tpl-001': { backgroundColor: '#454545' } },
      },
      context: { test: 'page.ctx' },
    };
    const themeSchema: any = { testTheme: 'theme.schema' };
    const pageSchema: any = { testPage: 'page.schema' };
    const getThemeByLocationSpy = spyOn(utils, 'getThemePageByLocation').and.returnValue(null);
    const applySpy = spyOn(pebCore, 'applyRecursive').and.callFake((_, children) => children);
    const nextSpies = {
      locale: spyOn(component.locale$, 'next'),
      defaultLocale: spyOn(component.defaultLocale$, 'next'),
    };

    contextBuilder.buildSchema.and.returnValues(
      of(pageSchema),
      of(themeSchema),
    );

    /**
     * theme.data & application are null
     * component.platformId is 'browser'
     * component.hostWidth is 1920
     * component.location$ is of(null)
     * component.screen is null
     * getThemePageByLocation returns null
     */
    component[`platformId`] = 'browser';
    component.hostWidth = 1920;
    component.scale = null;
    component.theme$.next(theme);
    component[`location$` as any] = of(null);
    component.pageSnapshot$.pipe(isEmpty()).subscribe(empty => expect(empty).toBe(true)).unsubscribe();

    expect(nextSpies.locale).toHaveBeenCalledWith(PebLanguage.English);
    expect(nextSpies.defaultLocale).toHaveBeenCalledWith(PebLanguage.English);
    expect(getThemeByLocationSpy).toHaveBeenCalledWith(theme as any, '/');
    expect(location.go).toHaveBeenCalledOnceWith('/');
    expect(contextBuilder.buildSchema).not.toHaveBeenCalled();
    expect(applySpy).not.toHaveBeenCalled();
    expect(component.scale).toBeNull();

    /**
     * theme.application.data is null
     */
    theme.application = { data: null };
    nextSpies.locale.calls.reset();
    nextSpies.defaultLocale.calls.reset();

    component.theme$.next(theme);
    component.pageSnapshot$.pipe(isEmpty()).subscribe(empty => expect(empty).toBe(true)).unsubscribe();

    expect(nextSpies.locale).toHaveBeenCalledWith(PebLanguage.English);
    expect(nextSpies.defaultLocale).toHaveBeenCalledWith(PebLanguage.English);
    expect(contextBuilder.buildSchema).not.toHaveBeenCalled();
    expect(applySpy).not.toHaveBeenCalled();
    expect(component.scale).toBeNull();

    /**
     * theme.application.data.defaultLanguage is set
     */
    theme.application = {
      data: {
        defaultLanguage: PebLanguage.Chinese,
      },
    };
    nextSpies.locale.calls.reset();
    nextSpies.defaultLocale.calls.reset();

    component.theme$.next(theme);
    component.pageSnapshot$.pipe(isEmpty()).subscribe(empty => expect(empty).toBe(true)).unsubscribe();

    expect(nextSpies.locale).toHaveBeenCalledWith(PebLanguage.Chinese);
    expect(nextSpies.defaultLocale).toHaveBeenCalledWith(PebLanguage.Chinese);
    expect(contextBuilder.buildSchema).not.toHaveBeenCalled();
    expect(applySpy).not.toHaveBeenCalled();
    expect(component.scale).toBeNull();

    /**
     * theme.data.defaultLanguage is set
     */
    theme.data = { defaultLanguage: PebLanguage.Italian };
    nextSpies.locale.calls.reset();
    nextSpies.defaultLocale.calls.reset();

    component.theme$.next(theme);
    component.pageSnapshot$.pipe(isEmpty()).subscribe(empty => expect(empty).toBe(true)).unsubscribe();

    expect(nextSpies.locale).toHaveBeenCalledWith(PebLanguage.Italian);
    expect(nextSpies.defaultLocale).toHaveBeenCalledWith(PebLanguage.Italian);
    expect(contextBuilder.buildSchema).not.toHaveBeenCalled();
    expect(applySpy).not.toHaveBeenCalled();
    expect(component.scale).toBeNull();

    /**
     * component.location$ is of('pages/p-001');
     * getThemeByLocation returns mocked data
     */
    getThemeByLocationSpy.and.returnValue(page as any);
    getThemeByLocationSpy.calls.reset();
    location.go.calls.reset();

    component[`location$` as any] = of('pages/p-001');
    component[`screen$` as any] = of(PebScreen.Desktop);
    component.theme$.next(theme);
    component.pageSnapshot$.subscribe(snap => expect(snap).toEqual({
      screen: PebScreen.Desktop,
      template: page.template,
      stylesheet: {},
      context: {
        ...ctxBuilderState,
        ...themeSchema,
        ...pageSchema,
      },
    } as any)).unsubscribe();

    expect(location.go).toHaveBeenCalledWith('pages/p-001');
    expect(contextBuilder.buildSchema.calls.allArgs()).toEqual([
      [page.context],
      [theme.context],
    ] as any[]);
    expect(applySpy).toHaveBeenCalledWith(page as any, page.template.children);
    expect(component.scale).toBe(1);

    /**
     * component.screen is PebScreen.Tablet
     * component.hostWidth is 384
     */
    component.screen = PebScreen.Tablet;
    component.hostWidth = 384;
    component.theme$.next(theme);
    component.pageSnapshot$
      .subscribe(snap => expect(snap.stylesheet).toEqual(page.stylesheets[PebScreen.Tablet]))
      .unsubscribe();

    expect(component.scale).toBe(0.5);

  });

  it('should handle ng changes', () => {

    const nextSpy = spyOn(component.theme$, 'next');
    const pages = [{ id: 'p-001' }];
    const snapshot = {
      application: {
        data: { test: 'app.data' },
        routing: [{
          routeId: 'r-001',
          pageId: 'p-001',
          url: 'pages/p-001',
        }],
        context: { test: 'app.ctx' },
      },
    };

    /**
     * component.themeSnapshot & themeCompiled are both set
     */
    component.themeSnapshot = { snapshot, pages } as any;
    component.themeCompiled = { test: 'theme.compiled' } as any;

    expect(() => {
      component.ngOnChanges(null);
    }).toThrowError('Viewer accepts either snapshot or compiled theme. You should not provide both');
    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * component.themeCompiled is null
     * argument changes is {} (empty object)
     */
    component.themeCompiled = null;
    component.ngOnChanges({});

    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * changes.screen is set
     */
    component.ngOnChanges({ screen: new SimpleChange(null, PebScreen.Desktop, true) });

    expect(nextSpy).toHaveBeenCalledWith({
      pages,
      ...snapshot.application,
    });

  });

  it('should handle ng after view init', () => {

    const nextSpy = spyOn(component.viewInit$, 'next');
    const markSpy = spyOn(component[`cdr`], 'markForCheck');

    component.ngAfterViewInit();

    expect(nextSpy).toHaveBeenCalled();
    expect(markSpy).toHaveBeenCalled();

  });

  it('should handle renderer interaction', () => {

    const nextSpy = spyOn(component.locale$, 'next');
    const emitSpy = spyOn(component.interacted, 'emit');
    const event = {
      type: PebInteractionType.CartClick,
      payload: null,
      path: null,
    };

    /**
     * event.type is PebInteractionType.CartClick
     */
    component.onRendererInteraction(event);

    expect(nextSpy).not.toHaveBeenCalled();
    expect(renderer.applyBuildOutAnimation).not.toHaveBeenCalled();
    expect(location.go).not.toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(event);

    /**
     * event.type is PebInteractionType.ChangeLanguage
     */
    event.type = PebInteractionType.ChangeLanguage;
    event.payload = PebLanguage.Chinese;
    emitSpy.calls.reset();

    component.onRendererInteraction(event);

    expect(nextSpy).toHaveBeenCalledWith(event.payload);
    expect(renderer.applyBuildOutAnimation).not.toHaveBeenCalled();
    expect(location.go).not.toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(event);

    /**
     * event.type is PebInteractionType.NavigateInternal
     */
    event.type = PebInteractionType.NavigateInternal;
    event.path = 'test/path';
    emitSpy.calls.reset();
    nextSpy.calls.reset();

    component.onRendererInteraction(event);

    expect(nextSpy).not.toHaveBeenCalled();
    expect(renderer.applyBuildOutAnimation).toHaveBeenCalled();
    expect(location.go).toHaveBeenCalledWith(event.path);
    expect(emitSpy).not.toHaveBeenCalled();

  });

});

describe('ViewerLocationStrategy', () => {

  const platformLocation = {
    location: {
      pathname: '/test/path',
    },
  };
  const strategy = new ViewerLocationStrategy(platformLocation as any);

  it('should be defined', () => {

    expect(strategy).toBeDefined();

  });

  it('should prepare external url', () => {

    const internal = 'internal-for-test';

    expect(strategy.prepareExternalUrl(internal)).toEqual(`${platformLocation.location.pathname}#${internal}`);

  });

});
