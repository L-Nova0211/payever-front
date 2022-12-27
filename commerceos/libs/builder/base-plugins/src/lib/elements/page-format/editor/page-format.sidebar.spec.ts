import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { count } from 'rxjs/operators';

import { MediaType } from '@pe/builder-core';
import { PebBackgroundForm, PebEditorAccessorService, PebEditorSlot } from '@pe/builder-shared';

import { PebEditorPageSidebarFormatComponent } from './page-format.sidebar';

describe('PebEditorPageSidebarFormatComponent', () => {

  let fixture: ComponentFixture<PebEditorPageSidebarFormatComponent>;
  let component: PebEditorPageSidebarFormatComponent;
  let editorComponent: {
    detail: any;
    insertToSlot: jasmine.Spy;
  };

  beforeEach(waitForAsync(() => {

    editorComponent = {
      detail: null,
      insertToSlot: jasmine.createSpy('insertToSlot'),
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorPageSidebarFormatComponent],
      providers: [
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorPageSidebarFormatComponent);
      component = fixture.componentInstance;
      component.component = {
        background: {
          form: new FormGroup({
            bgImage: new FormControl('linear-gradient(120deg, #333333 10%, #999999 65%)'),
            bgColor: new FormControl('#222222'),
            mediaType: new FormControl(MediaType.None),
          }),
          submit: {
            next: jasmine.createSpy('next'),
          },
        },
        styles: {
          backgroundSize: null,
        },
      } as any;
      component.styles = {};

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set background$ on ng init', () => {

    /**
     * component.component.background.form.value.bgImage is 'linear-gradient(120deg, #333333 10%, #999999 65%)'
     * component.component.background.form.value.mediaType is MediaType.None
     */
    component.styles = {
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center left',
    };
    component.ngOnInit();
    component.background$.pipe(
      count((value, index) => {
        switch (index) {
          case 0:
            expect(value).toEqual({
              backgroundImage: 'linear-gradient(120deg, #333333 10%, #999999 65%)',
            });
            break;
          case 1:
            expect(value).toEqual({
              backgroundColor: '#222222',
            });
            break;
          case 2:
            expect(value).toEqual({
              backgroundSize: undefined,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center left',
              backgroundColor: '#222222',
              backgroundImage: 'linear-gradient(120deg, #333333 10%, #999999 65%)',
            });
            break;
          case 3:
            expect(value).toEqual({
              backgroundSize: '',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center left',
              backgroundColor: '#222222',
              backgroundImage: `url('test.jpg')`,
            });
            break;
          case 4:
            expect(value).toEqual({
              backgroundSize: '5px 10px',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center left',
              backgroundColor: '#111111',
              backgroundImage: `url('test.jpg')`,
            });
            break;
          default: break;
        }
        return true;
      }),
    ).subscribe();

    /**
     * component.component.background.form.value.bgImage is 'test.jpg'
     */
    component.component.background.form.patchValue({
      bgImage: 'test.jpg',
    });

    /**
     * component.component.background.form.value.bgImage is 'linear-gradient(120deg, #333333 10%, #999999 65%)'
     * component.component.background.form.value.mediaType is MediaType.Image
     */
    component.component.background.form.patchValue({
      bgImage: 'linear-gradient(120deg, #333333 10%, #999999 65%)',
      mediaType: MediaType.Image,
    });

    /**
     * component.component.background.form.value.bgImage is 'test.jpg'
     * component.component.styles.backgroundSize is null
     */
    component.component.background.form.patchValue({
      bgImage: 'test.jpg',
    });

    /**
     * component.styles.backgroundSize is set
     */
    component.component.styles.backgroundSize = '100px 200px';
    component.component.background.form.patchValue({
      bgColor: '#111111',
    });

  });

  it('should show background form', () => {

    const sidebarCmpRef = {
      instance: {
        formGroup: null,
        blurred: of(null),
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
