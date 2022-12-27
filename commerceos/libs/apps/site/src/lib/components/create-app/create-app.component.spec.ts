import { HttpEventType } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { PebEditorApi } from '@pe/builder-api';
import { EnvService } from '@pe/common';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { AbbreviationPipe } from '../../misc/pipes/abbreviation.pipe';
import { SiteEnvService } from '../../services/site-env.service';
import { PebSitesApi } from '../../services/site/abstract.sites.api';

import { PeSettingsCreateAppComponent } from './create-app.component';

describe('PeSettingsCreateAppComponent', () => {

  let fixture: ComponentFixture<PeSettingsCreateAppComponent>;
  let component: PeSettingsCreateAppComponent;
  let api: jasmine.SpyObj<PebSitesApi>;
  let appData: any;
  let config: any;
  let overlay: jasmine.SpyObj<PeOverlayWidgetService>;
  let envService: jasmine.SpyObj<SiteEnvService>;
  let editorApi: jasmine.SpyObj<PebEditorApi>;

  beforeEach(async(() => {

    const apiSpy = jasmine.createSpyObj<PebSitesApi>('PebSitesApi', [
      'markSiteAsDefault',
      'updateSite',
      'createSite',
      'validateSiteName',
      'deleteSite',
    ]);

    const appDataMock = {
      id: 'app',
      name: 'App',
      picture: 'pic.jpg',
      isDefault: true,
      onSaved$: {
        next: jasmine.createSpy('next'),
      },
    };

    const configMock = {
      title: undefined,
      doneBtnTitle: undefined,
      doneBtnCallback: undefined,
    };

    const overlaySpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', ['close']);

    const envServiceMock = {
      shopId: 'site-001',
    };

    const editorApiSpy = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', ['uploadImageWithProgress']);

    TestBed.configureTestingModule({
      declarations: [
        PeSettingsCreateAppComponent,
        AbbreviationPipe,
      ],
      providers: [
        { provide: PebSitesApi, useValue: apiSpy },
        { provide: PE_OVERLAY_DATA, useValue: appDataMock },
        { provide: PE_OVERLAY_CONFIG, useValue: configMock },
        { provide: PeOverlayWidgetService, useValue: overlaySpy },
        { provide: EnvService, useValue: envServiceMock },
        { provide: PebEditorApi, useValue: editorApiSpy },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeSettingsCreateAppComponent);
      component = fixture.componentInstance;

      api = TestBed.inject(PebSitesApi) as jasmine.SpyObj<PebSitesApi>;
      appData = TestBed.inject(PE_OVERLAY_DATA);
      config = TestBed.inject(PE_OVERLAY_CONFIG);
      overlay = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;
      envService = TestBed.inject(EnvService);
      editorApi = TestBed.inject(PebEditorApi) as jasmine.SpyObj<PebEditorApi>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set config on construct - appData.id is defined', () => {

    const openDashboardSpy = spyOn(component, 'openDashboard').and.callThrough();
    const markSpy = spyOn(component[`cdr`], 'markForCheck');
    const error = {
      error: {
        errors: 'test error',
      },
    };

    api.markSiteAsDefault.and.callFake(() => {
      appData.isDefault = true;

      return of(appData);
    });
    api.updateSite.and.returnValue(of(appData));

    expect(config.doneBtnTitle).toEqual('Open');
    expect(config.title).toEqual(appData.name);
    expect(component.siteConfig.siteName).toEqual(appData.name);
    expect(component.siteConfig.siteImage).toEqual(appData.picture);
    expect(component.siteId).toEqual(appData.id);

    // siteConfig.siteName = appData.name
    // siteConfig.siteImage = appData.picture
    // w/o errorMsg
    // appData.isDefault = TRUE
    config.doneBtnCallback();

    expect(openDashboardSpy).toHaveBeenCalledWith(appData);
    expect(appData.onSaved$.next).toHaveBeenCalledWith({ openSite: true, site: appData });
    expect(overlay.close).toHaveBeenCalled();
    expect(envService.shopId).toEqual(appData.id);
    expect(api.markSiteAsDefault).not.toHaveBeenCalled();
    expect(api.updateSite).not.toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();

    // appData.isDefault = FALSE
    openDashboardSpy.calls.reset();

    appData.isDefault = false;

    config.doneBtnCallback();

    expect(api.markSiteAsDefault).toHaveBeenCalled();
    expect(openDashboardSpy).toHaveBeenCalledWith(appData);
    expect(api.updateSite).not.toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();

    // siteConfig.siteName != appData.name
    // siteConfig.siteImage != appData.picture
    // appData.isDefault = TRUE
    openDashboardSpy.calls.reset();
    api.markSiteAsDefault.calls.reset();

    appData.name = 'new app';
    appData.picture = 'new picture';
    appData.isDefault = true;

    config.doneBtnCallback();

    expect(api.updateSite).toHaveBeenCalledWith(appData.id, {
      name: component.siteConfig.siteName,
      picture: component.siteConfig.siteImage,
    });
    expect(openDashboardSpy).toHaveBeenCalledWith(appData);
    expect(api.markSiteAsDefault).not.toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();

    // appData.isDefault = FALSE
    api.updateSite.calls.reset();
    openDashboardSpy.calls.reset();

    appData.isDefault = false;

    config.doneBtnCallback();

    expect(api.updateSite).toHaveBeenCalledWith(appData.id, {
      name: component.siteConfig.siteName,
      picture: component.siteConfig.siteImage,
    });
    expect(api.markSiteAsDefault).toHaveBeenCalled();
    expect(openDashboardSpy).toHaveBeenCalledWith(appData);
    expect(markSpy).not.toHaveBeenCalled();

    // w/ error
    api.updateSite.calls.reset();
    api.updateSite.and.returnValue(throwError(error));
    api.markSiteAsDefault.calls.reset();
    openDashboardSpy.calls.reset();

    appData.isDefault = false;

    config.doneBtnCallback();

    expect(api.updateSite).toHaveBeenCalledWith(appData.id, {
      name: component.siteConfig.siteName,
      picture: component.siteConfig.siteImage,
    });
    expect(api.markSiteAsDefault).not.toHaveBeenCalled();
    expect(openDashboardSpy).not.toHaveBeenCalled();
    expect(component.errorMsg).toEqual(error.error.errors);
    expect(markSpy).toHaveBeenCalled();

    // w/ errorMsg
    api.updateSite.calls.reset();
    api.markSiteAsDefault.calls.reset();
    openDashboardSpy.calls.reset();
    markSpy.calls.reset();

    config.doneBtnCallback();

    expect(api.updateSite).not.toHaveBeenCalled();
    expect(api.markSiteAsDefault).not.toHaveBeenCalled();
    expect(openDashboardSpy).not.toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();

  });

  it('should set config on construct - appData.id is NOT defined', () => {

    api.markSiteAsDefault.and.callFake(() => {
      appData.isDefault = true;

      return of(appData);
    });
    api.createSite.and.returnValue(of({ ...appData, id: 'created app' }));

    appData.id = undefined;
    appData.picture = undefined;

    component = new PeSettingsCreateAppComponent(
      api,
      appData,
      config,
      overlay,
      envService,
      null,
      editorApi,
    );

    const openDashboardSpy = spyOn(component, 'openDashboard').and.callThrough();

    expect(config.doneBtnTitle).toEqual('Create');

    // w/o siteImage
    // w/o errorMsg
    config.doneBtnCallback();

    expect(api.createSite).toHaveBeenCalledWith({
      name: component.siteConfig.siteName,
    });
    expect(appData.id).toEqual('created app');
    expect(api.markSiteAsDefault).toHaveBeenCalledWith(appData.id)
    expect(openDashboardSpy).toHaveBeenCalledWith(appData);
    expect(envService.shopId).toEqual(appData.id);
    expect(appData.onSaved$.next).toHaveBeenCalledWith({ openSite: true, site: appData });
    expect(overlay.close).toHaveBeenCalled();

    // w/ siteImage
    api.createSite.calls.reset();

    component.siteConfig.siteImage = 'pic.jpg';

    config.doneBtnCallback();

    expect(api.createSite).toHaveBeenCalledWith({
      name: component.siteConfig.siteName,
      picture: component.siteConfig.siteImage,
    });

    // w/ errorMsg
    api.createSite.calls.reset();
    api.markSiteAsDefault.calls.reset();
    openDashboardSpy.calls.reset();

    component.errorMsg = 'test error';

    config.doneBtnCallback();

    expect(api.createSite).not.toHaveBeenCalled();
    expect(api.markSiteAsDefault).not.toHaveBeenCalled();
    expect(openDashboardSpy).not.toHaveBeenCalled();

  });

  it('should validate shop', () => {

    const validateNameSpy = spyOn(component, 'validateName').and.callThrough();
    const markSpy = spyOn(component[`cdr`], 'markForCheck');
    let name = 'te';

    // INVALID name - length < 3
    component.validateSite(name);

    expect(component.siteConfig.siteName).toEqual(name);
    expect(validateNameSpy).toHaveBeenCalledWith(name);
    expect(component.errorMsg).toEqual('Name should have at least 3 characters');
    expect(markSpy).toHaveBeenCalled();
    expect(api.validateSiteName).not.toHaveBeenCalled();

    // INVALID name
    name = '!test';
    component.validateSite(name);

    expect(component.siteConfig.siteName).toEqual(name);
    expect(component.errorMsg).toEqual('Name is not correct');
    expect(markSpy).toHaveBeenCalledTimes(2);
    expect(api.validateSiteName).not.toHaveBeenCalled();

    // VALID name through regex
    // w/o message
    name = 'test';

    api.validateSiteName.and.returnValue(of({ message: undefined }));

    component.errorMsg = undefined;
    component.validateSite(name);

    expect(component.errorMsg).toBeNull();
    expect(markSpy).toHaveBeenCalledTimes(3);

    // w/ message
    api.validateSiteName.and.returnValue(of({ message: 'test error' }));

    component.validateSite(name);

    expect(component.errorMsg).toEqual('test error');
    expect(markSpy).toHaveBeenCalledTimes(4);

  });

  it('should remove shop', () => {

    api.deleteSite.and.returnValue(of({ deleted: true }) as any);

    component.removeSite();

    expect(api.deleteSite).toHaveBeenCalledWith(appData.id);
    expect(appData.onSaved$.next).toHaveBeenCalledWith({ updateSiteList: true });
    expect(overlay.close).toHaveBeenCalled();

  });

  it('should handle logo upload', () => {

    const $event = [];
    const event = {
      type: HttpEventType.Sent,
      body: undefined,
    };
    const file = new File(['image.jpg'], 'image.jpg', { type: 'image/jpeg' });
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const fileReaderMock = {
      readAsDataURL() { },
      onload: undefined,
      result: 'reader.result',
    };

    spyOn(window, 'FileReader').and.returnValue(fileReaderMock as any);

    editorApi.uploadImageWithProgress.and.returnValue(of(event));

    // w/o files
    component.onLogoUpload($event);

    expect(editorApi.uploadImageWithProgress).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();

    // w/ files
    $event.push(file);

    component.onLogoUpload($event);

    // event.type = sent
    fileReaderMock.onload();

    expect(editorApi.uploadImageWithProgress).toHaveBeenCalledWith('images', file);
    expect(component.isImageLoading).toBe(true);
    expect(detectSpy).not.toHaveBeenCalled();

    // event.type = upload progress
    editorApi.uploadImageWithProgress.calls.reset();

    event.type = HttpEventType.UploadProgress;

    fileReaderMock.onload();

    expect(editorApi.uploadImageWithProgress).toHaveBeenCalledWith('images', file);
    expect(component.isImageLoading).toBe(true);
    expect(detectSpy).toHaveBeenCalled();

    // event.type = response
    // w/o body
    editorApi.uploadImageWithProgress.calls.reset();
    detectSpy.calls.reset();

    event.type = HttpEventType.Response;

    fileReaderMock.onload();

    expect(editorApi.uploadImageWithProgress).toHaveBeenCalledWith('images', file);
    expect(component.isImageLoading).toBe(false);
    expect(component.siteConfig.siteImage).toEqual(fileReaderMock.result);
    expect(detectSpy).toHaveBeenCalled();

    // w/ body
    event.body = { blobName: 'blob' };

    fileReaderMock.onload();

    expect(component.siteConfig.siteImage).toEqual('blob');

  });

});
