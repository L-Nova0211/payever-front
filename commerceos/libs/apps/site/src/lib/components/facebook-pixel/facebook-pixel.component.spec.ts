import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeSettingsFacebookPixelComponent } from './facebook-pixel.component';

describe('PeSettingsFacebookPixelComponent', () => {

  let fixture: ComponentFixture<PeSettingsFacebookPixelComponent>;
  let component: PeSettingsFacebookPixelComponent;
  let config: any;
  let overlay: jasmine.SpyObj<PeOverlayWidgetService>;

  beforeEach(async(() => {

    const overlaSpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', ['close']);

    TestBed.configureTestingModule({
      declarations: [
        PeSettingsFacebookPixelComponent,
      ],
      providers: [
        { provide: PE_OVERLAY_DATA, useValue: {} },
        { provide: PE_OVERLAY_CONFIG, useValue: {} },
        { provide: PeOverlayWidgetService, useValue: overlaSpy },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeSettingsFacebookPixelComponent);
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
