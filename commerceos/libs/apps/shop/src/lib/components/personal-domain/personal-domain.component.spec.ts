import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';

import { PebShopsApi } from '@pe/builder-api';
import { TranslatePipe } from '@pe/i18n';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeSettingsPersonalDomainComponent } from './personal-domain.component';

describe('PeSettingsPersonalDomainComponent', () => {

  let fixture: ComponentFixture<PeSettingsPersonalDomainComponent>;
  let component: PeSettingsPersonalDomainComponent;
  let api: jasmine.SpyObj<PebShopsApi>;
  let appData: any;
  let config: any;
  let overlay: jasmine.SpyObj<PeOverlayWidgetService>;
  let domainsList: any[];

  beforeEach(waitForAsync(() => {

    domainsList = ['domain-1', 'domain-2'];

    const apiSpy = jasmine.createSpyObj<PebShopsApi>('PebShopsApi', [
      'getAllDomains',
      'deleteDomain',
    ]);

    const appDataMock = {
      id: 'app',
      onSaved$: {
        next: jasmine.createSpy('next'),
      },
    };

    const overlaySpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', ['close']);

    TestBed.configureTestingModule({
      declarations: [
        PeSettingsPersonalDomainComponent,
        TranslatePipe,
      ],
      providers: [
        { provide: PebShopsApi, useValue: apiSpy },
        { provide: PE_OVERLAY_DATA, useValue: appDataMock },
        { provide: PE_OVERLAY_CONFIG, useValue: {} },
        { provide: PeOverlayWidgetService, useValue: overlaySpy },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeSettingsPersonalDomainComponent);
      component = fixture.componentInstance;

      api = TestBed.inject(PebShopsApi) as jasmine.SpyObj<PebShopsApi>;
      appData = TestBed.inject(PE_OVERLAY_DATA);
      config = TestBed.inject(PE_OVERLAY_CONFIG);
      overlay = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;

      api.getAllDomains.and.returnValue(of(domainsList));

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get all domains on init', () => {

    const markSpy = spyOn(component[`cdr`], 'markForCheck');

    component.ngOnInit();

    expect(api.getAllDomains).toHaveBeenCalledWith(appData.id);
    expect(component.domainList).toEqual(domainsList);
    expect(markSpy).toHaveBeenCalled();

  });

  it('should remove domain', () => {

    const markSpy = spyOn(component[`cdr`], 'markForCheck');
    const domain = { id: 'dom-001' };

    api.deleteDomain.and.returnValue(of({ deleted: true }));

    component.ngOnInit();
    component.removeDomain(domain, 0);

    expect(api.deleteDomain).toHaveBeenCalledWith(appData.id, domain.id);
    expect(component.domainList).toEqual(['domain-2']);
    expect(markSpy).toHaveBeenCalled();

  });

  it('should add domain', () => {

    component.addDomain();

    expect(overlay.close).toHaveBeenCalled();
    expect(appData.onSaved$.next).toHaveBeenCalledWith({ connectExisting: true });

  });

  it('should handle config done button callback', () => {

    config.doneBtnCallback();

    expect(overlay.close).toHaveBeenCalled();

  });

});
