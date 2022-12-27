import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PebSitesApi } from '../../services/site/abstract.sites.api';

import { PeSettingsPasswordProtectionComponent } from './password-protection.component';

describe('PeSettingsPasswordProtectionComponent', () => {

  let fixture: ComponentFixture<PeSettingsPasswordProtectionComponent>;
  let component: PeSettingsPasswordProtectionComponent;
  let appData: any;
  let config: any;
  let overlay: jasmine.SpyObj<PeOverlayWidgetService>;
  let api: jasmine.SpyObj<PebSitesApi>;

  beforeEach(async(() => {

    const appDataMock = {
      id: 'app',
      onSaved$: {
        next: jasmine.createSpy('next'),
      },
      accessConfig: undefined,
    };

    const overlaySpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', ['close']);

    const apiSpy = jasmine.createSpyObj<PebSitesApi>('PebSitesApi', ['updateSiteAccessConfig']);

    TestBed.configureTestingModule({
      declarations: [
        PeSettingsPasswordProtectionComponent,
      ],
      providers: [
        FormBuilder,
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: PE_OVERLAY_DATA, useValue: appDataMock },
        { provide: PE_OVERLAY_CONFIG, useValue: {} },
        { provide: PeOverlayWidgetService, useValue: overlaySpy },
        { provide: PebSitesApi, useValue: apiSpy },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeSettingsPasswordProtectionComponent);
      component = fixture.componentInstance;

      appData = TestBed.inject(PE_OVERLAY_DATA);
      config = TestBed.inject(PE_OVERLAY_CONFIG);
      overlay = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;
      api = TestBed.inject(PebSitesApi) as jasmine.SpyObj<PebSitesApi>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should create form on init', () => {

    // w/o site deploy
    component.ngOnInit();

    expect(component.form.value).toEqual({
      privatePassword: '',
      privateMessage: null,
      isPrivate: null,
    });

    // w/ site deploy
    appData.accessConfig = {
      privateMessage: 'private.message',
      isPrivate: true,
    };

    component.siteDeploy = appData.accessConfig;
    component.ngOnInit();

    expect(component.form.value).toEqual({
      privatePassword: '',
      privateMessage: appData.accessConfig.privateMessage,
      isPrivate: appData.accessConfig.isPrivate,
    });

    // isPrivate changes
    // FALSE
    const spies = {
      set: spyOn(component.form.controls.privatePassword, 'setValidators').and.callThrough(),
      clear: spyOn(component.form.controls.privatePassword, 'clearValidators').and.callThrough(),
      update: spyOn(component.form.controls.privatePassword, 'updateValueAndValidity').and.callThrough(),
    };

    component.form.patchValue({
      isPrivate: false,
    });

    expect(spies.set).not.toHaveBeenCalled();
    expect(spies.clear).toHaveBeenCalled();
    expect(spies.update).toHaveBeenCalled();

    // TRUE
    spies.clear.calls.reset();
    spies.update.calls.reset();

    component.form.patchValue({
      isPrivate: true,
    });

    expect(spies.set).toHaveBeenCalled();
    expect(spies.clear).not.toHaveBeenCalled();
    expect(spies.update).toHaveBeenCalled();

  });

  it('should handle submit', () => {

    const markSpy = spyOn(component[`cdr`], 'markForCheck');

    api.updateSiteAccessConfig.and.returnValue(of({ updated: true }) as any);

    component.ngOnInit();

    // form.untouched = TRUE
    // form.invalid = TRUE
    // has required error = FALSE
    component.form.patchValue({
      privatePassword: null,
    });

    config.doneBtnCallback();

    expect(overlay.close).toHaveBeenCalled();
    expect(markSpy).toHaveBeenCalled();
    expect(component.form.disabled).toBe(false);
    expect(component.loading).toBeUndefined();
    expect(api.updateSiteAccessConfig).not.toHaveBeenCalled();
    expect(component.errorMessage).toBeUndefined();

    // has required error = TRUE
    component.form.controls.privatePassword.setErrors({
      required: true,
    });

    config.doneBtnCallback();

    expect(component.errorMessage).toEqual('Password is required');

    // form.untouched = FALSE
    // form.invalid = FALSE
    // isPrivate = FALSE
    markSpy.calls.reset();

    component.form.markAsTouched();
    component.form.controls.privatePassword.setErrors(null);
    component.form.patchValue({
      privatePassword: 'private.password',
      isPrivate: false,
    });

    config.doneBtnCallback();

    expect(component.form.disabled).toBe(true);
    expect(component.loading).toBe(true);
    expect(api.updateSiteAccessConfig).toHaveBeenCalledWith(appData.id, {
      isPrivate: false,
      privateMessage: null,
    } as any);
    expect(appData.onSaved$.next).toHaveBeenCalledWith({ updateShopList: true });
    expect(overlay.close).toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();

    // w/ error
    // isPrivate = TRUE
    // statusCode = 400
    api.updateSiteAccessConfig.and.returnValue(throwError({
      error: {
        statusCode: 400,
        errors: ['test error'],
      },
    }));

    component.form.patchValue({
      isPrivate: true,
    });

    config.doneBtnCallback();

    expect(api.updateSiteAccessConfig).toHaveBeenCalledWith(appData.id, {
      isPrivate: true,
      privateMessage: null,
      privatePassword: 'private.password',
    } as any);
    expect(component.errorMessage).toEqual('test error');
    expect(markSpy).toHaveBeenCalled();
    expect(component.form.enabled).toBe(true);

    // statusCode != 400
    markSpy.calls.reset();

    component.errorMessage = null;

    api.updateSiteAccessConfig.and.returnValue(throwError({
      error: {
        statusCode: 404,
        errors: ['404 error'],
      },
    }));

    config.doneBtnCallback();

    expect(component.errorMessage).toBeNull();
    expect(markSpy).not.toHaveBeenCalled();
    expect(component.form.disabled).toBe(true);

  });

});
