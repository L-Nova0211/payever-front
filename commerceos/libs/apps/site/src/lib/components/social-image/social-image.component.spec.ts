import { HttpEventType } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PebEditorApi } from '@pe/builder-api';
import { TranslatePipe } from '@pe/i18n';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PebSitesApi } from '../../services/site/abstract.sites.api';

import { PeSettingsSocialImageComponent } from './social-image.component';

describe('PeSettingsSocialImageComponent', () => {

  let fixture: ComponentFixture<PeSettingsSocialImageComponent>;
  let component: PeSettingsSocialImageComponent;
  let api: jasmine.SpyObj<PebSitesApi>;
  let appData: any;
  let config: any;
  let overlay: jasmine.SpyObj<PeOverlayWidgetService>;
  let editorApi: jasmine.SpyObj<PebEditorApi>;

  beforeEach(async(() => {

    const apiSpy = jasmine.createSpyObj<PebSitesApi>('PebSitesApi', ['addSocialImage']);

    const appDataMock = {
      id: 'app',
      accessConfig: {
        socialImage: 'social.jpg',
      },
      onSaved$: {
        next: jasmine.createSpy('next'),
      },
    };

    const overlaySpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', ['close']);

    const editorApiSpy = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', ['uploadImageWithProgress']);

    TestBed.configureTestingModule({
      declarations: [
        PeSettingsSocialImageComponent,
        TranslatePipe,
      ],
      providers: [
        { provide: PebSitesApi, useValue: apiSpy },
        { provide: PE_OVERLAY_DATA, useValue: appDataMock },
        { provide: PE_OVERLAY_CONFIG, useValue: {} },
        { provide: PeOverlayWidgetService, useValue: overlaySpy },
        { provide: PebEditorApi, useValue: editorApiSpy },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeSettingsSocialImageComponent);
      component = fixture.componentInstance;

      api = TestBed.inject(PebSitesApi) as jasmine.SpyObj<PebSitesApi>;
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

    expect(config.doneBtnTitle).toEqual('Save');

    api.addSocialImage.and.returnValue(of({ added: 'social-image' }));

    // socialImage = accessConfig.socialImage
    config.doneBtnCallback();

    expect(api.addSocialImage).not.toHaveBeenCalled();
    expect(appData.onSaved$.next).not.toHaveBeenCalled();
    expect(overlay.close).toHaveBeenCalled();

    // socialImage != accessConfig.socialImage
    component.socialImage = 's-image.jpg';

    config.doneBtnCallback();

    expect(api.addSocialImage).toHaveBeenCalledWith(appData.id, 's-image.jpg');
    expect(appData.onSaved$.next).toHaveBeenCalledWith({ updateSiteList: true });
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
