import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';

import { AppThemeEnum, EnvService, MessageBus } from '@pe/common';

import { AbbreviationPipe } from '../../misc/pipes/abbreviation.pipe';
import { SiteEnvService } from '../../services/site-env.service';

import { SidebarAnimationProgress } from './sidebar.animation';
import { PebSiteComponent } from './site.component';

describe('PebSiteComponent', () => {

  let fixture: ComponentFixture<PebSiteComponent>;
  let component: PebSiteComponent;
  let router: any;
  let route: any;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let envService: jasmine.SpyObj<SiteEnvService>;

  beforeEach(async(() => {

    const routeMock = {
      snapshot: {
        data: {
          site: { id: 'site-001' },
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
      businessData: undefined,
      shopId: 'shop-001',
    };

    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
      ],
      declarations: [
        PebSiteComponent,
        AbbreviationPipe,
      ],
      providers: [
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: EnvService, useValue: envServiceMock },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebSiteComponent);
      component = fixture.componentInstance;

      router = TestBed.inject(Router);
      route = TestBed.inject(ActivatedRoute);
      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
      envService = TestBed.inject(SiteEnvService);

      router.events = of(null);
      router.url = '/test';

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

    component = new PebSiteComponent(
      router,
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

    component = new PebSiteComponent(
      router,
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

  it('should set site on init', () => {

    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const event = new NavigationEnd(1, 'test', '');

    router.events = of(event);

    // w/o children
    component.ngOnInit();

    expect(component.site).toEqual(route.snapshot.data.site);
    expect(detectSpy).toHaveBeenCalled();
    expect(messageBus.emit).toHaveBeenCalledWith('site.navigate.dashboard', envService.shopId);

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

    expect(messageBus.emit).toHaveBeenCalledWith(`site.navigate.${id}`, 'shop-001');
    expect(toggleSpy).not.toHaveBeenCalled();

    // innerWidth <= 720
    Object.defineProperty(window, 'innerWidth', { value: 720 });

    component.navigateTolLink(id);

    expect(toggleSpy).toHaveBeenCalledWith(true);

  });

});
