import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { MessageBus, PebEnvService } from '@pe/builder-core';
import { AppThemeEnum } from '@pe/common';

import { PebBlogThemesComponent } from './blog-themes.component';

describe('PebShopThemesComponent', () => {

  let fixture: ComponentFixture<PebBlogThemesComponent>;
  let component: PebBlogThemesComponent;
  let route: any;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let envService: jasmine.SpyObj<PebEnvService>;

  beforeEach(async(() => {

    const routeMock = {
      snapshot: {
        params: {
          blogId: 'shop-001',
        },
      },
    };

    const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', ['emit']);

    const envServiceMock = {
      businessData: undefined,
    };

    TestBed.configureTestingModule({
      declarations: [
        PebBlogThemesComponent,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: PebEnvService, useValue: envServiceMock },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebBlogThemesComponent);
      component = fixture.componentInstance;

      route = TestBed.inject(ActivatedRoute);
      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
      envService = TestBed.inject(PebEnvService);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    // w/o businessData
    expect(component).toBeDefined();
    expect(component.theme).toEqual(AppThemeEnum.default);

    // w/o businessData.themeSettings
    envService.businessData = {
      themeSettings: undefined,
    } as any;

    component = new PebBlogThemesComponent(
      route,
      messageBus,
      envService,
    );

    expect(component.theme).toEqual(AppThemeEnum.default);

    // w/ themeSettings
    envService.businessData.themeSettings = {
      theme: AppThemeEnum.light,
    };

    component = new PebBlogThemesComponent(
      route,
      messageBus,
      envService,
    );

    expect(component.theme).toEqual(AppThemeEnum.light);

  });

  it('should handle theme installed', () => {

    component.onThemeInstalled();

    expect(messageBus.emit).toHaveBeenCalledWith('shop.navigate.edit', 'shop-001');

  });

});
