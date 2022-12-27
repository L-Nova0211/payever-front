import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { PebColorPickerComponent } from './color-picker.component';
import { PebColorPickerDirective } from './color-picker.directive';
import { PebColorPickerService } from './color-picker.service';
import { Cmyk, ColorFormats, Hsla, Hsva, Rgba } from './formats';
import { SliderDimension } from './helpers';

describe('PebColorPickerComponent', () => {

  let fixture: ComponentFixture<PebColorPickerComponent>;
  let component: PebColorPickerComponent;
  let service: jasmine.SpyObj<PebColorPickerService>;
  let directive: jasmine.SpyObj<PebColorPickerDirective>;

  beforeEach(waitForAsync(() => {

    const serviceSpy = jasmine.createSpyObj<PebColorPickerService>('PebColorPickerService', [
      'setActive',
      'stringToHsva',
      'hsvaToRgba',
      'rgbaToHsva',
      'hsva2hsla',
      'hsla2hsva',
      'denormalizeRGBA',
      'denormalizeCMYK',
      'normalizeCMYK',
      'rgbaToCmyk',
      'cmykToRgb',
      'rgbaToHex',
      'outputFormat',
    ]);

    directive = jasmine.createSpyObj<PebColorPickerDirective>('PebColorPickerDirective', [
      'stateChanged',
      'sliderDragEnd',
      'sliderDragStart',
      'colorSelected',
      'cmykChanged',
      'colorChanged',
      'colorCanceled',
      'sliderChanged',
      'inputChanged',
      'presetColorsChanged',
    ]);

    TestBed.configureTestingModule({
      declarations: [
        PebColorPickerComponent,
      ],
      providers: [
        { provide: PebColorPickerService, useValue: serviceSpy },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebColorPickerComponent);
      component = fixture.componentInstance;

      component.show = true;
      component[`width`] = 500;
      component[`hsva`] = new Hsva(185, 95, 100, 1);
      component.setInitialColor('#333333');
      component[`directiveInstance`] = directive;

      service = TestBed.inject(PebColorPickerService) as jasmine.SpyObj<PebColorPickerService>;
      service.hsva2hsla.and.returnValue(new Hsla(185, 100, 53, 1));
      service.hsvaToRgba.and.returnValue(
        new Rgba(0.05, 0.92, 1, 1),
      );
      service.denormalizeRGBA.and.returnValue(new Rgba(13, 235, 255, 1));
      service.rgbaToHex.and.returnValue('#0DEBFF');

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle esc', () => {

    const cancelSpy = spyOn(component, 'onCancelColor');
    const event = { test: true };

    // cdDialogDisplay = inline
    component.cpDialogDisplay = 'inline';

    component.handleEsc(event);

    expect(cancelSpy).not.toHaveBeenCalled();

    // cdDialogDisplay = popup
    component.cpDialogDisplay = 'popup';

    component.handleEsc(event);

    expect(cancelSpy).toHaveBeenCalledWith(event as any);

  });

  it('should handle enter', () => {

    const acceptSpy = spyOn(component, 'onAcceptColor');
    const event = { test: true };

    // cdDialogDisplay = inline
    component.cpDialogDisplay = 'inline';

    component.handleEnter(event);

    expect(acceptSpy).not.toHaveBeenCalled();

    // cdDialogDisplay = popup
    component.cpDialogDisplay = 'popup';

    component.handleEnter(event);

    expect(acceptSpy).toHaveBeenCalledWith(event as any);

  });

  it('should set format and open dialog on init', () => {

    const openSpy = spyOn(component, 'openDialog');
    const mouswDownSpy = spyOn(component, 'onMouseDown');
    const resizeSpy = spyOn(component, 'onResize');
    const event = { test: true } as any;

    component.cpWidth = 90;

    // cpCmykEnabled = FALSE
    component.cpCmykEnabled = false;
    component.ngOnInit();

    expect(component[`sliderDimMax`]).toEqual(new SliderDimension(230, 90, 230, 156));
    expect(component.format).toEqual(ColorFormats.HEX);
    expect(openSpy).toHaveBeenCalledWith('#333333', false);

    // w/o hueSlider
    // w/o alphaWidth
    // cpOutputFormat = hsla
    component.hueSlider = {
      nativeElement: {
        offsetWidth: undefined,
      },
    };
    component.alphaSlider = {
      nativeElement: {
        offsetWidth: undefined,
      },
    };
    component.cpOutputFormat = 'hsla';
    component.ngOnInit();

    expect(component[`sliderDimMax`]).toEqual(new SliderDimension(140, 90, 230, 140));
    expect(component.format).toEqual(ColorFormats.HSLA);

    // cpOutputFormat = rgba
    component.cpOutputFormat = 'rgba';
    component.ngOnInit();

    expect(component.format).toEqual(ColorFormats.RGBA);

    // cpCmykEnabled = TRUE
    component.cpCmykEnabled = true;
    component.ngOnInit();

    expect(component.format).toEqual(ColorFormats.CMYK);

    // events
    component[`listenerMouseDown`](event);
    component[`listenerResize`]();

    expect(mouswDownSpy).toHaveBeenCalled();
    expect(resizeSpy).toHaveBeenCalled();

  });

  it('should close dialog on destroy', () => {

    const closeSpy = spyOn(component, 'closeDialog');

    component.ngOnDestroy();

    expect(closeSpy).toHaveBeenCalled();

  });

  it('should update color picker after view init', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const detectSpy = spyOn(component[`cdRef`], 'detectChanges');

    component.cpWidth = 230;
    component.cpDialogDisplay = 'popup';

    // cpDialogDisplay != inline
    component.ngAfterViewInit();

    expect(updateSpy).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();

    // cpDialogDisplay = inline
    // w/o hueSlider
    // w/o alphaWidth
    component.cpDialogDisplay = 'inline';
    component.hueSlider = {
      nativeElement: {
        offsetWidth: undefined,
      },
    };
    component.alphaSlider = {
      nativeElement: {
        offsetWidth: undefined,
      },
    };
    component.ngAfterViewInit();

    expect(component[`sliderDimMax`]).toEqual(new SliderDimension(140, 230, 230, 140));
    expect(updateSpy).toHaveBeenCalledWith(false);
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should open dialog', () => {

    const setInitialColorSpy = spyOn(component, 'setInitialColor');
    const setColorFromStringSpy = spyOn(component, 'setColorFromString');
    const openSpy = spyOn<any>(component, 'openColorPicker');
    const color = '#333333';

    component[`width`] = undefined;
    component[`directiveElementRef`] = {
      nativeElement: {
        offsetWidth: 320,
      },
    };

    // w/o width & height
    component.openDialog(color);

    expect(service.setActive).toHaveBeenCalled();
    expect(component.cpWidth).toEqual(320);
    expect(component[`height`]).toEqual(320);
    expect(setInitialColorSpy).toHaveBeenCalledWith(color);
    expect(setColorFromStringSpy).toHaveBeenCalledWith(color, true);
    expect(openSpy).toHaveBeenCalled();

    // w/ width & height
    component[`width`] = 300;
    component[`height`] = 300;
    component.openDialog(color);

  });

  it('should close dialog', () => {

    const closeSpy = spyOn<any>(component, 'closeColorPicker');

    component.closeDialog();

    expect(closeSpy).toHaveBeenCalled();

  });

  it('should setup dialog', () => {

    const setInitialColorSpy = spyOn(component, 'setInitialColor');
    const setColorModeSpy = spyOn(component, 'setColorMode');
    const setPresetConfig = spyOn(component, 'setPresetConfig');
    const args = {
      instance: directive,
      elementRef: new ElementRef(document.createElement('div')),
      color: '#333333',
      cpWidth: '230px',
      cpHeight: '300px',
      cpDialogDisplay: 'popup',
      cpFallbackColor: null,
      cpColorMode: 'hex',
      cpCmykEnabled: true,
      cpAlphaChannel: 'forced' as any,
      cpOutputFormat: 'hex' as any,
      cpDisableInput: false,
      cpIgnoredElements: [],
      cpSaveClickOutside: false,
      cpCloseClickOutside: true,
      cpUseRootViewContainer: false,
      cpPosition: 'auto',
      cpPositionOffset: '10',
      cpPositionRelativeToArrow: true,
      cpPresetLabel: 'Preset',
      cpPresetColors: ['#333333', '#222222'],
      cpPresetColorsClass: 'preset-color',
      cpMaxPresetColorsLength: 5,
      cpPresetEmptyMessage: 'No color',
      cpPresetEmptyMessageClass: 'preset-color-empty',
      cpOKButton: true,
      cpOKButtonClass: 'btn-cp-ok',
      cpOKButtonText: 'OK',
      cpCancelButton: true,
      cpCancelButtonClass: 'btn-cp-cancel',
      cpCancelButtonText: 'Cancel',
      cpAddColorButton: true,
      cpAddColorButtonClass: 'btn-cp-add',
      cpAddColorButtonText: 'Add color',
      cpRemoveColorButtonClass: 'btn-cp-remove',
    };

    // cpPositionRelativeToArrow = true
    // cpDialogDisplay != inline
    // cpAlphaChannel = forced
    component.setupDialog(
      args.instance,
      args.elementRef,
      args.color,
      args.cpWidth,
      args.cpHeight,
      args.cpDialogDisplay,
      args.cpFallbackColor,
      args.cpColorMode,
      args.cpCmykEnabled,
      args.cpAlphaChannel,
      args.cpOutputFormat,
      args.cpDisableInput,
      args.cpIgnoredElements,
      args.cpSaveClickOutside,
      args.cpCloseClickOutside,
      args.cpUseRootViewContainer,
      args.cpPosition,
      args.cpPositionOffset,
      args.cpPositionRelativeToArrow,
      args.cpPresetLabel,
      args.cpPresetColors,
      args.cpPresetColorsClass,
      args.cpMaxPresetColorsLength,
      args.cpPresetEmptyMessage,
      args.cpPresetEmptyMessageClass,
      args.cpOKButton,
      args.cpOKButtonClass,
      args.cpOKButtonText,
      args.cpCancelButton,
      args.cpCancelButtonClass,
      args.cpCancelButtonText,
      args.cpAddColorButton,
      args.cpAddColorButtonClass,
      args.cpAddColorButtonText,
      args.cpRemoveColorButtonClass,
    );

    expect(setInitialColorSpy).toHaveBeenCalledWith(args.color);
    expect(setColorModeSpy).toHaveBeenCalledWith(args.cpColorMode);
    expect(component[`isIE10`]).toBe(false);
    expect(component[`directiveInstance`]).toEqual(args.instance);
    expect(component[`directiveElementRef`]).toEqual(args.elementRef);
    expect(component.cpDisableInput).toEqual(args.cpDisableInput);
    expect(component.cpCmykEnabled).toEqual(args.cpCmykEnabled);
    expect(component.cpAlphaChannel).toEqual(args.cpAlphaChannel);
    expect(component.cpOutputFormat).toEqual(args.cpOutputFormat);
    expect(component.cpDialogDisplay).toEqual(args.cpDialogDisplay);
    expect(component.cpIgnoredElements).toEqual(args.cpIgnoredElements);
    expect(component.cpSaveClickOutside).toEqual(args.cpSaveClickOutside);
    expect(component.cpCloseClickOutside).toEqual(args.cpCloseClickOutside);
    expect(component[`useRootViewContainer`]).toEqual(args.cpUseRootViewContainer);
    expect(component.cpWidth).toEqual(parseInt(args.cpWidth, 10));
    expect(component.cpHeight).toEqual(parseInt(args.cpHeight, 10));
    expect(component.cpPosition).toEqual(args.cpPosition);
    expect(component.cpPositionOffset).toEqual(parseInt(args.cpPositionOffset, 10));
    expect(component.cpOKButton).toEqual(args.cpOKButton);
    expect(component.cpOKButtonText).toEqual(args.cpOKButtonText);
    expect(component.cpOKButtonClass).toEqual(args.cpOKButtonClass);
    expect(component.cpCancelButton).toEqual(args.cpCancelButton);
    expect(component.cpCancelButtonText).toEqual(args.cpCancelButtonText);
    expect(component.cpCancelButtonClass).toEqual(args.cpCancelButtonClass);
    expect(component[`fallbackColor`]).toEqual('#fff');
    expect(component.setPresetConfig).toHaveBeenCalledWith(args.cpPresetLabel, args.cpPresetColors);
    expect(component.cpPresetColorsClass).toEqual(args.cpPresetColorsClass);
    expect(component.cpMaxPresetColorsLength).toEqual(args.cpMaxPresetColorsLength);
    expect(component.cpPresetEmptyMessage).toEqual(args.cpPresetEmptyMessage);
    expect(component.cpPresetEmptyMessageClass).toEqual(args.cpPresetEmptyMessageClass);
    expect(component.cpAddColorButton).toEqual(args.cpAddColorButton);
    expect(component.cpAddColorButtonText).toEqual(args.cpAddColorButtonText);
    expect(component.cpAddColorButtonClass).toEqual(args.cpAddColorButtonClass);
    expect(component.cpRemoveColorButtonClass).toEqual(args.cpRemoveColorButtonClass);
    expect(component[`dialogArrowOffset`]).toBe(15);
    expect(component[`dialogArrowSize`]).toBe(10);
    expect(component[`dialogArrowOffset`]).toBe(15);
    expect(component.cpAlphaChannel).toEqual(args.cpAlphaChannel);

    // cpPositionRelativeToArrow = FALSE
    // cpDialogDisplay = inline
    // cpAlphaChannel = null
    args.cpPositionRelativeToArrow = false;
    args.cpDialogDisplay = 'inline';
    args.cpAlphaChannel = null;

    component.setupDialog(
      args.instance,
      args.elementRef,
      args.color,
      args.cpWidth,
      args.cpHeight,
      args.cpDialogDisplay,
      args.cpFallbackColor,
      args.cpColorMode,
      args.cpCmykEnabled,
      args.cpAlphaChannel,
      args.cpOutputFormat,
      args.cpDisableInput,
      args.cpIgnoredElements,
      args.cpSaveClickOutside,
      args.cpCloseClickOutside,
      args.cpUseRootViewContainer,
      args.cpPosition,
      args.cpPositionOffset,
      args.cpPositionRelativeToArrow,
      args.cpPresetLabel,
      args.cpPresetColors,
      args.cpPresetColorsClass,
      args.cpMaxPresetColorsLength,
      args.cpPresetEmptyMessage,
      args.cpPresetEmptyMessageClass,
      args.cpOKButton,
      args.cpOKButtonClass,
      args.cpOKButtonText,
      args.cpCancelButton,
      args.cpCancelButtonClass,
      args.cpCancelButtonText,
      args.cpAddColorButton,
      args.cpAddColorButtonClass,
      args.cpAddColorButtonText,
      args.cpRemoveColorButtonClass,
    );

    expect(component[`dialogArrowOffset`]).toBe(0);
    expect(component[`dialogArrowSize`]).toBe(0);
    expect(component[`dialogArrowOffset`]).toBe(0);
    expect(component.cpAlphaChannel).toEqual('disabled');

  });

  it('should set color mode', () => {

    // COLOR
    component.setColorMode('1');
    expect(component.cpColorMode).toBe(1);

    component.setColorMode('C');
    expect(component.cpColorMode).toBe(1);

    component.setColorMode('COLOR');
    expect(component.cpColorMode).toBe(1);

    // GREYSCALE
    component.setColorMode('2');
    expect(component.cpColorMode).toBe(2);

    component.setColorMode('G');
    expect(component.cpColorMode).toBe(2);

    component.setColorMode('GRAYSCALE');
    expect(component.cpColorMode).toBe(2);

    // PRESETS
    component.setColorMode('3');
    expect(component.cpColorMode).toBe(3);

    component.setColorMode('P');
    expect(component.cpColorMode).toBe(3);

    component.setColorMode('PRESETS');
    expect(component.cpColorMode).toBe(3);

    // UNDEFINED
    component.setColorMode('undefined');
    expect(component.cpColorMode).toBe(1);

  });

  it('should set initial color', () => {

    const color = '#222222';

    component.setInitialColor(color);

    expect(component[`initialColor`]).toEqual(color);

  });

  it('should set preset config', () => {

    const presetLabel = 'My Preset';
    const presetColors = ['#333333', '#222222'];

    component.setPresetConfig(presetLabel, presetColors);

    expect(component.cpPresetLabel).toEqual(presetLabel);
    expect(component.cpPresetColors).toEqual(presetColors);

  });

  it('should set color from string', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = 'rgba(12, 235, 255, 1)';
    const hsvaValue = new Hsva(185, 95, 100, 1);

    service.stringToHsva.and.returnValues(
      null,
      hsvaValue,
    );

    // cpAlphaChannel = forced
    // w/o component.hsva
    component[`hsva`] = null;
    component.cpAlphaChannel = 'forced';
    component.setColorFromString(value);

    expect(component[`hsva`]).toEqual(hsvaValue);
    expect(component[`sliderH`]).toBe(185);
    expect(updateSpy).toHaveBeenCalledWith(true, true);

    // w/ component.hsva
    service.stringToHsva.and.returnValue(hsvaValue);

    component.setColorFromString(value);

    // cpOutputFormat = hex
    // cpAlphaChannel = disabled
    component.cpOutputFormat = 'hex';
    component.cpAlphaChannel = 'disabled';
    component.setColorFromString(value);

    // w/o hsva & component.hsva
    service.stringToHsva.and.returnValues(
      null,
      new Hsva(0, 0, 100, 1),
    );

    component[`hsva`] = null;
    component.setColorFromString(value);

  });

  it('should set dialog position or close cp on resize', () => {

    const positionSpy = spyOn<any>(component, 'setDialogPosition');
    const closeSpy = spyOn<any>(component, 'closeColorPicker');

    // position != fixed
    // cpDialogDisplay = inline
    component.cpDialogDisplay = 'inline';
    component.onResize();

    expect(positionSpy).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();

    // cpDialogDisplay != inline
    component.cpDialogDisplay = 'popup';
    component.onResize();

    expect(closeSpy).toHaveBeenCalled();
    expect(positionSpy).not.toHaveBeenCalled();

    // position = fixed
    closeSpy.calls.reset();

    component.position = 'fixed';
    component.onResize();

    expect(positionSpy).toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();

  });

  it('should call directiveInstance.sliderDragEnd on drag end', () => {

    const slider = 'slider';
    const color = '#333333';

    component[`outputColor`] = color;
    component.onDragEnd(slider);

    expect(directive.sliderDragEnd).toHaveBeenCalledWith({ slider, color });

  });

  it('should call directiveInstance.sliderDragStart on drag start', () => {

    const slider = 'slider';
    const color = '#333333';

    component[`outputColor`] = color;
    component.onDragStart(slider);

    expect(directive.sliderDragStart).toHaveBeenCalledWith({ slider, color });

  });

  it('should handle mouse down', () => {

    const event = {
      target: document.createElement('div'),
    } as any;
    const isDescendantSpy = spyOn<any>(component, 'isDescendant');
    const setSpy = spyOn(component, 'setColorFromString');
    const closeSpy = spyOn<any>(component, 'closeColorPicker');

    component[`outputColor`] = '#333333';
    component.cpIgnoredElements = [document.createElement('span')];
    component[`directiveElementRef`] = new ElementRef(document.createElement('div'));

    // show = FALSE
    component.show = false;
    component.onMouseDown(event);

    expect(isDescendantSpy).not.toHaveBeenCalled();
    expect(directive.colorSelected).not.toHaveBeenCalled();
    expect(setSpy).not.toHaveBeenCalled();
    expect(directive.cmykChanged).not.toHaveBeenCalled();
    expect(directive.colorChanged).not.toHaveBeenCalled();
    expect(directive.colorCanceled).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();

    // show = TRUE
    // cpSaveClickOutside = FALSE
    // cpCloseClickOutside = FALSE
    // cpCmykEnabled = FALSE
    component.show = true;
    component.cpDialogDisplay = 'popup';
    component.cpSaveClickOutside = false;
    component.cpCloseClickOutside = false;
    component.cpCmykEnabled = false;
    component.onMouseDown(event);

    expect(isDescendantSpy).toHaveBeenCalled();
    expect(directive.colorSelected).not.toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalledWith('#333333', false);
    expect(directive.cmykChanged).not.toHaveBeenCalled();
    expect(directive.colorChanged).toHaveBeenCalledWith('#333333');
    expect(directive.colorCanceled).toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();

    // cpCloseClickOutside = TRUE
    // cpCmykEnabled = TRUE
    component.cpCloseClickOutside = true;
    component.cpCmykEnabled = true;
    component.onMouseDown(event);

    expect(directive.colorSelected).not.toHaveBeenCalled();
    expect(directive.cmykChanged).toHaveBeenCalledWith(undefined);
    expect(closeSpy).toHaveBeenCalled();

    // cpSaveClickOutside = TRUE
    component.cpSaveClickOutside = true;
    component.onMouseDown(event);

    expect(directive.colorSelected).toHaveBeenCalledWith('#333333');

  });

  it('should handle color accept', () => {

    const event = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
    };
    const closeSpy = spyOn<any>(component, 'closeColorPicker');

    // w/o outputColor
    // cpDialogDisplay = inline
    component[`outputColor`] = undefined;
    component.cpDialogDisplay = 'inline';
    component.onAcceptColor(event as any);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(directive.colorSelected).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();

    // w/ outputColor
    // cpDialogDisplay = popup
    component[`outputColor`] = '#333333';
    component.cpDialogDisplay = 'popup';
    component.onAcceptColor(event as any);

    expect(directive.colorSelected).toHaveBeenCalledWith('#333333');
    expect(closeSpy).toHaveBeenCalled();

  });

  it('should handle color cancel', () => {

    const event = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
    };
    const setSpy = spyOn(component, 'setColorFromString');
    const closeSpy = spyOn<any>(component, 'closeColorPicker');

    // cpDialogDisplay != popup
    component.cpDialogDisplay = 'inline';
    component.onCancelColor(event as any);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalledWith('#333333', true);
    expect(directive.cmykChanged).not.toHaveBeenCalled();
    expect(directive.colorChanged).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();
    expect(directive.colorCanceled).toHaveBeenCalled();

    // cpDialogDisplay = popup
    // cpCmykEnabled = FALSE
    component.cpDialogDisplay = 'popup';
    component.cpCmykEnabled = false;
    component.onCancelColor(event as any);

    expect(directive.cmykChanged).not.toHaveBeenCalled();
    expect(directive.colorChanged).toHaveBeenCalledWith('#333333', true);
    expect(closeSpy).toHaveBeenCalled();

    // cpCmykEnabled = TRUE
    component.cpCmykEnabled = true;
    component.onCancelColor(event as any);

    expect(directive.cmykChanged).toHaveBeenCalledWith(undefined);

  });

  it('should set format on format toggle', () => {

    component.format = ColorFormats.HEX;

    // cpCmykEnabled = TRUE
    component.cpCmykEnabled = true;
    component.onFormatToggle(2);

    expect(component.format).toEqual(ColorFormats.HSLA as any);

    // cpCmykEnabled = FALSE
    component.cpCmykEnabled = false;
    component.onFormatToggle(3);

    expect(component.format).toEqual(ColorFormats.HSLA as any);

  });

  it('it should handle color change', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { s: 100, v: 50, rgX: 2, rgY: 25 };
    const color = '#333333';

    component[`hsva`] = new Hsva(100, 50, 100, 1);
    component[`outputColor`] = color;
    component.onColorChange(value);

    expect(component[`hsva`].s).toBe(50);
    expect(component[`hsva`].v).toBe(2);
    expect(updateSpy).toHaveBeenCalled();
    expect(directive.sliderChanged).toHaveBeenCalledWith({
      color,
      slider: 'lightness',
      value: 2,
    });
    expect(directive.sliderChanged).toHaveBeenCalledWith({
      color,
      slider: 'saturation',
      value: 50,
    });

  });

  it('should handle hue change', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { v: 100, rgX: 2 };
    const color = '#333333';

    component[`hsva`] = new Hsva(100, 50, 100, 1);
    component[`outputColor`] = color;
    component.onHueChange(value);

    expect(component[`hsva`].h).toBe(50);
    expect(component[`sliderH`]).toBe(50);
    expect(updateSpy).toHaveBeenCalled();
    expect(directive.sliderChanged).toHaveBeenCalledWith({
      color,
      slider: 'hue',
      value: 50,
    });

  });

  it('should handle saturation change', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { v: 100, rgX: 2 };
    const color = '#333333';

    component[`hsva`] = new Hsva(100, 50, 100, 1);
    component[`outputColor`] = color;
    component.onSaturationChange(value);

    expect(component[`hsva`].s).toBe(50);
    expect(updateSpy).toHaveBeenCalled();
    expect(directive.sliderChanged).toHaveBeenCalledWith({
      color,
      slider: 'saturation',
      value: 50,
    });

  });

  it('should handle value change', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { v: 100, rgX: 2 };
    const color = '#333333';

    component[`hsva`] = new Hsva(100, 50, 100, 1);
    component[`outputColor`] = color;
    component.onValueChange(value);

    expect(component[`hsva`].s).toBe(50);
    expect(updateSpy).toHaveBeenCalled();
    expect(directive.sliderChanged).toHaveBeenCalledWith({
      color,
      slider: 'value',
      value: 50,
    });

  });

  it('should handle value change', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { v: 100, rgX: 2 };
    const color = '#333333';

    component[`hsva`] = new Hsva(100, 50, 100, 1);
    component[`outputColor`] = color;
    component.onAlphaChange(value);

    expect(component[`hsva`].s).toBe(50);
    expect(updateSpy).toHaveBeenCalled();
    expect(directive.sliderChanged).toHaveBeenCalledWith({
      color,
      slider: 'alpha',
      value: 50,
    });

  });

  it('should handle hex input', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const setSpy = spyOn(component, 'setColorFromString');
    const color = '#333333';
    let value = null;

    component[`outputColor`] = color;

    // value = null
    component.onHexInput(value);

    expect(updateSpy).toHaveBeenCalled();
    expect(setSpy).not.toHaveBeenCalled();
    expect(directive.inputChanged).not.toHaveBeenCalled();

    // value = ''
    // INVALID
    // cpAlphaChannel = disabled
    value = '';
    updateSpy.calls.reset();

    component.cpAlphaChannel = 'disabled';
    component.onHexInput(value);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(setSpy).not.toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      value,
      color,
      input: 'hex',
      valid: false,
    });

    // value = 333
    // VALID
    value = '333';

    component.onHexInput(value);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalledWith(color, true, false);
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      value: color,
      input: 'hex',
      valid: true,
    });

    // value = #333333FF
    // cpAlphaChannel = always
    value = '#333333FF';

    component.cpAlphaChannel = 'always';
    component.onHexInput(value);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalledWith(color, true, false);
    expect(directive.inputChanged).toHaveBeenCalledWith({
      value,
      color,
      input: 'hex',
      valid: true,
    });

    // value = #333333
    // cpAlphaChannel = forced
    value = '#333333';

    component.cpAlphaChannel = 'forced';
    component.onHexInput(value);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalledWith('#333333FF', true, false);
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      value: '#333333FF',
      input: 'hex',
      valid: true,
    });

  });

  it('should handle red input', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { v: undefined, rg: 24 };
    const color = '#333333';

    service.rgbaToHsva.and.returnValue(component[`hsva`]);

    component[`outputColor`] = color;

    // INVALID
    component.onRedInput(value);

    expect(service.hsvaToRgba).toHaveBeenCalled();
    expect(service.rgbaToHsva).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'red',
      valid: false,
      value: .05,
    });

    // VALID
    value.v = 12;

    component.onRedInput(value);

    expect(service.rgbaToHsva).toHaveBeenCalled();
    expect(component[`sliderH`]).toBe(185);
    expect(updateSpy).toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'red',
      valid: true,
      value: .5,
    });

  });

  it('should handle blue input', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { v: undefined, rg: 24 };
    const color = '#333333';

    service.rgbaToHsva.and.returnValue(component[`hsva`]);

    component[`outputColor`] = color;

    // INVALID
    component.onBlueInput(value);

    expect(service.hsvaToRgba).toHaveBeenCalled();
    expect(service.rgbaToHsva).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'blue',
      valid: false,
      value: 1,
    });

    // VALID
    value.v = 12;

    component.onBlueInput(value);

    expect(service.rgbaToHsva).toHaveBeenCalled();
    expect(component[`sliderH`]).toBe(185);
    expect(updateSpy).toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'blue',
      valid: true,
      value: .5,
    });

  });

  it('should handle green input', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { v: undefined, rg: 24 };
    const color = '#333333';

    service.rgbaToHsva.and.returnValue(component[`hsva`]);

    component[`outputColor`] = color;

    // INVALID
    component.onGreenInput(value);

    expect(service.hsvaToRgba).toHaveBeenCalled();
    expect(service.rgbaToHsva).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'green',
      valid: false,
      value: .92,
    });

    // VALID
    value.v = 12;

    component.onGreenInput(value);

    expect(service.rgbaToHsva).toHaveBeenCalled();
    expect(component[`sliderH`]).toBe(185);
    expect(updateSpy).toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'green',
      valid: true,
      value: .5,
    });

  });

  it('should handle hue input', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { v: undefined, rg: 24 };
    const color = '#333333';

    component[`outputColor`] = color;

    // INVALID
    component.onHueInput(value);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'hue',
      valid: false,
      value: 185,
    });

    // VALID
    value.v = 12;

    component.onHueInput(value);

    expect(component[`sliderH`]).toBe(.5);
    expect(updateSpy).toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'hue',
      valid: true,
      value: .5,
    });

  });

  it('should handle value input', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { v: undefined, rg: 24 };
    const color = '#333333';

    component[`outputColor`] = color;

    // INVALID
    component.onValueInput(value);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'value',
      valid: false,
      value: 100,
    });

    // VALID
    value.v = 12;

    component.onValueInput(value);

    expect(updateSpy).toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'value',
      valid: true,
      value: .5,
    });

  });

  it('should handle alpha input', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { v: undefined, rg: 24 };
    const color = '#333333';

    component[`outputColor`] = color;

    // INVALID
    component.onAlphaInput(value);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'alpha',
      valid: false,
      value: 1,
    });

    // VALID
    value.v = 1200;

    component.onAlphaInput(value);

    expect(updateSpy).toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'alpha',
      valid: true,
      value: .5,
    });

  });

  it('should handle lightness input', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { v: undefined, rg: 24 };
    const color = '#333333';

    service.hsla2hsva.and.returnValue(component[`hsva`]);

    component[`outputColor`] = color;

    // INVALID
    component.onLightnessInput(value);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'lightness',
      valid: false,
      value: 53,
    });

    // VALID
    value.v = 12;

    component.onLightnessInput(value);

    expect(component[`sliderH`]).toBe(185);
    expect(updateSpy).toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'lightness',
      valid: true,
      value: .5,
    });

  });

  it('should handle saturation input', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { v: undefined, rg: 24 };
    const color = '#333333';

    service.hsla2hsva.and.returnValue(component[`hsva`]);

    component[`outputColor`] = color;

    // INVALID
    component.onSaturationInput(value);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'saturation',
      valid: false,
      value: 100,
    });

    // VALID
    value.v = 12;

    component.onSaturationInput(value);

    expect(component[`sliderH`]).toBe(185);
    expect(updateSpy).toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'saturation',
      valid: true,
      value: .5,
    });

  });

  it('should handle cyan input', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { v: undefined, rg: 24 };
    const color = '#333333';

    component[`cmyk`] = new Cmyk(95, 8, 0, 0);
    component[`outputColor`] = color;

    // INVALID
    component.onCyanInput(value);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'cyan',
      valid: true,
      value: 95,
    });

    // VALID
    value.v = 12;

    component.onCyanInput(value);

    expect(updateSpy).toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'cyan',
      valid: true,
      value: 12,
    });

  });

  it('should handle magenta input', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { v: undefined, rg: 24 };
    const color = '#333333';

    component[`cmyk`] = new Cmyk(95, 8, 0, 0);
    component[`outputColor`] = color;

    // INVALID
    component.onMagentaInput(value);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'magenta',
      valid: true,
      value: 8,
    });

    // VALID
    value.v = 12;

    component.onMagentaInput(value);

    expect(updateSpy).toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'magenta',
      valid: true,
      value: 12,
    });

  });

  it('should handle yellow input', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { v: undefined, rg: 24 };
    const color = '#333333';

    component[`cmyk`] = new Cmyk(95, 8, 0, 0);
    component[`outputColor`] = color;

    // INVALID
    component.onYellowInput(value);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'yellow',
      valid: true,
      value: 0,
    });

    // VALID
    value.v = 12;

    component.onYellowInput(value);

    expect(updateSpy).toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'yellow',
      valid: true,
      value: 12,
    });

  });

  it('should handle black input', () => {

    const updateSpy = spyOn<any>(component, 'updateColorPicker');
    const value = { v: undefined, rg: 24 };
    const color = '#333333';

    component[`cmyk`] = new Cmyk(95, 8, 0, 0);
    component[`outputColor`] = color;

    // INVALID
    component.onBlackInput(value);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'black',
      valid: true,
      value: 0,
    });

    // VALID
    value.v = 12;

    component.onBlackInput(value);

    expect(updateSpy).toHaveBeenCalled();
    expect(directive.inputChanged).toHaveBeenCalledWith({
      color,
      input: 'black',
      valid: true,
      value: 12,
    });

  });

  it('should handle add preset color', () => {

    const event = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
    };
    const presetTitle = 'My Preset';
    const presetColors = ['#333333', '#222222'];

    component.setPresetConfig(presetTitle, presetColors);

    // preset colors have value
    component.onAddPresetColor(event, '#333333');

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(directive.presetColorsChanged).not.toHaveBeenCalled();

    // preset color DO NOT have value
    component.onAddPresetColor(event, '#cccccc');

    expect(event.stopPropagation).toHaveBeenCalledTimes(2);
    expect(component[`cpPresetColors`].includes('#cccccc')).toBe(true);
    expect(directive.presetColorsChanged).toHaveBeenCalledWith([...presetColors, '#cccccc']);

  });

  it('should handle remove preset color', () => {

    const event = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
    };
    const presetTitle = 'My Preset';
    const presetColors = ['#333333', '#222222'];

    component.setPresetConfig(presetTitle, presetColors);

    component.onRemovePresetColor(event, '#333333');

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component[`cpPresetColors`]).toEqual(['#222222']);
    expect(directive.presetColorsChanged).toHaveBeenCalledWith(['#222222']);

  });

  it('should open color picker', fakeAsync(() => {

    const docAddListenerSpy = spyOn(document, 'addEventListener');
    const winAddListenerSpy = spyOn(window, 'addEventListener');
    const detectSpy = spyOn(component[`cdRef`], 'detectChanges');
    const setSpy = spyOn<any>(component, 'setDialogPosition');

    // show = TRUE
    component[`openColorPicker`]();

    expect(setSpy).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();
    expect(directive.stateChanged).not.toHaveBeenCalled();
    expect(docAddListenerSpy).not.toHaveBeenCalled();
    expect(winAddListenerSpy).not.toHaveBeenCalled();

    // show = FALSE
    // IE10 = TRUE
    component.show = false;
    component[`isIE10`] = true;
    component[`openColorPicker`]();

    tick();

    expect(component.show).toBe(true);
    expect(component.hidden).toBe(false);
    expect(setSpy).toHaveBeenCalled();
    expect(detectSpy).toHaveBeenCalled();
    expect(directive.stateChanged).toHaveBeenCalledWith(true);
    expect(winAddListenerSpy).toHaveBeenCalledWith('resize', component[`listenerResize`]);
    expect(docAddListenerSpy).not.toHaveBeenCalled();

    // IE10 = FALSE
    component.show = false;
    component[`isIE10`] = false;
    component[`openColorPicker`]();

    tick();

    expect(docAddListenerSpy).toHaveBeenCalledWith('mousedown', component[`listenerMouseDown`]);
    expect(docAddListenerSpy).toHaveBeenCalledWith('touchstart', component[`listenerMouseDown`]);

  }));

  it('shoudl close color picker', () => {

    const docRemoveListenerSpy = spyOn(document, 'removeEventListener');
    const winRemoveListenerSpy = spyOn(window, 'removeEventListener');
    const detectSpy = spyOn(component[`cdRef`], 'detectChanges');

    // show = FALSE
    component.show = false;
    component[`closeColorPicker`]();

    expect(directive.stateChanged).not.toHaveBeenCalled();
    expect(docRemoveListenerSpy).not.toHaveBeenCalled();
    expect(winRemoveListenerSpy).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();

    // show = TRUE
    // IE10 = TRUE
    // cdr.destroyed = TRUE
    component.show = true;
    component[`isIE10`] = true;
    Object.defineProperty(component[`cdRef`], 'destroyed', { value: true });
    component[`closeColorPicker`]();

    expect(component.show).toBe(false);
    expect(directive.stateChanged).toHaveBeenCalledWith(false);
    expect(docRemoveListenerSpy).not.toHaveBeenCalled();
    expect(winRemoveListenerSpy).toHaveBeenCalledWith('resize', component[`listenerResize`]);
    expect(detectSpy).not.toHaveBeenCalled();

    // IE10 = FALSE
    // cdr.destroyed = FALSE
    component.show = true;
    component[`isIE10`] = false;
    Object.defineProperty(component[`cdRef`], 'destroyed', { value: false });
    component[`closeColorPicker`]();

    expect(docRemoveListenerSpy).toHaveBeenCalledWith('mousedown', component[`listenerMouseDown`]);
    expect(docRemoveListenerSpy).toHaveBeenCalledWith('touchstart', component[`listenerMouseDown`]);
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should update color picker', () => {

    service.denormalizeCMYK.and.returnValue(new Cmyk(9500, 800, 0, 0, 1));

    // w/o sliderDimMax
    component[`updateColorPicker`]();

    expect(service.outputFormat).not.toHaveBeenCalled();

    // w/ sliderDimMax
    // cpCmykEnabled = TRUE
    component[`sliderDimMax`] = new SliderDimension(140, 230, 230, 140);
    component.cpCmykEnabled = true;
    component.cpColorMode = ColorFormats.HSLA;
    component[`updateColorPicker`]();

    expect(component[`hsva`].s).toBe(0);
    expect(component[`sliderH`]).toBe(185);
    expect(component.hexText).toEqual('#0DEBFF');
    expect(component.hexAlpha).toBe(1);
    expect(component.hueSliderColor).toEqual('rgb(13,235,255)');
    expect(component[`cmykColor`]).toEqual('');
    expect(directive.cmykChanged).not.toHaveBeenCalled();
    expect(directive.colorCanceled).not.toHaveBeenCalled();

    // cmykInput = TRUE
    // update = FALSE
    // format = cmyk
    service.rgbaToHsva.and.returnValue(component[`hsva`]);

    component.format = ColorFormats.CMYK;
    component.cpCmykEnabled = false;
    component[`outputColor`] = '#333333';
    component[`updateColorPicker`](true, false, true);

    expect(component.cmykText).toEqual(new Cmyk(9500, 800, 0, 0, 1));
    expect(directive.colorChanged).toHaveBeenCalledWith(undefined);
    expect(directive.cmykChanged).not.toHaveBeenCalled();

    // cpAlphaChannel = forced
    component.cpAlphaChannel = 'forced';
    component.cpCmykEnabled = true;
    component[`outputColor`] = '#333333';
    component[`updateColorPicker`](true, false, true);

    expect(component[`cmykColor`]).toEqual('cmyka(9500,800,0,0,1)');
    expect(directive.cmykChanged).toHaveBeenCalledWith('cmyka(9500,800,0,0,1)');

    // cpOutputFormat = auto
    // format = cmyk
    component.cpOutputFormat = 'auto';
    component.format = ColorFormats.CMYK;
    component[`updateColorPicker`](false, false, true);

    expect(component.format).toEqual(ColorFormats.CMYK);

    // format = hex
    // hsva.a = 1
    component.format = ColorFormats.HEX;
    component[`updateColorPicker`](false, false, true);

    expect(component.format).toEqual(ColorFormats.HEX);

    // hsva.a < 1
    component[`hsva`].a = .5;
    component[`updateColorPicker`](false, false, true);

    expect(component.format).toEqual(ColorFormats.RGBA as any);

  });

  it('should set dialog position', () => {

    const dirElem = document.createElement('div');
    component[`elRef`].nativeElement.appendChild(dirElem);

    // cpDialogDisplay = inline
    component.cpDialogDisplay = 'inline';
    component[`setDialogPosition`]();

    expect(component.position).toEqual('relative');

    // cpDialogDisplay = popup
    component.cpDialogDisplay = 'popup';
    component[`directiveElementRef`] = new ElementRef(dirElem);
    component[`setDialogPosition`]();

  });

  it('should check is descendant', () => {

    const parent = {
      id: 'p-002',
    };
    const child = {
      id: 'c-001',
      parentNode: {
        id: 'p-002',
        parentNode: parent,
      },
    };

    // TRUE
    expect(component[`isDescendant`](parent, child)).toBe(true);

    // FALSE
    child.parentNode = null;

    expect(component[`isDescendant`](parent, child)).toBe(false);

  });

  it('should create dialog box', () => {

    const element = {
      getBoundingClientRect: jasmine.createSpy('getBoundingClientRect').and.returnValue({
        top: 10,
        left: 10,
      }),
      offsetWidth: 100,
      offsetHeight: 100,
    };

    // offset = TRUE
    expect(component[`createDialogBox`](element, true)).toEqual({
      top: 10,
      left: 10,
      width: 100,
      height: 100,
    });

    // offset = FALSE
    expect(component[`createDialogBox`](element, false)).toEqual({
      top: 10,
      left: 10,
      width: 100,
      height: 100,
    });

  });

});
