import { HttpEventType } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PebEditorApi, PebShopsApi } from '@pe/builder-api';
import { TranslatePipe, TranslateService } from '@pe/i18n';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeSettingsSocialImageComponent } from './social-image.component';

describe('PeSettingsSocialImageComponent', () => {

  let fixture: ComponentFixture<PeSettingsSocialImageComponent>;
  let component: PeSettingsSocialImageComponent;
  let api: jasmine.SpyObj<PebShopsApi>;
  let appData: any;
  let config: any;
  let overlay: jasmine.SpyObj<PeOverlayWidgetService>;
  let editorApi: jasmine.SpyObj<PebEditorApi>;

  beforeEach(async(() => {

    const apiSpy = jasmine.createSpyObj<PebShopsApi>('PebShopsApi', ['addSocialImage']);

    const appDataMock = {
      id: 'app',
      accessConfig: {
        socialImage: 'social.jpg',
      },
      onSved$: {
        next: jasmine.createSpy('next'),
      },
    };

    const overlaySpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', ['close']);

    const editorApiSpy = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', ['uploadImageWithProgress']);

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
      translate: 'translated',
    });

    TestBed.configureTestingModule({
      declarations: [
        PeSettingsSocialImageComponent,
        TranslatePipe,
      ],
      providers: [
        { provide: PebShopsApi, useValue: apiSpy },
        { provide: PE_OVERLAY_DATA, useValue: appDataMock },
        { provide: PE_OVERLAY_CONFIG, useValue: {} },
        { provide: PeOverlayWidgetService, useValue: overlaySpy },
        { provide: PebEditorApi, useValue: editorApiSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeSettingsSocialImageComponent);
      component = fixture.componentInstance;

      api = TestBed.inject(PebShopsApi) as jasmine.SpyObj<PebShopsApi>;
      appData = TestBed.inject(PE_OVERLAY_DATA);
      config = TestBed.inject(PE_OVERLAY_CONFIG);
      overlay = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;
      editorApi = TestBed.inject(PebEditorApi) as jasmine.SpyObj<PebEditorApi>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle done button callback', () => {

    expect(config.doneBtnTitle).toEqual('translated');

    api.addSocialImage.and.returnValue(of({ added: 'social-image' }));

    // socialImage = accessConfig.socialImage
    config.doneBtnCallback();

    expect(api.addSocialImage).not.toHaveBeenCalled();
    expect(appData.onSved$.next).not.toHaveBeenCalled();
    expect(overlay.close).toHaveBeenCalled();

    // socialImage != accessConfig.socialImage
    component.socialImage = 's-image.jpg';

    config.doneBtnCallback();

    expect(api.addSocialImage).toHaveBeenCalledWith(appData.id, 's-image.jpg');
    expect(appData.onSved$.next).toHaveBeenCalledWith({ updateShopList: true });
    expect(overlay.close).toHaveBeenCalledTimes(2);

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
    expect(component.socialImage).toEqual(fileReaderMock.result);
    expect(detectSpy).toHaveBeenCalled();

    // w/ body
    event.body = { blobName: 'blob' };

    fileReaderMock.onload();

    expect(component.socialImage).toEqual('blob');

  });

});
