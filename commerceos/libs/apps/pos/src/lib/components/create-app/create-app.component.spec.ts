import { HttpEventType } from '@angular/common/http';
import { NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { PebEditorApi } from '@pe/builder-api';
import { PebClientTerminalService } from '@pe/builder-client';
import { EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PosApi } from '../../services/pos/abstract.pos.api';
import { PosEnvService } from '../../services/pos/pos-env.service';

import { PeSettingsCreateAppComponent } from './create-app.component';


@Pipe({
  name: 'translate',
})
class TranslatePipeMock {

  transform() { }

}

@Pipe({
  name: 'abbreviation',
})
class AbbreviationPipeMock {

  transform() { }

}

describe('PeSettingsCreateAppComponent', () => {

  let fixture: ComponentFixture<PeSettingsCreateAppComponent>;
  let component: PeSettingsCreateAppComponent;
  let api: jasmine.SpyObj<PosApi>;
  let appData: any;
  let config: any;
  let overlay: jasmine.SpyObj<PeOverlayWidgetService>;
  let envService: jasmine.SpyObj<PosEnvService>;
  let editorApi: jasmine.SpyObj<PebEditorApi>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let terminalService: jasmine.SpyObj<PebClientTerminalService>;

  beforeEach(waitForAsync(() => {

    const apiSpy = jasmine.createSpyObj<PosApi>('PosApi', [
      'markPosAsDefault',
      'updatePos',
      'createPos',
      'deletePos',
    ]);

    appData = {
      _id: null,
      name: 'App',
      logo: 'logo.jpg',
      active: false,
      isDefault: true,
      onSved$: {
        next: jasmine.createSpy('next'),
      },
    };

    const configMock = {
      doneBtnTitle: undefined,
      doneBtnCallback: undefined,
    };

    const overlaySpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', ['close']);

    const envServiceMock = {
      posId: 'pos-001',
    };

    const editorApiSpy = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', ['uploadImageWithProgress']);

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
      translate: 'translated',
    });

    TestBed.configureTestingModule({
      declarations: [
        PeSettingsCreateAppComponent,
        AbbreviationPipeMock,
        TranslatePipeMock,
      ],
      providers: [
        { provide: PosApi, useValue: apiSpy },
        { provide: PE_OVERLAY_DATA, useValue: appData },
        { provide: PE_OVERLAY_CONFIG, useValue: configMock },
        { provide: PeOverlayWidgetService, useValue: overlaySpy },
        { provide: EnvService, useValue: envServiceMock },
        { provide: PebEditorApi, useValue: editorApiSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: PosClientTerminalService, useValue: {} },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeSettingsCreateAppComponent);
      component = fixture.componentInstance;

      api = TestBed.inject(PosApi) as jasmine.SpyObj<PosApi>;
      appData = TestBed.inject(PE_OVERLAY_DATA);
      config = TestBed.inject(PE_OVERLAY_CONFIG);
      overlay = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;
      envService = TestBed.inject(EnvService) as jasmine.SpyObj<PosEnvService>;
      editorApi = TestBed.inject(PebEditorApi) as jasmine.SpyObj<PebEditorApi>;
      translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
      terminalService = TestBed.inject(PosClientTerminalService) as jasmine.SpyObj<PosClientTerminalService>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set config on construct - appData._id is null', () => {

    const openDashboardSpy = spyOn(component, 'openDashboard');
    const markSpy = spyOn(component[`cdr`], 'markForCheck');

    api.markPosAsDefault.and.callFake(() => {
      appData.isDefault = true;

      return of(appData);
    });

    /**
     * component.errorMsg is set
     */
    component.errorMsg = 'test error';

    expect(config.doneBtnTitle).toEqual('Create');
    expect(config.doneBtnCallback).toBeDefined();

    config.doneBtnCallback();

    expect(api.createPos).not.toHaveBeenCalled();
    expect(api.markPosAsDefault).not.toHaveBeenCalled();
    expect(openDashboardSpy).not.toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();
    expect(translateService.translate).not.toHaveBeenCalled();

    /**
     * component.errorMsg is null
     * api.createPos throws error
     */
    component.errorMsg = null;

    api.createPos.and.returnValue(throwError('test error'));

    config.doneBtnCallback();

    expect(api.createPos).toHaveBeenCalledWith({
      logo: '',
      name: '',
    });
    expect(api.markPosAsDefault).not.toHaveBeenCalled();
    expect(openDashboardSpy).not.toHaveBeenCalled();
    expect(component.errorMsg).toEqual('translated');
    expect(translateService.translate).toHaveBeenCalledWith('pos-app.settings.error_msg.name_incorrect');
    expect(markSpy).toHaveBeenCalled();

    /**
     * api.createPos returns mocked data
     */
    component.errorMsg = null;

    translateService.translate.calls.reset();
    markSpy.calls.reset();
    api.createPos.and.returnValue(of({ _id: 'app-001' }));

    config.doneBtnCallback();

    expect(appData._id).toEqual('app-001');
    expect(api.markPosAsDefault).toHaveBeenCalledWith('app-001');
    expect(terminalService.terminal).toEqual(appData);
    expect(openDashboardSpy).toHaveBeenCalledWith(appData);
    expect(translateService.translate).not.toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();

  });

  it('should set config on construct - appData._id is set', () => {

    appData._id = 'app-001';

    fixture = TestBed.createComponent(PeSettingsCreateAppComponent);
    component = fixture.componentInstance;

    const openDashboardSpy = spyOn(component, 'openDashboard');
    const markSpy = spyOn(component[`cdr`], 'markForCheck');
    const error = {
      error: {
        errors: 'test error',
      },
    };

    api.markPosAsDefault.and.callFake(() => {
      appData.isDefault = true;

      return of(appData);
    });

    /**
     * component.errorMsg is set
     */
    component.errorMsg = 'test error';

    expect(component.posConfig).toEqual({ name: 'App', logo: 'logo.jpg' });
    expect(component.posId).toEqual('app-001');
    expect(config.doneBtnTitle).toEqual('Open');
    expect(config.doneBtnCallback).toBeDefined();

    config.doneBtnCallback();

    expect(api.markPosAsDefault).not.toHaveBeenCalled();
    expect(api.updatePos).not.toHaveBeenCalled();
    expect(openDashboardSpy).not.toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();

    /**
     * component.errorMsg is null
     * payload.name is undefined
     * appData.active is FALSE
     */
    component.errorMsg = null;
    appData.active = false;

    config.doneBtnCallback();

    expect(api.markPosAsDefault).toHaveBeenCalledWith('app-001');
    expect(api.updatePos).not.toHaveBeenCalled();
    expect(openDashboardSpy).toHaveBeenCalledWith(appData);
    expect(terminalService.terminal).toEqual(appData);

    /**
     * appData.active is TRUE
     */
    appData.active = true;
    api.markPosAsDefault.calls.reset();
    openDashboardSpy.calls.reset();
    terminalService.terminal = null;

    config.doneBtnCallback();

    expect(api.markPosAsDefault).not.toHaveBeenCalled();
    expect(api.updatePos).not.toHaveBeenCalled();
    expect(openDashboardSpy).toHaveBeenCalledWith(appData);
    expect(terminalService.terminal).toBeNull();

    /**
     * payload.name is set
     * api.updatePos throws error
     */
    api.updatePos.and.returnValue(throwError(error));
    openDashboardSpy.calls.reset();

    component.posConfig.name = 'New app name';

    config.doneBtnCallback();

    expect(api.markPosAsDefault).not.toHaveBeenCalled();
    expect(api.updatePos).toHaveBeenCalledWith(appData._id, {
      name: 'New app name',
      logo: 'logo.jpg',
    });
    expect(appData.onSved$.next).not.toHaveBeenCalled();
    expect(openDashboardSpy).not.toHaveBeenCalled();
    expect(terminalService.terminal).toBeNull();
    expect(component.errorMsg).toEqual(error.error.errors);
    expect(markSpy).toHaveBeenCalled();

    /**
     * api.updatePos returns mocked data
     * appData.active is FALSE
     */
    appData.active = false;
    api.updatePos.and.returnValue(of(appData));
    markSpy.calls.reset();

    component.errorMsg = null;
    component.posConfig.name = 'Just another name';

    config.doneBtnCallback();

    expect(appData.onSved$.next).toHaveBeenCalledWith({ updatePosList: true });
    expect(api.markPosAsDefault).toHaveBeenCalledWith(appData._id);
    expect(openDashboardSpy).toHaveBeenCalledWith(appData);
    expect(terminalService.terminal).toEqual(appData);
    expect(component.errorMsg).toBeNull();
    expect(markSpy).not.toHaveBeenCalled();

    /**
     * appData.active is TRUE
     */
    appData.active = true;
    api.markPosAsDefault.calls.reset();
    terminalService.terminal = null;

    config.doneBtnCallback();

    expect(api.markPosAsDefault).not.toHaveBeenCalled();
    expect(openDashboardSpy).toHaveBeenCalledWith(appData);
    expect(terminalService.terminal).toBeNull();
    expect(component.errorMsg).toBeNull();
    expect(markSpy).not.toHaveBeenCalled();

  });

  it('should open dashboard', () => {

    const terminal = {
      _id: 'terminal-001',
    };

    component.openDashboard(terminal);

    expect(envService.posId).toEqual(terminal._id);
    expect(appData.onSved$.next).toHaveBeenCalledWith({ terminal, openTerminal: true });
    expect(overlay.close).toHaveBeenCalled();

  });

  it('should validate terminal name', () => {

    const markSpy = spyOn(component[`cdr`], 'markForCheck');

    /**
     * value.length is more than 3
     */
    component.validateTerminalName('test');

    expect(component.posConfig.name).toEqual('test');
    expect(component.errorMsg).toEqual('');
    expect(translateService.translate).not.toHaveBeenCalled();
    expect(markSpy).toHaveBeenCalled();

    /**
     * value.length is less than 3
     */
    component.validateTerminalName('aa');

    expect(component.posConfig.name).toEqual('aa');
    expect(component.errorMsg).toEqual('translated');
    expect(translateService.translate).toHaveBeenCalledWith('pos-app.settings.error_msg.name_invalid');

  });

  it('should remove shop', () => {

    appData._id = 'app-001';

    api.deletePos.and.returnValue(of({ deleted: true }) as any);

    component.removeTerminal();

    expect(api.deletePos).toHaveBeenCalledWith(appData._id);
    expect(appData.onSved$.next).toHaveBeenCalledWith({ updatePosList: true });
    expect(overlay.close).toHaveBeenCalled();

  });

  it('should handle logo upload', () => {

    const $event = [];
    const event = {
      type: HttpEventType.Sent,
      body: undefined,
    };
    const file = new File(['image.jpg'], 'image.jpg', { type: 'image/jpg' });
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
    expect(component.posConfig.logo).toEqual(fileReaderMock.result);
    expect(detectSpy).toHaveBeenCalled();

    // w/ body
    event.body = { blobName: 'blob' };

    fileReaderMock.onload();

    expect(component.posConfig.logo).toEqual('blob');

  });

});
