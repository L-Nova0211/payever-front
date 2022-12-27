import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { count, take } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import { ImageSize } from '@pe/builder-old';
import { PebEditorAccessorService } from '@pe/builder-services';

import { EditorImageSizeDetailForm } from './image-size-detail.form';
import { EditorImageSizeForm } from './image-size.form';

describe('EditorImageSizeForm', () => {

  let fixture: ComponentFixture<EditorImageSizeForm>;
  let component: EditorImageSizeForm;
  let editorComponent: {
    detail: any,
    insertToSlot: jasmine.Spy,
  };

  beforeEach(waitForAsync(() => {

    editorComponent = {
      detail: null,
      insertToSlot: jasmine.createSpy('insertToSlot'),
    };

    TestBed.configureTestingModule({
      declarations: [EditorImageSizeForm],
      providers: [
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(EditorImageSizeForm);
      component = fixture.componentInstance;
      component.formGroup = new FormGroup({
        size: new FormControl(null),
      });

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get editor', () => {

    expect(component[`editor`]).toEqual(editorComponent as any);

  });

  it('should set title$ on init', () => {

    /**
     * component.formGroup.value.size is null
     */
    component.ngOnInit();
    component.title$.pipe(
      take(2),
      count((value, index) => {
        if (index === 0) {
          expect(value).toEqual('Original Size');
        } else {
          expect(value).toEqual('Scale to Fill');
        }

        return true;
      }),
    ).subscribe();

    /**
     * component.formGroup.value.size is ImageSize.Cover
     */
    component.formGroup.patchValue({
      size: ImageSize.Cover,
    });

  });

  it('should open image size form', () => {

    const cmpMock = {
      instance: {
        formGroup: null,
      },
    };

    editorComponent.insertToSlot.and.returnValue(cmpMock);

    component.openImageSizeForm();

    expect(editorComponent.insertToSlot)
      .toHaveBeenCalledWith(EditorImageSizeDetailForm, PebEditorSlot.sidebarDetail);
    expect(editorComponent.detail).toEqual({
      back: 'Back',
      title: 'Image Size',
    });
    expect(cmpMock.instance.formGroup).toEqual(component.formGroup);

  });

});
