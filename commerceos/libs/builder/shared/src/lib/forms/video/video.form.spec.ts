import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { PebMediaService } from '@pe/builder-core';

import { PebVideoForm } from './video.form';

describe('PebVideoForm', () => {

  let fixture: ComponentFixture<PebVideoForm>;
  let component: PebVideoForm;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebVideoForm],
      providers: [
        { provide: PebMediaService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebVideoForm);
      component = fixture.componentInstance;
      component.formGroup = new FormGroup({
        source: new FormControl(null),
        preview: new FormControl(null),
      });

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get is loading', () => {

    expect(component.isLoading).toBe(false);

  });

  it('should get video source', () => {

    component.formGroup.get('source').setValue('source');

    expect(component.videoSource).toEqual('source');

  });

  it('should get video preview', () => {

    component.formGroup.get('preview').setValue('preview');

    expect(component.videoPreview).toEqual('preview');

  });

  it('should get file name', () => {

    component.formGroup.get('source').setValue('source/test.mp4');

    expect(component.fileName).toEqual('test.mp4');

  });

  it('should set video duration on metadata check', () => {

    component.onMetadata(null, { duration: 140 });

    expect(component.videoDuration).toEqual('2m 20sec');

  });

  it('should trigger click on file input', () => {

    fixture.detectChanges();

    const clickSpy = spyOn(component.fileInput.nativeElement, 'click');

    // w/ file input
    component.clickOnFileInput();

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.calls.reset();

    // w/o native element
    component.fileInput = {} as any;
    component.clickOnFileInput();

    expect(clickSpy).not.toHaveBeenCalled();

    // w/o file input
    component.fileInput = undefined;
    component.clickOnFileInput();

    expect(clickSpy).not.toHaveBeenCalled();

  });

});
