import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { count } from 'rxjs/operators';

import { MediaService, PebEditorApi } from '@pe/builder-api';
import { MediaType, PebEditorState, PebScreen } from '@pe/builder-core';
import {
  PebBackgroundForm,
  PebEditorAccessorService,
  PebEditorSlot,
  PebEditorThemeService,
  VideoSize,
} from '@pe/builder-shared';

import { PebEditorSectionSidebarComponent } from './section.sidebar';

describe('PebEditorSectionSidebarComponent', () => {

  let fixture: ComponentFixture<PebEditorSectionSidebarComponent>;
  let component: PebEditorSectionSidebarComponent;
  let editorComponent: {
    detail: any;
    insertToSlot: jasmine.Spy;
  };

  beforeEach(waitForAsync(() => {

    editorComponent = {
      detail: null,
      insertToSlot: jasmine.createSpy('inserToSlot'),
    };

    const stateMock = {
      singleSelectedElement$: of('elem-001'),
      screen$: of(PebScreen.Desktop),
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorSectionSidebarComponent],
      providers: [
        { provide: PebEditorApi, useValue: {} },
        { provide: MediaService, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: PebEditorState, useValue: stateMock },
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
        { provide: PebEditorThemeService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorSectionSidebarComponent);
      component = fixture.componentInstance;
      component.component = {
        section: {
          initialValue: {
            isFirstSection: false,
          },
          form: new FormGroup({
            name: new FormControl('test'),
            sticky: new FormControl(false),
            default: new FormControl(false),
            moveElement: new FormControl(null),
            newElement: new FormControl(false),
            copyChanges: new FormControl(),
          }),
          submit: {
            next: jasmine.createSpy('next'),
          },
        },
        background: {
          form: new FormGroup({
            bgColor: new FormControl('#333333'),
            bgColorGradientAngle: new FormControl(),
            bgColorGradientStart: new FormControl(),
            bgColorGradientStartPercent: new FormControl(),
            bgColorGradientStop: new FormControl(),
            bgColorGradientStopPercent: new FormControl(),
            file: new FormControl(),
            bgImage: new FormControl('test.jpg'),
            fillType: new FormControl(),
            imageSize: new FormControl(),
            imageScale: new FormControl(),
            mediaType: new FormControl(MediaType.None),
          }),
          submit: {
            next: jasmine.createSpy('next'),
          },
        },
        video: {
          form: new FormGroup({
            thumbnail: new FormControl('thumb.jpg'),
            videoObjectFit: new FormControl(),
            source: new FormControl(),
          }),
        },
      } as any;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set backgdroun$ on construct', () => {

    /**
     * component.component.background.form.value.bgImage is 'test.jpg'
     * component.component.background.form.value.mediaType is MediaType.None
     */
    component.background$.pipe(
      count((value, index) => {
        switch (index) {
          case 0:
            expect(value).toEqual({
              backgroundColor: '#333333',
            });
            break;
          case 1:
            expect(value).toEqual({
              backgroundImage: 'linear-gradient(130deg, #333333 30%, #cccccc 90%)',
            });
            break;
          case 2:
            expect(value).toEqual({
              backgroundSize: null,
              backgroundPosition: 'center center',
              backgroundColor: '#333333',
              backgroundImage: `url('thumb.jpg')`,
            });
            break;
          case 3:
            expect(value).toEqual({
              backgroundSize: '100% 100%',
              backgroundPosition: 'center center',
              backgroundColor: '#333333',
              backgroundImage: `url('thumb.jpg')`,
            });
            break;
          case 4:
            expect(value).toEqual({
              backgroundSize: undefined,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center top',
              backgroundColor: '#333333',
              backgroundImage: 'linear-gradient(130deg, #333333 30%, #cccccc 90%)',
            });
            break;
          case 5:
            expect(value).toEqual({
              backgroundSize: '',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center top',
              backgroundColor: '#333333',
              backgroundImage: `url('test.jpg')`,
            });
            break;
          case 6:
            expect(value).toEqual({
              backgroundSize: '50px 40px',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center top',
              backgroundColor: '#333333',
              backgroundImage: `url('test.jpg')`,
            });
            break;
          default: break;
        }
        return true;
      }),
    ).subscribe();

    /**
     * component.component.background.form.value.bgImage is 'linear-gradient(130deg, #333333 30%, #cccccc 90%)'
     */
    component.component.background.form.patchValue({
      bgImage: 'linear-gradient(130deg, #333333 30%, #cccccc 90%)',
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
      mediaType: MediaType.Video,
    });

    /**
     * component.component.background.form.value.mediaType is MediaType.Studio
     * component.component.background.form.value.bgImage is gradient
     * component.styles.backgroundSize is null
     */
    component.styles = {
      backgroundSize: null,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center top',
    };
    component.component.background.form.patchValue({
      mediaType: MediaType.Studio,
    });

    /**
     * component.component.background.form.value.bgImage is NOT gradient
     */
    component.component.background.form.patchValue({
      bgImage: 'test.jpg',
    });

    /**
     * component.styles.backgroundSize is set
     */
    component.styles.backgroundSize = '1000px 800px';
    component.component.background.form.patchValue({
      bgImage: 'test.jpg',
    });

  });

  it('should get screen$', () => {

    component.screen$.subscribe(screen => expect(screen).toEqual(PebScreen.Desktop));

  });

  it('should handle ng init', () => {

    /**
     * component.component.background.form.value.mediaType is MediaType.None
     */
    component.ngOnInit();
    expect(component.activeMediaType).toEqual(MediaType.None);

    /**
     * component.component.background.form.value.mediaType is MediaType.Video
     */
    component.component.background.form.patchValue({
      mediaType: MediaType.Video,
    });
    expect(component.activeMediaType).toEqual(MediaType.Video);

  });

  it('should get media type', () => {

    /**
     * component.component.background.form.value.bgImage is 'test.jpg'
     */
    component.component.background.form.patchValue({
      bgImage: 'test.jpg',
    });
    expect(component.getMediaType()).toEqual(MediaType.Image);

    /**
     * component.component.background.form.value.bgImage is null
     * component.component.video.form.value.source is set
     */
    component.component.background.form.patchValue({
      bgImage: null,
    });
    component.component.video.form.patchValue({
      source: 'source.mp4',
    });
    expect(component.getMediaType()).toEqual(MediaType.Video);

    /**
     * component.component.video.form.value.source is null
     * component.component.background.form.mediaType is MediaType.Studio
     */
    component.component.video.form.patchValue({
      source: null,
    });
    component.component.background.form.patchValue({
      mediaType: MediaType.Studio,
    });
    expect(component.getMediaType()).toEqual(MediaType.Studio);

    /**
     * component.component.background.form.mediaType is null
     */
    component.component.background.form.patchValue({
      mediaType: null,
    });
    expect(component.getMediaType()).toEqual(MediaType.None);

  });

  it('should handle name input enter', () => {

    const event = {
      preventDefault: jasmine.createSpy('preventDefault'),
      target: {
        value: ' New name ',
      },
    };

    component.pageNameInputEnterHandler(event as any);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.component.section.form.value.name).toEqual('New name');

  });

  it('should move section', () => {

    component.moveSection(true);

    expect(component.component.section.form.value.moveElement).toBe(true);

  });

  it('should add section', () => {

    component.addSection(true);

    expect(component.component.section.form.value.newElement).toBe(true);

  });

  it('should reset section', () => {

    component.resetSection();

    expect(component.component.section.form.value.copyChanges).toEqual(PebScreen.Desktop);

  });

  it('should select copy screen', () => {

    component.selectCopyPebScreen(PebScreen.Mobile);

    expect(component.component.section.form.value.copyChanges).toEqual(PebScreen.Mobile);

  });

  it('should show background form', () => {

    const sidebarCmpRef = {
      instance: {
        formGroup: null,
        blurred: of(true),
        destroy$: new Subject(),
      },
    };

    editorComponent.insertToSlot.and.returnValue(sidebarCmpRef);

    component.showBackgroundForm();

    expect(editorComponent.detail).toEqual({ back: 'Style', title: 'Fill' });
    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(PebBackgroundForm, PebEditorSlot.sidebarDetail);
    expect(sidebarCmpRef.instance.formGroup).toEqual(component.component.background.form);
    expect(component.component.background.submit.next).toHaveBeenCalled();

  });

});
