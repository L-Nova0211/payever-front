import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, of, Subject } from 'rxjs';

import { PebEditorSlot } from '@pe/builder-abstract';
import { MediaService } from '@pe/builder-api';
import { MediaItemType, MediaType, PebEditorState } from '@pe/builder-core';
import { PebEditorRenderer } from '@pe/builder-main-renderer';
import { MediaDialogService } from '@pe/builder-media';
import { VideoSize } from '@pe/builder-old';
import { PebEditorAccessorService } from '@pe/builder-services';

import { PebBackgroundForm, PebBackgroundFormTab } from './background.form';

describe('EditorBackgroundDetailForm', () => {

  let fixture: ComponentFixture<PebBackgroundForm>;
  let component: PebBackgroundForm;
  let sanitizer: jasmine.SpyObj<DomSanitizer>;
  let mediaDialogService: jasmine.SpyObj<MediaDialogService>;
  let renderer: jasmine.SpyObj<PebEditorRenderer>;
  let state: any;
  let editorComponent: any;

  beforeEach(waitForAsync(() => {

    const sanitizerSpy = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
      bypassSecurityTrustStyle: 'bypassed',
    });

    editorComponent = {
      optionList: null,
      insertToSlot: jasmine.createSpy('insertToSlot'),
    };

    const mediaDialogServiceSpy = jasmine.createSpyObj<MediaDialogService>('MediaDialogService', ['openMediaDialog']);

    const stateMock = {
      singleSelectedGridCell: null,
      selectedGridCells: [],
      selectedElements: [],
    };

    const rendererSpy = jasmine.createSpyObj<PebEditorRenderer>('PebEditorRenderer', ['getElementComponent'], {
      element: { id: 'elem-001' } as any,
    });

    TestBed.configureTestingModule({
      declarations: [PebBackgroundForm],
      providers: [
        { provide: MatDialog, useValue: {} },
        { provide: DomSanitizer, useValue: sanitizerSpy },
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
        { provide: MediaDialogService, useValue: mediaDialogServiceSpy },
        { provide: MediaService, useValue: {} },
        { provide: PebEditorState, useValue: stateMock },
        { provide: PebEditorRenderer, useValue: rendererSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebBackgroundForm);
      component = fixture.componentInstance;
      component.formGroup = new FormGroup({
        mediaType: new FormControl(),
        bgImage: new FormControl('bg.jpg'),
        bgColor: new FormControl(),
        imageSize: new FormGroup({
          name: new FormControl(),
        }),
        bgColorGradientAngle: new FormControl(),
        bgColorGradientStart: new FormControl(),
        bgColorGradientStartPercent: new FormControl(),
        bgColorGradientStop: new FormControl(),
        bgColorGradientStopPercent: new FormControl(),
        videoObjectFit: new FormControl(),
        videoScale: new FormControl(),
      });

      sanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
      mediaDialogService = TestBed.inject(MediaDialogService) as jasmine.SpyObj<MediaDialogService>;
      renderer = TestBed.inject(PebEditorRenderer) as jasmine.SpyObj<PebEditorRenderer>;
      state = TestBed.inject(PebEditorState);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get gradient', () => {

    expect(component.gradient).toEqual('bypassed');
    expect(sanitizer.bypassSecurityTrustStyle.calls.argsFor(0)[0].replace(/\n\s+/g, ' '))
      .toEqual('linear-gradient(90deg, #ffffff 0%, #ffffff 100%)');

  });

  it('should get gradient start color', () => {

    // w/o value
    expect(component.gradientStartColor).toEqual('#ffffff');

    // w/ value
    component.formGroup.patchValue({ bgColorGradientStart: 'red' }, { emitEvent: false });
    expect(component.gradientStartColor).toEqual('red');

  });

  it('should get gradient start percent', () => {

    // w/o value
    expect(component.gradientStartPercent).toBe(0);

    // w/ value
    component.formGroup.patchValue({ bgColorGradientStartPercent: 13 }, { emitEvent: false });
    expect(component.gradientStartPercent).toBe(13);

  });

  it('should get gradient stop color', () => {

    // w/o value
    expect(component.gradientStopColor).toEqual('#ffffff');

    // w/ value
    component.formGroup.patchValue({ bgColorGradientStop: 'green' }, { emitEvent: false });
    expect(component.gradientStopColor).toEqual('green');

  });

  it('should get gradient stop percent', () => {

    // w/o value
    expect(component.gradientStopPercent).toBe(100);

    // w/ value
    component.formGroup.patchValue({ bgColorGradientStopPercent: 93 }, { emitEvent: false });
    expect(component.gradientStopPercent).toBe(93);

  });

  it('should get element id', () => {

    /**
     * state.singleSelectedGridCell is null
     * state.selectedGridCells & selectedElements are [] (empty array)
     */
    expect(component.elementId).toEqual(renderer.element.id);

    /**
     * state.selectedElements is set
     */
    state.selectedElements = ['selected-001'];

    expect(component.elementId).toEqual('selected-001');

    /**
     * state.selectedGridCells is set
     */
    state.selectedGridCells = [{ id: 'c-001' }];

    expect(component.elementId).toEqual('c-001');

    /**
     * state.singleSelectedGridCell is set
     */
    state.singleSelectedGridCell = { id: 'c-002' };

    expect(component.elementId).toEqual('c-002');

  });

  it('should handle ng init', () => {

    const detectSpy = spyOn(component.cdr, 'detectChanges');
    const nextSpy = spyOn(component.thumbnail$, 'next');

    /**
     * component.formGroup does not have imageBgForm.bgColor control
     * component.formGroup.value.mediaType is undefined
     * component.formGroup.value.bgImage is not gradient
     * component.component is null
     */
    component.component = null;
    component.ngOnInit();

    expect(component.imageBackground$).toBeUndefined();
    expect(nextSpy).toHaveBeenCalledWith(null);
    expect(detectSpy).toHaveBeenCalled();

    /**
     * change bgImage
     * value is not gradient
     */
    component.formGroup.patchValue({
      bgImage: 'test.jpg',
    });

    expect(nextSpy).toHaveBeenCalledWith('test.jpg');

    /**
     * value is gradient
     */
    nextSpy.calls.reset();
    component.formGroup.patchValue({
      bgImage: 'linear-gradient(100deg, #333333 10%, #999999 65%)',
    });

    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * component.formGroup.value.mediaType is MediaType.Image
     * value is not gradient
     */
    component.formGroup.patchValue({
      bgImage: 'new-bg.jpg',
    });
    nextSpy.calls.reset();
    component.formGroup.patchValue({
      mediaType: MediaType.Image,
    });

    expect(nextSpy).toHaveBeenCalledWith('new-bg.jpg');

    /**
     * change mediaType
     */
    component.formGroup.patchValue({
      mediaType: MediaType.Video,
    });

    expect(nextSpy).toHaveBeenCalledWith(null);

    /**
     * component.formGroup has imageBgForm.bgColor control
     * component.formGroup.value.mediaType is MediaType.Video
     */
    nextSpy.calls.reset();
    component.formGroup.addControl('imageBgForm', new FormGroup({
      bgColor: new FormControl('#cccccc'),
    }));
    component.formGroup.patchValue({
      mediaType: MediaType.Video,
    });

    component.ngOnInit();
    component.imageBackground$.subscribe(value => expect(value).toEqual({
      backgroundColor: '#cccccc',
    })).unsubscribe();

    expect(nextSpy).toHaveBeenCalledWith(null);

    /**
     * component.component.video is null
     */
    nextSpy.calls.reset();
    component.component = { video: null } as any;
    component.ngOnInit();

    expect(nextSpy).toHaveBeenCalledWith(null);

    /**
     * component.component.video.form is set
     * component.component.video.form.value.videoObjectFit is null
     * component.component.video.form does NOT have videoScale control
     */
    nextSpy.calls.reset();
    component.component.video = {
      form: new FormGroup({
        thumbnail: new FormControl('thumb'),
        videoObjectFit: new FormControl(null),
      }),
    } as any;
    component.ngOnInit();

    expect(nextSpy).toHaveBeenCalledWith('thumb');

    /**
     * change component.component.video.form.value.videoObjectFit
     * then add videoScale control to component.component.video.form
     * and change component.component.video.form.value.videoObjectFit again
     */
    component.component.video.form.patchValue({
      videoObjectFit: { value: VideoSize.OriginalSize },
    });
    component.component.video.form.addControl('videoScale', new FormControl());
    component.component.video.form.patchValue({
      videoObjectFit: { value: VideoSize.Cover },
    });
    expect(component.component.video.form.controls.videoScale.disabled).toBe(true);

    /**
     * change component.component.video.form.value.videoObjectFit to VideoSize.OriginalSize
     */
    component.component.video.form.patchValue({
      videoObjectFit: { value: VideoSize.OriginalSize },
    });
    expect(component.component.video.form.controls.videoScale.disabled).toBe(false);

    /**
     * change component.component.video.form.thumbnail
     */
    detectSpy.calls.reset();
    component.component.video.form.patchValue({
      thumbnail: 'new-thumb',
    });

    expect(nextSpy).toHaveBeenCalledWith('new-thumb');
    expect(detectSpy).toHaveBeenCalled();

    /**
     * component.formGroup does not have the following controls:
     * bgImage
     * mediaType
     */
    nextSpy.calls.reset();
    detectSpy.calls.reset();
    component.formGroup.removeControl('bgImage');
    component.formGroup.removeControl('mediaType');
    component.ngOnInit();

    expect(nextSpy).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();

    /**
     * change component.component.video.form.thumbnail
     */
    component.component.video.form.patchValue({
      thumbnail: 'test-thumb',
    });

    expect(nextSpy).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();

  });

  it('should handle bg input changes', () => {

    const event = {
      target: {
        files: [],
      },
    };
    const file = new File(['test'], 'test.jpg', { type: 'image/jpg' });
    const bgImageInputMock = {
      nativeElement: {
        value: file,
      },
    };

    component.bgImageInput = bgImageInputMock;
    component.formGroup = new FormGroup({
      file: new FormControl(),
    });

    const patchSpy = spyOn(component.formGroup.get('file'), 'patchValue').and.callThrough();

    /**
     * event.target.files is []
     */
    component.changeBgInputHandler(event);

    expect(patchSpy).not.toHaveBeenCalled();
    expect(bgImageInputMock.nativeElement.value).toEqual(file);

    /**
     * event.target.files is set
     */
    event.target.files.push(file);

    component.changeBgInputHandler(event);

    expect(patchSpy).toHaveBeenCalledWith(file);
    expect(bgImageInputMock.nativeElement.value).toBeNull();

  });

  it('should handle video input', () => {

    const nextSpy = spyOn(component.bgImageLoading$, 'next');
    const eventMock = {
      target: {
        files: [],
      },
    };
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const videoInputMock = {
      nativeElement: {
        value: file,
      },
    };
    const videoMock = {
      submit: { next: jasmine.createSpy('next') },
      form: new FormGroup({
        thumbnail: new FormControl(),
      }),
      result$: new Subject(),
    };

    /**
     * event.target.files is []
     */
    component.videoInput = videoInputMock;
    component.changeVideoInputHandler(eventMock);

    expect(nextSpy).not.toHaveBeenCalled();
    expect(videoInputMock.nativeElement.value).toEqual(file);

    /**
     * event.target.files is set
     * component.component is null
     */
    eventMock.target.files.push(file);

    component.component = null;
    component.changeVideoInputHandler(eventMock);

    expect(nextSpy).toHaveBeenCalledOnceWith(true);
    expect(videoInputMock.nativeElement.value).toBeNull();

    /**
     * component.component.video is null
     */
    nextSpy.calls.reset();

    component.component = { video: null } as any;
    component.changeVideoInputHandler(eventMock);

    expect(nextSpy).toHaveBeenCalledOnceWith(true);

    /**
     * component.component.video is set
     */
    nextSpy.calls.reset();

    component.component.video = videoMock as any;
    component.changeVideoInputHandler(eventMock);

    expect(nextSpy).toHaveBeenCalledOnceWith(true);
    expect(videoMock.submit.next).toHaveBeenCalledWith(eventMock);

    videoMock.form.patchValue({
      thumbnail: 'thumb',
    });
    expect(nextSpy.calls.allArgs()).toEqual([[true], [false]]);

  });

  it('should get fill type', () => {

    component.formGroup = new FormGroup({
      fillType: new FormControl('fit'),
    });

    // fill type is string
    expect(component.getFillType()).toEqual('fit');

    // fill type is object
    component.formGroup.get('fillType').setValue({
      name: 'contain',
    });
    expect(component.getFillType()).toEqual('contain');

  });

  it('should change media', () => {

    const openSpy = spyOn(component, 'openMediaStudio');

    /**
     * component.bgImageInput is null
     * component.videoInput is null
     * component.formGroup.value.mediaType is MediaType.None
     */
    component.formGroup.patchValue({
      mediaType: MediaType.None,
    });
    component.bgImageInput = null;
    component.videoInput = null;
    component.changeMedia();

    expect(openSpy).not.toHaveBeenCalled();

    /**
     * component.formGroup.value.mediaType is MediaType.Image
     */
    component.formGroup.patchValue({
      mediaType: MediaType.Image,
    });
    component.changeMedia();

    expect(openSpy).not.toHaveBeenCalled();

    /**
     * component.bgImageInput.nativeElement is null
     */
    component.bgImageInput = { nativeElement: null };
    component.changeMedia();

    expect(openSpy).not.toHaveBeenCalled();

    /**
     * component.bgImageInput.nativeElement is set
     */
    component.bgImageInput.nativeElement = { click: jasmine.createSpy('click') };
    component.changeMedia();

    expect(component.bgImageInput.nativeElement.click).toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();

    /**
     * component.formGroup.value.mediaType is MediaType.Video
     */
    component.formGroup.patchValue({
      mediaType: MediaType.Video,
    });
    component.changeMedia();

    expect(openSpy).not.toHaveBeenCalled();

    /**
     * component.videoInput.nativeElement is null
     */
    component.videoInput = { nativeElement: null };
    component.changeMedia();

    expect(openSpy).not.toHaveBeenCalled();

    /**
     * component.videoInput.nativeElement is set
     */
    component.videoInput.nativeElement = { click: jasmine.createSpy('click') };
    component.changeMedia();

    expect(component.videoInput.nativeElement.click).toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();

    /**
     * component.formGroup.value.mediaType is MediaType.Studio
     */
    component.formGroup.patchValue({
      mediaType: MediaType.Studio,
    });
    component.changeMedia();

    expect(openSpy).toHaveBeenCalled();

  });

  it('should open media studio', () => {

    const afterClosedSubject = new BehaviorSubject(null);
    const dialogRef = {
      afterClosed: jasmine.createSpy('afterClosed').and.returnValue(afterClosedSubject),
    };
    const dataMock = { thumbnail: 'thumb' };

    mediaDialogService.openMediaDialog.and.returnValue(dialogRef as any);

    /**
     * afterClosed emits data as null
     */
    component.openMediaStudio();

    expect(mediaDialogService.openMediaDialog).toHaveBeenCalledWith({ types: [MediaItemType.Image] });
    expect(dialogRef.afterClosed).toHaveBeenCalled();
    expect(component.formGroup.value.mediaType).toBeNull();
    expect(component.formGroup.value.bgImage).toEqual('bg.jpg');

    /**
     * afterClosed emits mocked data
     */
    afterClosedSubject.next(dataMock);

    expect(component.formGroup.value.mediaType).toEqual(MediaType.Image);
    expect(component.formGroup.value.bgImage).toEqual(dataMock.thumbnail);

  });

  it('should show image background form', () => {

    const sidebarCmp = {
      instance: {
        formGroup: null as FormGroup,
        tabs: {},
        activeTab: null,
        blurred: of(true),
        destroy$: new Subject(),
      },
    };

    editorComponent.insertToSlot.and.returnValue(sidebarCmp);

    component.formGroup.addControl('imageBgForm', new FormGroup({
      bgColor: new FormControl('#454545'),
    }));
    component.component = {
      background: {
        submit: {
          next: jasmine.createSpy('next'),
        },
      },
    } as any;
    component.showImageBackgroundForm();

    expect(editorComponent.optionList).toEqual({ back: 'Style', title: 'Fill' });
    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(PebBackgroundForm, PebEditorSlot.sidebarOptionList);
    expect(sidebarCmp.instance.formGroup).toEqual(component.formGroup.get('imageBgForm') as FormGroup);
    expect(sidebarCmp.instance.tabs).toEqual({
      [PebBackgroundFormTab.Media]: false,
      [PebBackgroundFormTab.Gradient]: false,
    });
    expect(sidebarCmp.instance.activeTab).toEqual(PebBackgroundFormTab.Color);
    expect(component.component.background.submit.next).toHaveBeenCalled();

  });

  it('should enable/disable videoScale on videoObjectFit change', () => {
    const videoObjectFitControl = new FormControl(component.videoSize[0]);
    const videoScaleControl = new FormControl(100);
    component.component = {
      video: {
        form: new FormGroup({
          videoObjectFit: videoObjectFitControl,
          videoScale: videoScaleControl,
        }),
        update: null,
        submit: new Subject(),
      },
    } as any;
    const videoScaleControlEnableSpy = spyOn(videoScaleControl, 'enable');
    const videoScaleControlDisableSpy = spyOn(videoScaleControl, 'disable');
    fixture.detectChanges();
    expect(videoScaleControlEnableSpy).toHaveBeenCalled();

    videoObjectFitControl.patchValue(component.videoSize[2]);
    expect(videoScaleControlDisableSpy).toHaveBeenCalled();
  });

});
