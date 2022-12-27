import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeSettingsGoogleAnalyticsComponent } from './google-analytics.component';

describe('PeSettingsGoogleAnalyticsComponent', () => {

  let fixture: ComponentFixture<PeSettingsGoogleAnalyticsComponent>;
  let component: PeSettingsGoogleAnalyticsComponent;
  let config: any;
  let overlay: jasmine.SpyObj<PeOverlayWidgetService>;

  beforeEach(async(() => {

    const overlaSpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', ['close']);

    TestBed.configureTestingModule({
      declarations: [
        PeSettingsGoogleAnalyticsComponent,
      ],
      providers: [
        { provide: PE_OVERLAY_DATA, useValue: {} },
        { provide: PE_OVERLAY_CONFIG, useValue: {} },
        { provide: PeOverlayWidgetService, useValue: overlaSpy },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeSettingsGoogleAnalyticsComponent);
      component = fixture.componentInstance;

      config = TestBed.inject(PE_OVERLAY_CONFIG);
      overlay = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set config on construct', () => {

    config.doneBtnCallback();

    expect(config.doneBtnTitle).toEqual('Save');
    expect(overlay.close).toHaveBeenCalled();

  });

});
