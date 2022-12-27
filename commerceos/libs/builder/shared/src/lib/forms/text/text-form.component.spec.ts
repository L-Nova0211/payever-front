import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormControl } from '@angular/forms';
import { ApmService } from '@elastic/apm-rum-angular';
import { EMPTY, of, Subject, throwError } from 'rxjs';
import { count, take } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import { PebTextAlignType, PebTextJustify } from '@pe/builder-core';
import { PebEditorAccessorService } from '@pe/builder-services';

import { RGBA } from '../../form-control/color-picker/formats';
import { PebColorForm } from '../color/color.form';

import { PebFontListComponent } from './font-list.component';
import { PebTextForm, PebTextStyleDto } from './text-form.component';
import { PebTextFormService } from './text-form.service';

describe('PebTextForm', () => {

  let fixture: ComponentFixture<PebTextForm>;
  let component: PebTextForm;
  let textFormService: jasmine.SpyObj<PebTextFormService>;
  let editorComponent: {
    detail: any;
    insertToSlot: jasmine.Spy;
  };
  let apmService: {
    apm: { captureError: jasmine.Spy; };
  };

  beforeEach(waitForAsync(() => {

    editorComponent = {
      detail: null,
      insertToSlot: jasmine.createSpy('insertToSlot'),
    };

    const textFormServiceSpy = jasmine.createSpyObj<PebTextFormService>('PebTextFormService', [
      'setTextStyles',
    ]);
    textFormServiceSpy.textStyle$ = EMPTY;

    apmService = {
      apm: {
        captureError: jasmine.createSpy('captureError'),
      },
    };

    TestBed.configureTestingModule({
      declarations: [PebTextForm],
      providers: [
        FormBuilder,
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
        { provide: PebTextFormService, useValue: textFormServiceSpy },
        { provide: ApmService, useValue: apmService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebTextForm);
      component = fixture.componentInstance;

      textFormService = TestBed.inject(PebTextFormService) as jasmine.SpyObj<PebTextFormService>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set textColor$ on construct', () => {

    component.textColor$.pipe(
      take(2),
      count((value, index) => {
        if (index === 0) {
          expect(value).toEqual({
            backgroundColor: null,
          });
        } else {
          expect(value).toEqual({
            backgroundColor: '#333333',
          });
        }

        return true;
      }),
    ).subscribe();

    /**
     * component.textForm.value.color is typeof array
     */
    component.textForm.patchValue({
      color: ['#333333'],
    });

    /**
     * component.textForm.value.color is typeof string
     */
    component.textForm.patchValue({
      color: '#333333',
    });

  });

  it('should set fontFamily$ on construct', () => {

    component.fontFamily$.pipe(
      take(2),
      count((value, index) => {
        if (index === 0) {
          expect(value).toEqual('Multiple Fonts');
        } else {
          expect(value).toEqual('Cabin');
        }

        return true;
      }),
    ).subscribe();

    /**
     * component.textForm.value.fontFamily is typeof array
     */
    component.textForm.patchValue({
      fontFamily: ['Cabin'],
    });

    /**
     * component.textForm.value.fontFamily is typeof string
     */
    component.textForm.patchValue({
      fontFamily: 'Cabin',
    });

  });

  it('should handle ng init', () => {

    const textFormSpies = {
      pristine: spyOn(component.textForm, 'markAsPristine').and.callThrough(),
      untouched: spyOn(component.textForm, 'markAsUntouched').and.callThrough(),
    };
    const fontStyleFormSpies = {
      pristine: spyOn(component.fontStyleForm, 'markAsPristine').and.callThrough(),
      untouched: spyOn(component.fontStyleForm, 'markAsUntouched').and.callThrough(),
    };
    const textStyle = {
      color: '#333333',
      fontFamily: 'Cabin',
      fontWeight: 500,
      fontSize: 16,
      italic: false,
      link: null,
      strike: false,
      verticalAlign: PebTextAlignType.Center,
      textJustify: PebTextJustify.Center,
      underline: false,
    };

    textFormService.textStyle$ = of(textStyle) as any;

    component[`ngZone` as any] = { onStable: of(true) };
    component.ngOnInit();

    expect(component.latestStyles).toEqual(textStyle);
    expect(component.textForm.value).toEqual(textStyle);
    expect(textFormSpies.pristine).toHaveBeenCalled();
    expect(textFormSpies.untouched).toHaveBeenCalled();
    expect(fontStyleFormSpies.pristine).toHaveBeenCalled();
    expect(fontStyleFormSpies.untouched).not.toHaveBeenCalled();
    expect(component.fontStyleForm.value).toEqual({
      bold: true,
      italic: false,
      underline: false,
      strike: false,
    });

    /**
     * change component.fontStyleForm values
     * textFormService.setTextStyles throws error
     */
    Object.values(textFormSpies).forEach(spy => spy.calls.reset());
    Object.values(fontStyleFormSpies).forEach(spy => spy.calls.reset());
    textFormService.setTextStyles.and.returnValue(throwError('test error'));

    component.fontStyleForm.get('bold').markAsDirty();
    component.fontStyleForm.patchValue({
      bold: false,
      italic: true,
      underline: true,
      strike: true,
    });

    expect(fontStyleFormSpies.untouched).toHaveBeenCalled();
    expect(fontStyleFormSpies.pristine).toHaveBeenCalled();
    expect(textFormSpies.pristine).toHaveBeenCalled();
    expect(textFormSpies.untouched).not.toHaveBeenCalled();
    expect(textFormService.setTextStyles).toHaveBeenCalledWith({ fontWeight: 400 }, component.textForm.touched);
    expect(apmService.apm.captureError).toHaveBeenCalled();

    /**
     * textFormService.setTextStyles returns mocked data
     * component.textForm.touched is FALSE
     */
    textFormService.setTextStyles.and.returnValue(of(null));
    apmService.apm.captureError.calls.reset();

    component.ngOnInit();
    component.textForm.get('fontSize').markAsDirty();

    textFormSpies.untouched.calls.reset();

    component.textForm.patchValue({
      fontSize: 32,
      fontWeight: [500],
      italic: [true],
      underline: [true],
      strike: [true],
    });

    expect(textFormSpies.untouched).not.toHaveBeenCalled();
    expect(component.fontStyleForm.value).toEqual({
      bold: false,
      italic: false,
      underline: false,
      strike: false,
    });
    expect(apmService.apm.captureError).not.toHaveBeenCalled();

    /**
     * component.textForm.touched is TRUE
     */
    component.ngOnInit();
    component.textForm.markAsTouched();
    component.textForm.get('fontSize').markAsDirty();

    textFormSpies.untouched.calls.reset();

    component.textForm.patchValue({
      fontSize: 24,
    });

    expect(textFormSpies.untouched).toHaveBeenCalled();

  });

  it('should show text color form', () => {

    const sidebarCmpRef = {
      instance: {
        formControl: null as FormControl,
        destroy$: new Subject(),
      },
    };
    const touchedSpy = spyOn(component.textForm.get('color'), 'markAsTouched');
    const dirtySpy = spyOn(component.textForm.get('color'), 'markAsDirty');
    let color: RGBA = new RGBA(200, 125, 113, .75);

    editorComponent.insertToSlot.and.returnValue(sidebarCmpRef);

    /**
     * component.textForm.value.color is typeof array
     */
    component.textForm.patchValue({
      color: [color],
    });
    component.showTextColorForm();

    expect(editorComponent.detail).toEqual({ back: 'Style', title: 'Color' });
    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(PebColorForm, PebEditorSlot.sidebarDetail);
    expect(sidebarCmpRef.instance.formControl).toBeDefined();
    expect(sidebarCmpRef.instance.formControl.value).toEqual(new RGBA(255, 255, 255, 1));

    /**
     * change value of sidebarCmpRef.instance.formConrol
     * sidebarCmpRef.instance.formConrol.touched is FALSE
     */
    sidebarCmpRef.instance.formControl.markAsUntouched();
    sidebarCmpRef.instance.formControl.setValue(color);

    expect(touchedSpy).not.toHaveBeenCalled();
    expect(dirtySpy).toHaveBeenCalled();
    expect(component.textForm.value.color).toEqual(color);

    /**
     * sidebarCmpRef.instance.formConrol.touched is TRUE
     */
    color = new RGBA(100, 200, 75, 1);
    sidebarCmpRef.instance.formControl.markAsTouched();
    sidebarCmpRef.instance.formControl.setValue(color);

    expect(touchedSpy).toHaveBeenCalled();
    expect(component.textForm.value.color).toEqual(color);

    /**
     * component.textForm.value.color is typeof RGBA
     */
    color = new RGBA(50, 45, 10, .9);
    component.textForm.patchValue({ color });
    component.showTextColorForm();

    expect(sidebarCmpRef.instance.formControl.value).toEqual(color);

  });

  it('should show fonts list', () => {

    const sidebarCmpRef = {
      instance: {
        formControl: null as FormControl,
        destroy$: new Subject(),
      },
    };

    editorComponent.insertToSlot.and.returnValue(sidebarCmpRef);

    component.showFontsList();

    expect(editorComponent.detail).toEqual({ back: 'Style', title: 'Font Family' });
    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(PebFontListComponent, PebEditorSlot.sidebarDetail);
    expect(sidebarCmpRef.instance.formControl).toBeDefined();
    expect(sidebarCmpRef.instance.formControl.value).toEqual(component.textForm.value);

    /**
     * change value of sidebarCmpRef.instance.formConrol
     */
    sidebarCmpRef.instance.formControl.patchValue({
      fontSize: 24,
      fontWeight: 700,
    });

    expect(component.textForm.get('fontSize').dirty).toBe(true);
    expect(component.textForm.get('fontSize').touched).toBe(true);
    expect(component.textForm.get('fontWeight').dirty).toBe(true);
    expect(component.textForm.get('fontWeight').touched).toBe(true);
    expect(component.textForm.value.fontSize).toBe(24);
    expect(component.textForm.value.fontWeight).toBe(700);

  });

});

describe('PebTextStyleDto', () => {

  it('should create peb text style dto', () => {

    const styles = {
      bold: false,
      italic: false,
      underline: true,
      strike: false,
    };

    /**
     * styles.bold is FALSE
     */
    expect(Object.assign({}, new PebTextStyleDto(styles))).toEqual({
      fontWeight: 400,
      italic: false,
      underline: true,
      strike: false,
    });

    /**
     * styles.bold is TRUE
     */
    styles.bold = true;
    expect(new PebTextStyleDto(styles).fontWeight).toBe(700);

  });

});
