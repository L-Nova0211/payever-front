import { Directive, OnChanges, OnDestroy, Input, Output, EventEmitter,
  HostListener, ApplicationRef, ComponentRef, ElementRef, ViewContainerRef,
  Injector, ReflectiveInjector, ComponentFactoryResolver, EmbeddedViewRef } from '@angular/core';

import { PebColorPickerComponent } from './color-picker.component';
import { PebColorPickerService } from './color-picker.service';
import { AlphaChannel, ColorMode, OutputFormat } from './helpers';

@Directive({
  selector: '[pebColorPicker]',
  exportAs: 'ngxColorPicker',
})
export class PebColorPickerDirective implements OnChanges, OnDestroy {
  private dialog: any;

  private dialogCreated = false;
  private ignoreChanges = false;

  private cmpRef: ComponentRef<PebColorPickerComponent>;
  private viewAttachedToAppRef = false;

  @Input() pebColorPicker: string;

  @Input() cpWidth = '230px';
  @Input() cpHeight = 'auto';

  @Input() cpToggle = false;
  @Input() cpDisabled = false;

  @Input() cpIgnoredElements: any = [];

  @Input() cpFallbackColor = '';

  @Input() cpColorMode: ColorMode = 'color';

  @Input() cpCmykEnabled = false;

  @Input() cpOutputFormat: OutputFormat = 'auto';
  @Input() cpAlphaChannel: AlphaChannel = 'enabled';

  @Input() cpDisableInput = false;

  @Input() cpDialogDisplay = 'popup';

  @Input() cpSaveClickOutside = true;
  @Input() cpCloseClickOutside = true;

  @Input() cpUseRootViewContainer = false;

  @Input() cpPosition = 'auto';
  @Input() cpPositionOffset = '0%';
  @Input() cpPositionRelativeToArrow = false;

  @Input() cpOKButton = false;
  @Input() cpOKButtonText = 'OK';
  @Input() cpOKButtonClass = 'cp-ok-button-class';

  @Input() cpCancelButton = false;
  @Input() cpCancelButtonText = 'Cancel';
  @Input() cpCancelButtonClass = 'cp-cancel-button-class';

  @Input() cpPresetLabel = 'Preset colors';
  @Input() cpPresetColors: string[];
  @Input() cpPresetColorsClass = 'cp-preset-colors-class';
  @Input() cpMaxPresetColorsLength = 6;

  @Input() cpPresetEmptyMessage = 'No colors added';
  @Input() cpPresetEmptyMessageClass = 'preset-empty-message';

  @Input() cpAddColorButton = false;
  @Input() cpAddColorButtonText = 'Add color';
  @Input() cpAddColorButtonClass = 'cp-add-color-button-class';

  @Input() cpRemoveColorButtonClass = 'cp-remove-color-button-class';

  @Output() cpInputChange = new EventEmitter<{input: string, value: number | string, color: string}>(true);

  @Output() cpToggleChange = new EventEmitter<boolean>(true);

  @Output() cpSliderChange = new EventEmitter<{slider: string, value: string | number, color: string}>(true);
  @Output() cpSliderDragEnd = new EventEmitter<{slider: string, color: string}>(true);
  @Output() cpSliderDragStart = new EventEmitter<{slider: string, color: string}>(true);

  @Output() colorPickerOpen = new EventEmitter<string>(true);
  @Output() colorPickerClose = new EventEmitter<string>(true);

  @Output() colorPickerCancel = new EventEmitter<string>(true);
  @Output() colorPickerSelect = new EventEmitter<string>(true);
  @Output() colorPickerChange = new EventEmitter<string>(false);

  @Output() cpCmykColorChange = new EventEmitter<string>(true);

  @Output() cpPresetColorsChange = new EventEmitter<any>(true);

  @HostListener('click') handleClick(): void {
    this.inputFocus();
  }

  @HostListener('focus') handleFocus(): void {
    this.inputFocus();
  }

  @HostListener('input', ['$event']) handleInput(event: any): void {
    this.inputChange(event);
  }

  constructor(private injector: Injector, private cfr: ComponentFactoryResolver,
    private appRef: ApplicationRef, private vcRef: ViewContainerRef, private elRef: ElementRef,
    private _service: PebColorPickerService) {}

  ngOnDestroy(): void {
    if (this.cmpRef != null) {
      if (this.viewAttachedToAppRef) {
        this.appRef.detachView(this.cmpRef.hostView);
      }

      this.cmpRef.destroy();

      this.cmpRef = null;
      this.dialog = null;
    }
  }

  ngOnChanges(changes: any): void {
    if (changes.cpToggle && !this.cpDisabled) {
      if (changes.cpToggle.currentValue) {
        this.openDialog();
      } else if (!changes.cpToggle.currentValue) {
        this.closeDialog();
      }
    }

    if (changes.pebColorPicker) {
      if (this.dialog && !this.ignoreChanges) {
        if (this.cpDialogDisplay === 'inline') {
          this.dialog.setInitialColor(changes.pebColorPicker.currentValue);
        }

        this.dialog.setColorFromString(changes.pebColorPicker.currentValue, false);

        if (this.cpUseRootViewContainer && this.cpDialogDisplay !== 'inline') {
          this.cmpRef.changeDetectorRef.detectChanges();
        }
      }

      this.ignoreChanges = false;
    }

    if (changes.cpPresetLabel || changes.cpPresetColors) {
      if (this.dialog) {
        this.dialog.setPresetConfig(this.cpPresetLabel, this.cpPresetColors);
      }
    }
  }

  public openDialog(): void {
    if (!this.dialogCreated) {
      let vcRef = this.vcRef;

      this.dialogCreated = true;
      this.viewAttachedToAppRef = false;

      if (this.cpUseRootViewContainer && this.cpDialogDisplay !== 'inline') {
        const classOfRootComponent = this.appRef.componentTypes[0];
        const appInstance = this.injector.get(classOfRootComponent, Injector.NULL);

        if (appInstance !== Injector.NULL) {
          vcRef = appInstance.vcRef || appInstance.viewContainerRef || this.vcRef;

          if (vcRef === this.vcRef) {
            console.warn('You are using cpUseRootViewContainer, ' +
              'but the root component is not exposing viewContainerRef!' +
              'Please expose it by adding \'public vcRef: ViewContainerRef\' to the constructor.');
          }
        } else {
          this.viewAttachedToAppRef = true;
        }
      }

      const compFactory = this.cfr.resolveComponentFactory(PebColorPickerComponent);

      if (this.viewAttachedToAppRef) {
        this.cmpRef = compFactory.create(this.injector);
        this.appRef.attachView(this.cmpRef.hostView);
        document.body.appendChild((this.cmpRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement);
      } else {
        const injector = ReflectiveInjector.fromResolvedProviders([], vcRef.parentInjector);

        this.cmpRef = vcRef.createComponent(compFactory, 0, injector, []);
      }

      this.cmpRef.instance.setupDialog(this, this.elRef, this.pebColorPicker,
        this.cpWidth, this.cpHeight, this.cpDialogDisplay, this.cpFallbackColor, this.cpColorMode,
        this.cpCmykEnabled, this.cpAlphaChannel, this.cpOutputFormat, this.cpDisableInput,
        this.cpIgnoredElements, this.cpSaveClickOutside, this.cpCloseClickOutside,
        this.cpUseRootViewContainer, this.cpPosition, this.cpPositionOffset,
        this.cpPositionRelativeToArrow, this.cpPresetLabel, this.cpPresetColors,
        this.cpPresetColorsClass, this.cpMaxPresetColorsLength, this.cpPresetEmptyMessage,
        this.cpPresetEmptyMessageClass, this.cpOKButton, this.cpOKButtonClass,
        this.cpOKButtonText, this.cpCancelButton, this.cpCancelButtonClass,
        this.cpCancelButtonText, this.cpAddColorButton, this.cpAddColorButtonClass,
        this.cpAddColorButtonText, this.cpRemoveColorButtonClass);

      this.dialog = this.cmpRef.instance;

      if (this.vcRef !== vcRef) {
        this.cmpRef.changeDetectorRef.detectChanges();
      }
    } else if (this.dialog) {
      this.dialog.openDialog(this.pebColorPicker);
    }
  }

  public closeDialog(): void {
    if (this.dialog && this.cpDialogDisplay === 'popup') {
      this.dialog.closeDialog();
    }
  }

  public cmykChanged(value: string): void {
    this.cpCmykColorChange.emit(value);
  }

  public stateChanged(state: boolean): void {
    this.cpToggleChange.emit(state);

    if (state) {
      this.colorPickerOpen.emit(this.pebColorPicker);
    } else {
      this.colorPickerClose.emit(this.pebColorPicker);
    }
  }

  public colorChanged(value: string, ignore: boolean = true): void {
    this.ignoreChanges = ignore;

    this.colorPickerChange.emit(value);
  }

  public colorSelected(value: string): void {
    this.colorPickerSelect.emit(value);
  }

  public colorCanceled(): void {
    this.colorPickerCancel.emit();
  }

  public inputFocus(): void {
    const element = this.elRef.nativeElement;

    const ignored = this.cpIgnoredElements.filter((item: any) => item === element);

    if (!this.cpDisabled && !ignored.length) {
      if (typeof document !== 'undefined' && element === document.activeElement) {
        this.openDialog();
      } else if (!this.dialog || !this.dialog.show) {
        this.openDialog();
      } else {
        this.closeDialog();
      }
    }
  }

  public inputChange(event: any): void {
    if (this.dialog) {
      this.dialog.setColorFromString(event.target.value, true);
    } else {
      this.pebColorPicker = event.target.value;

      this.colorPickerChange.emit(this.pebColorPicker);
    }
  }

  public inputChanged(event: any): void {
    this.cpInputChange.emit(event);
  }

  public sliderChanged(event: any): void {
    this.cpSliderChange.emit(event);
  }

  public sliderDragEnd(event: { slider: string, color: string }): void {
    this.cpSliderDragEnd.emit(event);
  }

  public sliderDragStart(event: { slider: string, color: string }): void {
    this.cpSliderDragStart.emit(event);
  }

  public presetColorsChanged(value: any[]): void {
    this.cpPresetColorsChange.emit(value);
  }
}
