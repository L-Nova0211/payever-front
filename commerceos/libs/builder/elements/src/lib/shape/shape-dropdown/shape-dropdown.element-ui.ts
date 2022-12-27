import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';

import { PEB_DEFAULT_FONT_SIZE } from '@pe/builder-core';
import { PebAbstractStyledElement } from '@pe/builder-renderer';


@Component({
  selector: 'peb-shape-dropdown-element-ui',
  templateUrl: './shape-dropdown.element-ui.html',
  styleUrls: ['./shape-dropdown.element-ui.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: PebShapeDropdownElementUi,
      multi: true,
    },
  ],
})
export class PebShapeDropdownElementUi extends PebAbstractStyledElement implements ControlValueAccessor {

  @Input() dropdownLabel: string;
  @Input() dropdownIcon: string;
  @Input() dropdownOptions: Array<{ title: string, value: any, icon?: string }> = [];
  @Input() dropdownCloseOnChoose = false;

  @ViewChild('wrapperRef') wrapperRef: ElementRef;
  @ViewChild('arrowDownRef') arrowDownRef: ElementRef;
  @ViewChild('menuTriggerRef', { read: MatMenuTrigger }) menuTriggerRef: MatMenuTrigger;

  value = null;
  disabled = false;
  chosenOption: { title: string, value: any, icon?: string };

  get elements(): { [p: string]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
      wrapper: this.wrapperRef?.nativeElement,
      arrowDown: this.arrowDownRef?.nativeElement,
    };
  }

  get hostClientWidth() {
    return this.elementRef.nativeElement.clientWidth;
  }

  get mappedStyles() {
    return {
      host: {
        fontSize: PEB_DEFAULT_FONT_SIZE,
      },
      wrapper: {
        padding: 11,
      },
      arrowDown: {
        width: 15,
      },
    };
  }

  private onChange = (value: any) => {};
  private onTouched = () => {};

  openMenu() {
    if (this.options?.interactions && this.dropdownOptions?.length) {
      this.menuTriggerRef.openMenu();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  updateChosenOption() {
    this.chosenOption = this.dropdownOptions?.find(o => o.value === this.value) ?? null;
  }

  updateValue = (e: Event, insideValue: number) => {
    e.stopPropagation();
    this.value = insideValue;
    this.onChange(insideValue);
    this.onTouched();
    this.updateChosenOption();
    if (this.dropdownCloseOnChoose) {
      this.menuTriggerRef.closeMenu();
    }
  }

  writeValue(obj: any): void {
    this.value = obj;
    this.updateChosenOption();
  }
}
