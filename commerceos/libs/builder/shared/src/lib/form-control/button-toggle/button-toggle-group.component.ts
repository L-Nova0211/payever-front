import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Input,
  Optional,
  QueryList,
  Self,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { PebButtonToggleComponent } from './button-toggle.component';

@Component({
  selector: 'peb-button-toggle-group',
  template: `
    <ng-content></ng-content>
  `,
  styleUrls: ['./button-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebButtonToggleGroupComponent implements ControlValueAccessor, AfterContentInit {
  @Input() radio = true;
  @ContentChildren(PebButtonToggleComponent, { descendants: true }) buttonToggles: QueryList<PebButtonToggleComponent>;

  onChange: (value: unknown) => void;
  onTouch: () => void;

  private value: unknown;
  private disabled: boolean;

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.buttonToggles) {
      this.setChildDisabledState(this.disabled);
    }
  }

  writeValue(value: any): void {
    this.value = value;
    if (this.buttonToggles) {
      this.writeChildValue(value);
    }
  }

  ngAfterContentInit(): void {
    this.buttonToggles.forEach((button) => {
      button.registerOnChange((value: any) => {
        this.buttonToggles.forEach((btn) => {
          if (button.value !== btn.value) {
            btn.checked = false;
          } else if (this.radio) {
            btn.checked = true;
          }
        });
        this.onChange(button.value);
      });
      button.registerOnTouched(this.onTouch);
    });

    this.writeChildValue(this.value);
    if (this.disabled !== undefined) {
      this.setChildDisabledState(this.disabled);
    }
  }

  private writeChildValue(value: any) {
    this.buttonToggles.forEach((button) => {
      button.checked = button.value === value;
    });
  }

  private setChildDisabledState(isDisabled: boolean) {
    this.buttonToggles.forEach((button) => {
      button.setDisabledState(isDisabled);
    });
  }
}
