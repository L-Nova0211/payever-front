import { ApplicationRef, ComponentFactoryResolver, ElementRef, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PebColorPickerDirective } from './color-picker.directive';

class MockClass {

  vcRef: any;

  constructor() {
    this.vcRef = {
      createComponent: jasmine.createSpy('createComponent').and.returnValue({
        instance: {
          setupDialog: jasmine.createSpy('setupDialog'),
          openDialog: jasmine.createSpy('openDialog'),
          closeDialog: jasmine.createSpy('closeDialog'),
          setInitialColor: jasmine.createSpy('setInitialColor'),
          setColorFromString: jasmine.createSpy('setColorFromString'),
          setPresetConfig: jasmine.createSpy('setPresetConfig'),
        },
        changeDetectorRef: {
          detectChanges: jasmine.createSpy('detectChanges'),
        },
      }),
    };
  }
}

describe('PebColorPickerDirective', () => {

  let directive: PebColorPickerDirective;
  let compFactory: any;
  let cmpRef: any;
  let cfr: jasmine.SpyObj<ComponentFactoryResolver>;
  let appRef: jasmine.SpyObj<ApplicationRef>;
  let vcRef: ViewContainerRef;
  let elementRef: ElementRef;

  beforeEach(() => {

    cfr = jasmine.createSpyObj<ComponentFactoryResolver>('ComponentFactoryResolver', [
      'resolveComponentFactory',
    ]);
    cmpRef = {
      hostView: {
        rootNodes: [
          document.createElement('div'),
        ],
      },
      instance: {
        setupDialog: jasmine.createSpy('setupDialog'),
        openDialog: jasmine.createSpy('openDialog'),
        closeDialog: jasmine.createSpy('closeDialog'),
        setInitialColor: jasmine.createSpy('setInitialColor'),
        setColorFromString: jasmine.createSpy('setColorFromString'),
        setPresetConfig: jasmine.createSpy('setPresetConfig'),
        show: true,
      },
      changeDetectorRef: {
        detectChanges: jasmine.createSpy('detectChanges'),
      },
      destroy: jasmine.createSpy('destroy'),
    };
    compFactory = {
      create: jasmine.createSpy('create').and.returnValue(cmpRef),
    };
    cfr.resolveComponentFactory.and.returnValue(compFactory);

    appRef = jasmine.createSpyObj<ApplicationRef>('ApplicationRef', [
      'attachView',
      'detachView',
    ]);

    elementRef = new ElementRef(document.createElement('div'));

    vcRef = {
      parentInjector: TestBed,
      createComponent: jasmine.createSpy('createComponent').and.returnValue(cmpRef),
    } as any;

    TestBed.configureTestingModule({
      providers: [MockClass],
    });

    directive = new PebColorPickerDirective(
      TestBed,
      cfr as any,
      appRef as any,
      vcRef,
      elementRef,
      {} as any,
    );

  });

  it('should be defined', () => {

    expect(directive).toBeDefined();

  });

  it('should call inputFocus on click and focus event', () => {

    const focusSpy = spyOn(directive, 'inputFocus');

    directive.handleClick();

    expect(focusSpy).toHaveBeenCalled();

    directive.handleFocus();

    expect(focusSpy).toHaveBeenCalledTimes(2);

  });

  it('should call inputChange on input event', () => {

    const changeSpy = spyOn(directive, 'inputChange');
    const event = new InputEvent('test');

    directive.handleInput(event);

    expect(changeSpy).toHaveBeenCalledWith(event);

  });

  it('should destroy', () => {

    // w/o cmpRef
    directive.ngOnDestroy();

    expect(appRef.detachView).not.toHaveBeenCalled();
    expect(cmpRef.destroy).not.toHaveBeenCalled();

    // w/ cmpRef
    // viewAttachedToAppRef = FALSE
    directive[`cmpRef`] = cmpRef;
    directive.ngOnDestroy();

    expect(appRef.detachView).not.toHaveBeenCalled();
    expect(cmpRef.destroy).toHaveBeenCalled();
    expect(directive[`cmpRef`]).toBeNull();
    expect(directive[`dialog`]).toBeNull();

    // viewAttachedToAppRef = TRUE
    directive[`cmpRef`] = cmpRef;
    directive[`viewAttachedToAppRef`] = true;
    directive.ngOnDestroy();

    expect(appRef.detachView).toHaveBeenCalled();

  });

  it('should control dialog on changes', () => {

    const openSpy = spyOn(directive, 'openDialog');
    const closeSpy = spyOn(directive, 'closeDialog');
    const dialog = cmpRef.instance;

    // cpToggle = TRUE
    // cpDisabled = TRUE
    let changes = {
      cpToggle: {
        currentValue: true,
      },
    } as any;
    directive.cpDisabled = true;

    directive.ngOnChanges(changes);

    expect(openSpy).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();

    // cpDisabled = FALSE
    directive.cpDisabled = false;

    directive.ngOnChanges(changes);

    expect(openSpy).toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();

    // cpToggle = FALSE
    openSpy.calls.reset();
    changes.cpToggle.currentValue = false;

    directive.ngOnChanges(changes);

    expect(closeSpy).toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();

    // cpPresetColors changes
    // w/o dialog
    changes = {
      cpPresetColors: {
        currentValue: ['#333333'],
      },
    };

    directive.ngOnChanges(changes);

    // w/ dialog
    directive[`dialog`] = dialog;
    directive.ngOnChanges(changes);

    expect(dialog.setPresetConfig).toHaveBeenCalledWith('Preset colors', undefined);

    // pebColorPicker changes
    // ignoreChanges = TRUE
    changes = {
      pebColorPicker: {
        currentValue: '#333333',
      },
    };
    directive[`ignoreChanges`] = true;
    directive[`cpUseRootViewContainer`] = true;
    directive[`cmpRef`] = cmpRef;

    directive.ngOnChanges(changes);

    expect(directive[`ignoreChanges`]).toBe(false);

    // cpDialogDisplay = popup
    directive.ngOnChanges(changes);

    expect(dialog.setInitialColor).not.toHaveBeenCalled();
    expect(dialog.setColorFromString).toHaveBeenCalledWith('#333333', false);
    expect(cmpRef.changeDetectorRef.detectChanges).toHaveBeenCalled();

    // cpDialogDisplay = inline
    cmpRef.changeDetectorRef.detectChanges.calls.reset();
    changes.pebColorPicker.currentValue = '#222222';

    directive.cpDialogDisplay = 'inline';
    directive.ngOnChanges(changes);

    expect(dialog.setInitialColor).toHaveBeenCalledWith('#222222');
    expect(dialog.setColorFromString).toHaveBeenCalledWith('#222222', false);
    expect(cmpRef.changeDetectorRef.detectChanges).not.toHaveBeenCalled();

  });

  it('should open dialog', () => {

    const dialog = cmpRef.instance;

    // dialogCreated = TRUE
    // w/o dialog
    directive[`dialogCreated`] = true;
    directive.openDialog();

    expect(dialog.openDialog).not.toHaveBeenCalled();
    expect(cfr.resolveComponentFactory).not.toHaveBeenCalled();

    // w/ dialog
    directive[`dialog`] = dialog;
    directive.pebColorPicker = '#333333';
    directive.openDialog();

    expect(dialog.openDialog).toHaveBeenCalledWith('#333333');

    // dialogCreated = FALSE
    // cpUseRootViewContainer = FALSE
    // this.vcRef = vcRef
    directive[`dialogCreated`] = false;
    directive[`dialog`] = null;
    directive.openDialog();

    expect(directive[`dialogCreated`]).toBe(true);
    expect(directive[`viewAttachedToAppRef`]).toBe(false);
    expect(vcRef.createComponent).toHaveBeenCalled();
    expect(dialog.setupDialog).toHaveBeenCalled();
    expect(directive[`dialog`]).toEqual(dialog);
    expect(cmpRef.changeDetectorRef.detectChanges).not.toHaveBeenCalled();
    expect(compFactory.create).not.toHaveBeenCalled();
    expect(appRef.attachView).not.toHaveBeenCalled();

    // cpUseRootViewContainer = TRUE
    // appInstance = Injector.NULL
    appRef[`componentTypes` as any] = [ElementRef];

    directive[`dialogCreated`] = false;
    directive[`cpUseRootViewContainer`] = true;
    directive.openDialog();

    expect(directive[`viewAttachedToAppRef`]).toBe(true);
    expect(compFactory.create).toHaveBeenCalled();
    expect(appRef.attachView).toHaveBeenCalled();

    // this.vcRef != vcRef
    // appInstance != Injector.NULL
    appRef[`componentTypes` as any] = [MockClass];

    directive[`dialogCreated`] = false;
    directive.openDialog();

  });

  it('should close dialog', () => {

    const dialog = cmpRef.instance;

    // cpDialogDisplay = inline
    directive[`dialog`] = dialog;
    directive.cpDialogDisplay = 'inline';
    directive.closeDialog();

    expect(dialog.closeDialog).not.toHaveBeenCalled();

    // cpDialogDisplay = popup
    directive.cpDialogDisplay = 'popup';
    directive.closeDialog();

    expect(dialog.closeDialog).toHaveBeenCalled();

  });

  it('should handle cmyk color changed', () => {

    const value = 'test';
    const emitSpy = spyOn(directive.cpCmykColorChange, 'emit');

    directive.cmykChanged(value);

    expect(emitSpy).toHaveBeenCalled();

  });

  it('should handle state changed', () => {

    const changeSpy = spyOn(directive.cpToggleChange, 'emit');
    const openSpy = spyOn(directive.colorPickerOpen, 'emit');
    const closeSpy = spyOn(directive.colorPickerClose, 'emit');

    directive.pebColorPicker = '#333333';

    // TRUE
    directive.stateChanged(true);

    expect(changeSpy).toHaveBeenCalledWith(true);
    expect(openSpy).toHaveBeenCalledWith('#333333');
    expect(closeSpy).not.toHaveBeenCalled();

    // FALSE
    openSpy.calls.reset();

    directive.stateChanged(false);

    expect(changeSpy).toHaveBeenCalledWith(false);
    expect(closeSpy).toHaveBeenCalledWith('#333333');
    expect(openSpy).not.toHaveBeenCalled();

  });

  it('should handle color changed', () => {

    const emitSpy = spyOn(directive.colorPickerChange, 'emit');

    directive.colorChanged('#333333');

    expect(directive[`ignoreChanges`]).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith('#333333');

  });

  it('should handle color selected', () => {

    const emitSpy = spyOn(directive.colorPickerSelect, 'emit');

    directive.colorSelected('#333333');

    expect(emitSpy).toHaveBeenCalledWith('#333333');

  });

  it('should handle color cancelled', () => {

    const emitSpy = spyOn(directive.colorPickerCancel, 'emit');

    directive.colorCanceled();

    expect(emitSpy).toHaveBeenCalled();

  });

  it('should focus on input', () => {

    const openSpy = spyOn(directive, 'openDialog');
    const closeSpy = spyOn(directive, 'closeDialog');
    const dialog = cmpRef.instance;

    // w/ ignored
    directive.cpIgnoredElements = [elementRef.nativeElement];
    directive.inputFocus();

    expect(openSpy).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();

    // w/o ignored
    // w/ dialog
    // dialog.show = TRUE
    directive[`dialog`] = dialog;
    directive.cpIgnoredElements = [];
    directive.inputFocus();

    expect(closeSpy).toHaveBeenCalled();

    // dialog.show = FALSE
    dialog.show = false;

    directive.inputFocus();

    expect(openSpy).toHaveBeenCalledTimes(1);

    // activeElement = elmRef.nativeElement
    Object.defineProperty(document, 'activeElement', { value: elementRef.nativeElement });

    directive.inputFocus();

    expect(openSpy).toHaveBeenCalledTimes(2);

  });

  it('should handle input change', () => {

    const event = {
      target: {
        value: '#333333',
      },
    };
    const dialog = cmpRef.instance;
    const emitSpy = spyOn(directive.colorPickerChange, 'emit');

    // w/o dialog
    directive.inputChange(event);

    expect(directive.pebColorPicker).toEqual('#333333');
    expect(emitSpy).toHaveBeenCalledWith('#333333');

    // w/ dialog
    directive[`dialog`] = dialog;
    directive.inputChange(event);

    expect(dialog.setColorFromString).toHaveBeenCalledWith('#333333', true);

  });

  it('should handle input changed', () => {

    const event = { test: true };
    const emitSpy = spyOn(directive.cpInputChange, 'emit');

    directive.inputChanged(event);

    expect(emitSpy).toHaveBeenCalledWith(event as any);

  });

  it('should handle slider changed', () => {

    const event = { test: true };
    const emitSpy = spyOn(directive.cpSliderChange, 'emit');

    directive.sliderChanged(event);

    expect(emitSpy).toHaveBeenCalledWith(event as any);

  });

  it('should handle slider drag end', () => {

    const event = {
      slider: 'slider',
      color: '#333333',
    };
    const emitSpy = spyOn(directive.cpSliderDragEnd, 'emit');

    directive.sliderDragEnd(event);

    expect(emitSpy).toHaveBeenCalledWith(event);

  });

  it('should handle slider drag start', () => {

    const event = {
      slider: 'slider',
      color: '#333333',
    };
    const emitSpy = spyOn(directive.cpSliderDragStart, 'emit');

    directive.sliderDragStart(event);

    expect(emitSpy).toHaveBeenCalledWith(event);

  });

  it('should handle preset colors changed', () => {

    const value = ['#333333'];
    const emitSpy = spyOn(directive.cpPresetColorsChange, 'emit');

    directive.presetColorsChanged(value);

    expect(emitSpy).toHaveBeenCalledWith(value);

  });

});
