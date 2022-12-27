import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { ImageSize, ImageSizes } from '@pe/builder-old';

import { EditorImageSizeDetailForm } from './image-size-detail.form';


describe('EditorImageSizeDetailForm', () => {

  let fixture: ComponentFixture<EditorImageSizeDetailForm>;
  let component: EditorImageSizeDetailForm;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [EditorImageSizeDetailForm],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(EditorImageSizeDetailForm);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set options on construct', () => {

    expect(component.options).toEqual(ImageSizes.filter(size => size.value !== ImageSize.Initial));

  });

  it('should set image size value', () => {

    component.formGroup = new FormGroup({
      size: new FormControl(),
    });
    component.setImageSizeValue(ImageSize.Contain);

    expect(component.formGroup.value.size).toEqual(ImageSize.Contain);

  });

});
