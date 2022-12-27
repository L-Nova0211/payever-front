import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeSettingsSpamProtectionComponent } from './spam-protection.component';

describe('PeSettingsSpamProtectionComponent', () => {

  let fixture: ComponentFixture<PeSettingsSpamProtectionComponent>;
  let component: PeSettingsSpamProtectionComponent;
  let config: any;
  let overlay: jasmine.SpyObj<PeOverlayWidgetService>;

  beforeEach(waitForAsync(() => {

    const overlaSpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', ['close']);

    TestBed.configureTestingModule({
      declarations: [
        PeSettingsSpamProtectionComponent,
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

      fixture = TestBed.createComponent(PeSettingsSpamProtectionComponent);
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
