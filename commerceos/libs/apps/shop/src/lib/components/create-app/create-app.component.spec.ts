import { HttpEventType } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { PebEditorApi, PebShopsApi } from '@pe/builder-api';
import { PebEnvService } from '@pe/builder-core';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { AbbreviationPipe } from '../../misc/pipes/abbreviation.pipe';

import { PeSettingsCreateAppComponent } from './create-app.component';

describe('PeSettingsCreateAppComponent', () => {

  let fixture: ComponentFixture<PeSettingsCreateAppComponent>;
  let component: PeSettingsCreateAppComponent;
  let api: jasmine.SpyObj<PebShopsApi>;
  let appData: any;
  let config: any;
  let overlay: jasmine.SpyObj<PeOverlayWidgetService>;
  let envService: jasmine.SpyObj<PebEnvService>;
  let editorApi: jasmine.SpyObj<PebEditorApi>;

  beforeEach(waitForAsync(() => {

    const apiSpy = jasmine.createSpyObj<PebShopsApi>('PebShopsApi', [
      'markShopAsDefault',
      'updateShop',
      'createShop',
      'validateShopName',
      'deleteShop',
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
      shopId: 'shop-001',
    };

    const editorApiSpy = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', ['uploadImageWithProgress']);

    TestBed.configureTestingModule({
      declarations: [
        PeSettingsCreateAppComponent,
        AbbreviationPipe,
      ],
      providers: [
        { provide: PebShopsApi, useValue: apiSpy },
        { provide: PE_OVERLAY_DATA, useValue: appDataMock },
        { provide: PE_OVERLAY_CONFIG, useValue: configMock },
        { provide: PeOverlayWidgetService, useValue: overlaySpy },
        { provide: PebEnvService, useValue: envServiceMock },
        { provide: PebEditorApi, useValue: editorApiSpy },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeSettingsCreateAppComponent);
      component = fixture.componentInstance;

      api = TestBed.inject(PebShopsApi) as jasmine.SpyObj<PebShopsApi>;
      appData = TestBed.inject(PE_OVERLAY_DATA);
      config = TestBed.inject(PE_OVERLAY_CONFIG);
      overlay = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;
      envService = TestBed.inject(PebEnvService);
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

    api.markShopAsDefault.and.callFake(() => {
      appData.isDefault = true;

      return of(appData);
    });
    api.updateShop.and.returnValue(of(appData));

    expect(config.doneBtnTitle).toEqual('Open');
    expect(config.title).toEqual(appData.name);
    expect(component.shopConfig.shopName).toEqual(appData.name);
    expect(component.shopConfig.shopImage).toEqual(appData.picture);
    expect(component.shopId).toEqual(appData.id);

    // shopConfig.shopName = appData.name
    // shopConfig.shopImage = appData.picture
    // w/o errorMsg
    // appData.isDefault = TRUE
    config.doneBtnCallback();

    expect(openDashboardSpy).toHaveBeenCalledWith(appData);
    expect(appData.onSaved$.next).toHaveBeenCalledWith({ openShop: true, shop: appData });
    expect(overlay.close).toHaveBeenCalled();
    expect(envService.shopId).toEqual(appData.id);
    expect(api.markShopAsDefault).not.toHaveBeenCalled();
    expect(api.updateShop).not.toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();

    // appData.isDefault = FALSE
    openDashboardSpy.calls.reset();

    appData.isDefault = false;

    config.doneBtnCallback();

    expect(api.markShopAsDefault).toHaveBeenCalled();
    expect(openDashboardSpy).toHaveBeenCalledWith(appData);
    expect(api.updateShop).not.toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();

    // shopConfig.shopName != appData.name
    // shopConfig.shopImage != appData.picture
    // appData.isDefault = TRUE
    openDashboardSpy.calls.reset();
    api.markShopAsDefault.calls.reset();

    appData.name = 'new app';
    appData.picture = 'new picture';
    appData.isDefault = true;

    config.doneBtnCallback();

    expect(api.updateShop).toHaveBeenCalledWith({
      id: appData.id,
      name: component.shopConfig.shopName,
      picture: component.shopConfig.shopImage,
    });
    expect(openDashboardSpy).toHaveBeenCalledWith(appData);
    expect(api.markShopAsDefault).not.toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();

    // appData.isDefault = FALSE
    api.updateShop.calls.reset();
    openDashboardSpy.calls.reset();

    appData.isDefault = false;

    config.doneBtnCallback();

    expect(api.updateShop).toHaveBeenCalledWith({
      id: appData.id,
      name: component.shopConfig.shopName,
      picture: component.shopConfig.shopImage,
    });
    expect(api.markShopAsDefault).toHaveBeenCalled();
    expect(openDashboardSpy).toHaveBeenCalledWith(appData);
    expect(markSpy).not.toHaveBeenCalled();

    // w/ error
    api.updateShop.calls.reset();
    api.updateShop.and.returnValue(throwError(error));
    api.markShopAsDefault.calls.reset();
    openDashboardSpy.calls.reset();

    appData.isDefault = false;

    config.doneBtnCallback();

    expect(api.updateShop).toHaveBeenCalledWith({
      id: appData.id,
      name: component.shopConfig.shopName,
      picture: component.shopConfig.shopImage,
    });
    expect(api.markShopAsDefault).not.toHaveBeenCalled();
    expect(openDashboardSpy).not.toHaveBeenCalled();
    expect(component.errorMsg).toEqual(error.error.errors);
    expect(markSpy).toHaveBeenCalled();

    // w/ errorMsg
    api.updateShop.calls.reset();
    api.markShopAsDefault.calls.reset();
    openDashboardSpy.calls.reset();
    markSpy.calls.reset();

    config.doneBtnCallback();

    expect(api.updateShop).not.toHaveBeenCalled();
    expect(api.markShopAsDefault).not.toHaveBeenCalled();
    expect(openDashboardSpy).not.toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();

  });

  it('should set config on construct - appData.id is NOT defined', () => {

    api.markShopAsDefault.and.callFake(() => {
      appData.isDefault = true;

      return of(appData);
    });
    api.createShop.and.returnValue(of({ ...appData, id: 'created app' }));

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

    // w/o shopImage
    // w/o errorMsg
    config.doneBtnCallback();

    expect(api.createShop).toHaveBeenCalledWith({
      name: component.shopConfig.shopName,
    });
    expect(appData.id).toEqual('created app');
    expect(api.markShopAsDefault).toHaveBeenCalledWith(appData.id)
    expect(openDashboardSpy).toHaveBeenCalledWith(appData);
    expect(envService.shopId).toEqual(appData.id);
    expect(appData.onSaved$.next).toHaveBeenCalledWith({ openShop: true, shop: appData });
    expect(overlay.close).toHaveBeenCalled();

    // w/ shopImage
    api.createShop.calls.reset();

    component.shopConfig.shopImage = 'pic.jpg';

    config.doneBtnCallback();

    expect(api.createShop).toHaveBeenCalledWith({
      name: component.shopConfig.shopName,
      picture: component.shopConfig.shopImage,
    });

    // w/ errorMsg
    api.createShop.calls.reset();
    api.markShopAsDefault.calls.reset();
    openDashboardSpy.calls.reset();

    component.errorMsg = 'test error';

    config.doneBtnCallback();

    expect(api.createShop).not.toHaveBeenCalled();
    expect(api.markShopAsDefault).not.toHaveBeenCalled();
    expect(openDashboardSpy).not.toHaveBeenCalled();

  });

  it('should validate shop', () => {

    const validateNameSpy = spyOn(component, 'validateName').and.callThrough();
    const markSpy = spyOn(component[`cdr`], 'markForCheck');
    let name = 'te';

    // INVALID name - length < 3
    component.validateShop(name);

    expect(component.shopConfig.shopName).toEqual(name);
    expect(validateNameSpy).toHaveBeenCalledWith(name);
    expect(component.errorMsg).toEqual('Name should have at least 3 characters');
    expect(markSpy).toHaveBeenCalled();
    expect(api.validateShopName).not.toHaveBeenCalled();

    // INVALID name
    name = '!test';
    component.validateShop(name);

    expect(component.shopConfig.shopName).toEqual(name);
    expect(component.errorMsg).toEqual('Name is not correct');
    expect(markSpy).toHaveBeenCalledTimes(2);
    expect(api.validateShopName).not.toHaveBeenCalled();

    // VALID name through regex
    // w/o message
    name = 'test';

    api.validateShopName.and.returnValue(of({ message: undefined }));

    component.errorMsg = undefined;
    component.validateShop(name);

    expect(component.errorMsg).toBeNull();
    expect(markSpy).toHaveBeenCalledTimes(3);

    // w/ message
    api.validateShopName.and.returnValue(of({ message: 'test error' }));

    component.validateShop(name);

    expect(component.errorMsg).toEqual('test error');
    expect(markSpy).toHaveBeenCalledTimes(4);

  });

  it('should remove shop', () => {

    api.deleteShop.and.returnValue(of({ deleted: true }) as any);

    component.removeShop();

    expect(api.deleteShop).toHaveBeenCalledWith(appData.id);
    expect(appData.onSaved$.next).toHaveBeenCalledWith({ updateShopList: true });
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
    expect(component.shopConfig.shopImage).toEqual(fileReaderMock.result);
    expect(detectSpy).toHaveBeenCalled();

    // w/ body
    event.body = { blobName: 'blob' };

    fileReaderMock.onload();

    expect(component.shopConfig.shopImage).toEqual('blob');

  });

});
