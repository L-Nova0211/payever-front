import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { count, take } from 'rxjs/operators';

import { MediaService, PebEditorApi } from '@pe/builder-api';
import {
  MediaType,
  PebEditorState,
  PebElementType,
  PebFunctionType,
  PebIntegrationDataType,
} from '@pe/builder-core';
import {
  EditorBorderStyleForm,
  PebBackgroundForm,
  PebColorForm,
  PebEditorAccessorService,
  PebEditorSlot,
  VideoSize,
} from '@pe/builder-shared';
import { MediaDialogService } from '@pe/builder-media';

import { PebEditorShapeSidebarComponent } from './shape.sidebar';

describe('PebEditorShapeSidebarComponent', () => {

  let fixture: ComponentFixture<PebEditorShapeSidebarComponent>;
  let component: PebEditorShapeSidebarComponent;
  let mediaDialogService: jasmine.SpyObj<MediaDialogService>;
  let editorComponent: {
    detail: any;
    insertToSlot: jasmine.Spy;
  };
  let state: {
    singleSelectedElement$: Subject<any>;
  };
  let editorEnabled$: BehaviorSubject<boolean>;

  beforeEach(waitForAsync(() => {

    editorEnabled$ = new BehaviorSubject(false);

    editorComponent = {
      detail: null,
      insertToSlot: jasmine.createSpy('insertToSlot'),
    };

    state = {
      singleSelectedElement$: new Subject(),
    };

    const mediaDialogServiceSpy = jasmine.createSpyObj<MediaDialogService>('MediaDialogService', [
      'openMediaDialog',
    ]);

    TestBed.configureTestingModule({
      declarations: [PebEditorShapeSidebarComponent],
      providers: [
        { provide: PebEditorApi, useValue: {} },
        { provide: MediaService, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: FormBuilder, useValue: {} },
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
        { provide: PebEditorState, useValue: state },
        { provide: MediaDialogService, useValue: mediaDialogServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorShapeSidebarComponent);
      component = fixture.componentInstance;
      component.component = {
        definition: {
          type: PebElementType.Shape,
          data: null,
        },
        background: {
          form: new FormGroup({
            bgImage: new FormControl(),
            bgColor: new FormControl('#333333'),
            mediaType: new FormControl(MediaType.Image),
            file: new FormControl(),
          }),
          submit: {
            next: jasmine.createSpy('next'),
          },
        },
        video: {
          form: new FormGroup({
            source: new FormControl(),
            thumbnail: new FormControl('thumb.jpg'),
            videoObjectFit: new FormControl(),
          }),
        },
        proportionDimensions: {
          form: new FormGroup({
            width: new FormControl(),
            height: new FormControl(),
          }),
          limits: null,
          activate: () => null,
          submit: {
            next: () => null,
          },
        },
        radius: {
          form: new FormGroup({
            borderRadius: new FormControl(),
          }),
        },
        shadow: {
          form: new FormGroup({
            hasShadow: new FormControl(),
            shadowColor: new FormControl('#cccccc'),
          }),
          submit: {
            next: jasmine.createSpy('next'),
          },
        },
        border: {
          form: new FormGroup({
            hasBorder: new FormControl(),
            borderStyle: new FormControl(),
            borderColor: new FormControl('#111111'),
          }),
          submit: {
            next: jasmine.createSpy('next'),
          },
        },
        opacity: {
          form: new FormGroup({
            opacity: new FormControl(),
          }),
          submit: {
            next: () => null,
          },
        },
        position: {
          form: new FormGroup({
            x: new FormControl(),
            y: new FormControl(),
          }),
          limits: null,
          submit: {
            next: () => null,
          },
        },
        target: { editorEnabled$ },
      } as any;
      component.styles = {
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left top',
        backgroundSize: null,
      };

      mediaDialogService = TestBed.inject(MediaDialogService) as jasmine.SpyObj<MediaDialogService>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set background$ on construct', () => {

    component.background$.pipe(
      take(7),
      count((value, index) => {
        switch (index) {
          case 0:
            expect(value).toEqual({
              backgroundSize: '',
              backgroundRepeat: component.styles.backgroundRepeat,
              backgroundPosition: component.styles.backgroundPosition,
              backgroundColor: component.component.background.form.value.bgColor,
              backgroundImage: `url('null')`,
            });
            break;
          case 1:
            expect(value).toEqual({
              backgroundSize: '10px 20px',
              backgroundRepeat: component.styles.backgroundRepeat,
              backgroundPosition: component.styles.backgroundPosition,
              backgroundColor: component.component.background.form.value.bgColor,
              backgroundImage: `url('${component.component.background.form.value.bgImage}')`,
            });
            break;
          case 2:
            expect(value).toEqual({
              backgroundSize: undefined,
              backgroundRepeat: component.styles.backgroundRepeat,
              backgroundPosition: component.styles.backgroundPosition,
              backgroundColor: component.component.background.form.value.bgColor,
              backgroundImage: component.component.background.form.value.bgImage,
            });
            break;
          case 3:
            expect(value).toEqual({
              backgroundSize: undefined,
              backgroundPosition: 'center center',
              backgroundColor: component.component.background.form.value.bgColor,
              backgroundImage: `url('${component.component.video.form.value.thumbnail}')`,
            });
            break;
          case 4:
            expect(value).toEqual({
              backgroundSize: '100% 100%',
              backgroundPosition: 'center center',
              backgroundColor: component.component.background.form.value.bgColor,
              backgroundImage: `url('${component.component.video.form.value.thumbnail}')`,
            });
            break;
          case 5:
            expect(value).toEqual({
              backgroundColor: component.component.background.form.value.bgColor,
            });
            break;
          case 6:
            expect(value).toEqual({
              backgroundImage: component.component.background.form.value.bgImage,
            });
            break;
        }

        return true;
      }),
    ).subscribe();

    /**
     * emit state.singleSelectedElement$
     * component.component.background.form.value.mediaType is MediaType.Image
     * component.component.background.form.value.bgImage is null
     * component.styles.backgroundSize is null
     */
    state.singleSelectedElement$.next('elem-001');

    /**
     * component.styles.backgroundSize is '200px 400px'
     * component.component.background.form.value.bgImage is 'test.jpg'
     */
    component.styles.backgroundSize = '200px 400px';
    component.component.background.form.patchValue({
      bgImage: 'test.jpg',
    });

    /**
     * component.component.background.form.value.bgImage is gradient
     */
    component.component.background.form.patchValue({
      bgImage: 'linear-gradient(120deg, #333333 20%, #999999 90%)',
    });

    /**
     * component.component.background.form.value.mediaType is MediaType.Video
     * component.component.video.form.value.videoObjectFit is null
     */
    component.component.background.form.patchValue({
      mediaType: MediaType.Video,
    });

    /**
     * component.component.video.form.value.videoObjectFit.value is VideoSize.Stretch
     */
    component.component.video.form.patchValue({
      videoObjectFit: { value: VideoSize.Stretch },
    });
    component.component.background.form.patchValue({
      bgColor: '#222222',
    });

    /**
     * component.component.background.form.value.mediaType is MediaType.None
     * component.component.background.form.value.bgImage is 'test.jpg'
     */
    component.component.background.form.patchValue({
      mediaType: MediaType.None,
      bgImage: 'test.jpg',
    });

    /**
     * component.component.background.form.value.bgImage is gradient
     */
    component.component.background.form.patchValue({
      bgImage: 'linear-gradient(120deg, #333333 20%, #999999 90%)',
    });

  });

  it('should set shadowColor$ on construct', () => {

    component.shadowColor$.pipe(
      take(2),
      count((value, index) => {
        if (index === 0) {
          expect(value).toEqual({ backgroundColor: component.component.shadow.form.value.shadowColor });
        } else {
          expect(value).toEqual({ backgroundColor: component.component.shadow.form.value.shadowColor });
        }

        return true;
      }),
    ).subscribe();

    /**
     * emit state.singleSelectedElement$
     */
    state.singleSelectedElement$.next('elem-001');

    /**
     * change shadowColor
     */
    component.component.shadow.form.patchValue({
      shadowColor: '#999999',
    });

  });

  it('should set borderColor$ on construct', () => {

    component.borderColor$.pipe(
      take(2),
      count((value, index) => {
        if (index === 0) {
          expect(value).toEqual({ backgroundColor: component.component.border.form.value.borderColor });
        } else {
          expect(value).toEqual({ backgroundColor: component.component.border.form.value.borderColor });
        }

        return true;
      }),
    ).subscribe();

    /**
     * emit state.singleSelectedElement$
     */
    state.singleSelectedElement$.next('elem-001');

    /**
     * change borderColor
     */
    component.component.border.form.patchValue({
      borderColor: '#999999',
    });

  });

  it('should handle ng init', () => {

    const getSpy = spyOn(component, 'getMediaType').and.returnValue(MediaType.Studio);
    const nextSpy = spyOn(component.activeTabIndex$, 'next');

    /**
     * value of component.componen.target.editorEnabled$ is FALSE
     */
    component.ngOnInit();

    expect(nextSpy).toHaveBeenCalledWith(0);
    expect(getSpy).toHaveBeenCalled();
    expect(component.activeMediaType).toEqual(MediaType.Studio);
    expect(component.component.background.form.value.mediaType).toEqual(MediaType.Studio);

    /**
     * change editorEnabled$
     * change media type in background form
     */
    editorEnabled$.next(true);
    component.component.background.form.patchValue({
      mediaType: MediaType.Image,
    });

    expect(nextSpy).toHaveBeenCalledWith(1);
    expect(component.activeMediaType).toEqual(component.component.background.form.value.mediaType);

  });

  it('should get show text form', () => {

    /**
     * component.component is null
     */
    component.component = null;
    expect(component.showTextForm).toBe(false);

    /**
     * component.component.definition.data.type is PebElementType.Section
     * component.component.definition.data is null
     */
    component.component = {
      definition: {
        type: PebElementType.Section,
        data: null,
      },
    } as any;
    expect(component.showTextForm).toBe(false);

    /**
     * component.component.definition.data.type is PebElementType.Shape
     * component.component.definition.data.functionLink.dataType is PebIntegrationDataType.Text
     */
    component.component.definition.type = PebElementType.Shape;
    component.component.definition.data = {
      functionLink: {
        functionType: PebFunctionType.Data,
        dataType: PebIntegrationDataType.Text,
      },
    } as any;
    expect(component.showTextForm).toBe(true);

  });

  it('should get media type', () => {

    // none
    component.component.background.form.patchValue({
      mediaType: MediaType.None,
    });
    expect(component.getMediaType()).toEqual(MediaType.None);

    // video
    component.component.background.form.patchValue({
      mediaType: MediaType.Video,
    });
    component.component.video.form.patchValue({
      source: 'test.mp4',
    });
    expect(component.getMediaType()).toEqual(MediaType.Video);

    // image
    component.component.background.form.patchValue({
      mediaType: null,
      bgImage: 'test.jpg',
    });
    expect(component.getMediaType()).toEqual(MediaType.Image);

    // none
    component.component.background.form.patchValue({
      bgImage: null,
    });
    expect(component.getMediaType()).toEqual(MediaType.None);

    // studio
    component.component.background.form.patchValue({
      mediaType: MediaType.Studio,
    });
    expect(component.getMediaType()).toEqual(MediaType.Studio);

  });

  it('should handle bg input change', () => {

    const eventMock = {
      target: {
        files: [],
      },
    };
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    /**
     * event.target.files is []
     */
    component.changeBgInputHandler(eventMock);
    expect(component.component.background.form.value.file).toBeNull();

    /**
     * event.target.files is set
     */
    eventMock.target.files.push(file);

    component.changeBgInputHandler(eventMock);
    expect(component.component.background.form.value.file).toEqual(file);

  });

  it('should open studio', () => {

    const dataMock = { thumbnail: 'thumb.jpg' };
    const dialogMock = {
      afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(dataMock)),
    };

    mediaDialogService.openMediaDialog.and.returnValue(dialogMock as any);

    component.openStudio();

    expect(mediaDialogService.openMediaDialog).toHaveBeenCalled();
    expect(dialogMock.afterClosed).toHaveBeenCalled();
    expect(component.component.background.form.value.bgImage).toEqual(dataMock.thumbnail);

  });

  it('should get max border radius', () => {

    /**
     * height is more than width
     * border radius is less than width / 2
     */
    component.component.radius.form.patchValue({
      borderRadius: 30,
    });

    expect(component.getMaxBorderRadius()).toBe(50);
    expect(component.component.radius.form.value.borderRadius).toBe(30);

    /**
     * height is less than width
     * border radius is more than height / 2
     */

    expect(component.getMaxBorderRadius()).toBe(25);
    expect(component.component.radius.form.value.borderRadius).toBe(25);

  });

  it('should show background form', () => {

    const sidebarCmpRef = {
      instance: {
        formGroup: null,
        blurred: new EventEmitter<void>(),
        destroy$: new Subject(),
      },
    };

    editorComponent.insertToSlot.and.returnValue(sidebarCmpRef);

    component.showBackgroundForm();

    expect(editorComponent.detail).toEqual({ back: 'Style', title: 'Fill' });
    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(PebBackgroundForm, PebEditorSlot.sidebarDetail);
    expect(sidebarCmpRef.instance.formGroup).toEqual(component.component.background.form);
    expect(component.component.background.submit.next).not.toHaveBeenCalled();

    sidebarCmpRef.instance.blurred.emit();
    expect(component.component.background.submit.next).toHaveBeenCalled();

  });

  it('should show shadow color form', () => {

    const sidebarCmpRef = {
      instance: {
        formControl: null,
        blurred: new EventEmitter<void>(),
        destroy$: new Subject(),
      },
    };

    editorComponent.insertToSlot.and.returnValue(sidebarCmpRef);

    component.showShadowColorForm();

    expect(editorComponent.detail).toEqual({ back: 'Style', title: 'Shadow Color' });
    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(PebColorForm, PebEditorSlot.sidebarDetail);
    expect(sidebarCmpRef.instance.formControl).toEqual(component.component.shadow.form.get('shadowColor'));
    expect(component.component.shadow.submit.next).not.toHaveBeenCalled();

    sidebarCmpRef.instance.blurred.emit();
    expect(component.component.shadow.submit.next).toHaveBeenCalled();

  });

  it('should show border style form', () => {

    const sidebarCmpRef = {
      instance: {
        formControl: null,
        blurred: new EventEmitter<void>(),
        destroy$: new Subject(),
      },
    };

    editorComponent.insertToSlot.and.returnValue(sidebarCmpRef);

    component.openBorderStyleForm();

    expect(editorComponent.detail).toEqual({ back: 'Back', title: 'Border style' });
    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(EditorBorderStyleForm, PebEditorSlot.sidebarDetail);
    expect(sidebarCmpRef.instance.formControl).toEqual(component.component.border.form.get('borderStyle'));
    expect(component.component.border.submit.next).not.toHaveBeenCalled();

    sidebarCmpRef.instance.blurred.emit();
    expect(component.component.border.submit.next).toHaveBeenCalled();

  });

  it('should show border color', () => {

    const sidebarCmpRef = {
      instance: {
        formControl: null,
        blurred: new EventEmitter<void>(),
        destroy$: new Subject(),
      },
    };

    editorComponent.insertToSlot.and.returnValue(sidebarCmpRef);

    component.showBorderColorForm();

    expect(editorComponent.detail).toEqual({ back: 'Style', title: 'Border Color' });
    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(PebColorForm, PebEditorSlot.sidebarDetail);
    expect(sidebarCmpRef.instance.formControl).toEqual(component.component.border.form.get('borderColor'));
    expect(component.component.border.submit.next).not.toHaveBeenCalled();

    sidebarCmpRef.instance.blurred.emit();
    expect(component.component.border.submit.next).toHaveBeenCalled();

  });

});
