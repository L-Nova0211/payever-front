import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { count } from 'rxjs/operators';

import { MediaType, PebEditorState, PebFunctionType, PebIntegrationDataType } from '@pe/builder-core';
import { PebBackgroundForm, PebEditorAccessorService, PebEditorSlot, VideoSize } from '@pe/builder-shared';

import { PebEditorTextSidebarComponent } from './text.sidebar';

describe('PebEditorTextSidebarComponent', () => {

  let fixture: ComponentFixture<PebEditorTextSidebarComponent>;
  let component: PebEditorTextSidebarComponent;
  let state: {
    singleSelectedElement$: Subject<string>;
  };
  let editorComponent: {
    detail: any;
    insertToSlot: jasmine.Spy;
  };

  beforeEach(waitForAsync(() => {

    state = {
      singleSelectedElement$: new Subject(),
    };

    editorComponent = {
      detail: null,
      insertToSlot: jasmine.createSpy('insertToSlot'),
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorTextSidebarComponent],
      providers: [
        { provide: PebEditorState, useValue: state },
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorTextSidebarComponent);
      component = fixture.componentInstance;
      component.component = {
        target: {
          editorEnabled$: of(true),
        },
      } as any;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set background$ on construct', () => {

    component.component.background = {
      form: new FormGroup({
        bgImage: new FormControl('test.jpg'),
        bgColor: new FormControl('#333333'),
        mediaType: new FormControl(MediaType.None),
      }),
    } as any;
    component.component.video = {
      form: new FormGroup({
        videoObjectFit: new FormControl(),
        thumbnail: new FormControl('thumb.jpg'),
      }),
    } as any;
    component.styles = {
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'top left',
      backgroundSize: null,
    };
    component.background$.pipe(
      count((value, index) => {
        switch (index) {
          case 0:
            expect(value).toEqual({
              backgroundColor: '#333333'
            });
            break;
          case 1:
            expect(value).toEqual({
              backgroundImage: 'linear-gradient(120deg, #333333 10%, #454545 95%)',
            });
            break;
          case 2:
            expect(value).toEqual({
              backgroundSize: undefined,
              backgroundPosition: 'center center',
              backgroundColor: '#333333',
              backgroundImage: `url('thumb.jpg')`,
            });
            break;
          case 3:
            expect(value).toEqual({
              backgroundSize: '100% 100%',
              backgroundPosition: 'center center',
              backgroundColor: '#222222',
              backgroundImage: `url('thumb.jpg')`,
            });
            break;
          case 4:
            expect(value).toEqual({
              backgroundSize: undefined,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'top left',
              backgroundColor: '#222222',
              backgroundImage: 'linear-gradient(120deg, #333333 10%, #454545 95%)',
            });
            break;
          case 5:
            expect(value).toEqual({
              backgroundSize: '',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'top left',
              backgroundColor: '#222222',
              backgroundImage: `url('test.jpg')`,
            });
            break;
          case 6:
            expect(value).toEqual({
              backgroundSize: '10px 20px',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'top left',
              backgroundColor: '#222222',
              backgroundImage: `url('test.jpg')`,
            });
            break;
          default: break;
        }
        return true;
      }),
    ).subscribe();

    /**
     * emit state.singleSelectedElement$
     * component.component.background.form.value.bgImage is 'test.jpg'
     * component.component.background.form.value.mediaType is MediaType.None
     */
    state.singleSelectedElement$.next('elem');

    /**
     * component.component.background.form.value.bgImage is gradient
     */
    component.component.background.form.patchValue({
      bgImage: 'linear-gradient(120deg, #333333 10%, #454545 95%)',
    });

    /**
     * component.component.background.form.value.mediaType is MediaType.Video
     * component.component.video.form.value.videoObjectFit is null
     */
    component.component.background.form.patchValue({
      mediaType: MediaType.Video,
    });

    /**
     * component.component.video.form.value.videoObjectFit.value is VideoSize.Stretch ('fill')
     */
    component.component.video.form.patchValue({
      videoObjectFit: { value: VideoSize.Stretch },
    });
    component.component.background.form.patchValue({
      bgColor: '#222222',
    });

    /**
     * component.component.background.form.value.mediaType is MediaType.Image
     */
    component.component.background.form.patchValue({
      mediaType: MediaType.Image,
    });

    /**
     * component.component.background.form.value.bgImage is 'test.jpg'
     * component.styles.backgroundSize is null
     */
    component.component.background.form.patchValue({
      bgImage: 'test.jpg',
    });

    /**
     * component.styles.backgroundSize is set
     */
    component.styles.backgroundSize = '200px 400px';
    component.component.background.form.patchValue({
      bgImage: 'test.jpg',
    });

  });

  it('should get background control', () => {

    const control = new FormControl('#333333');

    /**
     * component.component.background is null
     */
    component.component.background = null;
    expect(component.backgroundControl).toBeUndefined();

    /**
     * component.component.background is set
     */
    component.component.background = {
      form: new FormGroup({
        bgColor: control,
      }),
    } as any;
    expect(component.backgroundControl).toEqual(control);

  });

  it('should get show text form', () => {

    const elementMock = {
      data: null,
    };

    /**
     * component.element is null
     */
    component.element = null;
    expect(component.showTextForm).toBe(true);

    /**
     * component.element.data is null
     */
    component.element = elementMock as any;
    expect(component.showTextForm).toBe(true);

    /**
     * component.element.data.functionLink.dataType is PebIntegrationDataType.Select
     */
    elementMock.data = {
      functionLink: {
        functionType: PebFunctionType.Data,
        dataType: PebIntegrationDataType.Select,
      },
    };
    expect(component.showTextForm).toBe(false);

  });

  it('should handle ng init', fakeAsync(() => {

    /**
     * component.component.background is null
     */
    component.component.background = null;
    component.ngOnInit();
    component.editMode$.subscribe(mode => expect(mode).toBe(true));

    /**
     * component.component.background is set
     */
    component.component.background = {
      form: new FormGroup({
        bgColor: new FormControl(),
      }),
      submit: {
        next: jasmine.createSpy('next'),
      },
    } as any;
    component.ngOnInit();

    /**
     * change bgColor
     * component.backgroundFormOpen is TRUE
     */
    component[`backgroundFormOpen`] = true;
    component.component.background.form.patchValue({
      bgColor: '#222222',
    });

    tick();

    expect(component.component.background.submit.next).not.toHaveBeenCalled();

    /**
     * component.backgroundFormOpen is FALSE
     */
    component[`backgroundFormOpen`] = false;
    component.component.background.form.patchValue({
      bgColor: '#333333',
    });

    tick();

    expect(component.component.background.submit.next).toHaveBeenCalled();

  }));

  it('should show background form', () => {

    const sidebarCmpRef = {
      instance: {
        formGroup: null,
        mediaTypes: null,
        blurred: new Subject(),
        destroy$: new Subject(),
      },
    };
    const backgroundMock = {
      form: new FormGroup({
        bgImage: new FormControl(),
        bgColor: new FormControl(),
      }),
      submit: {
        next: jasmine.createSpy('next'),
      },
    };

    editorComponent.insertToSlot.and.returnValue(sidebarCmpRef);

    component.component.background = backgroundMock as any;
    component.showBackgroundForm();

    expect(component[`backgroundFormOpen`]).toBe(true);
    expect(editorComponent.detail).toEqual({ back: 'Style', title: 'Fill' });
    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(PebBackgroundForm, PebEditorSlot.sidebarDetail);
    expect(sidebarCmpRef.instance.formGroup).toEqual(backgroundMock.form);
    expect(sidebarCmpRef.instance.mediaTypes).toEqual([
      { name: 'No media', value: MediaType.None },
      { name: 'Image', value: MediaType.Image },
      { name: 'payever Studio', value: MediaType.Studio },
    ]);
    expect(backgroundMock.submit.next).not.toHaveBeenCalled();

    /**
     * emit sidebarCmpRef.instance.blurred
     */
    sidebarCmpRef.instance.blurred.next();

    expect(component[`backgroundFormOpen`]).toBe(false);
    expect(backgroundMock.submit.next).toHaveBeenCalled();

  });

});
