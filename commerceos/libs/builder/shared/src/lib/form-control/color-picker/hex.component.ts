import { ChangeDetectionStrategy, Component, OnInit, Optional, Self } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, NgControl, ValidatorFn } from '@angular/forms';
import { BehaviorSubject, merge } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { RGBA } from './formats';
import { hexToRgba } from './hex-to-rgba';
import { rgbaToHex } from './rgba-to-hex';
import { stringToRgba } from './string-to-rgba';

const hexValidator: ValidatorFn = (control: AbstractControl) => {
  return /^#?[0-9a-fA-F]{1,6}$/.test(control.value) ? null : { hex: 'invalid' };
};

@Component({
  selector: 'peb-hex-input',
  template: `
    <peb-input class="input" [formControl]="control"></peb-input>
  `,
  styles: [
    `.input {
      width: 100%;
    }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebHexComponent implements ControlValueAccessor, OnInit {

  private readonly value$ = new BehaviorSubject<RGBA>(null);
  readonly control = new FormControl('', hexValidator);

  onChange: (value: RGBA) => void;
  onTouch: () => void;

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    readonly destroy$: PeDestroyService,
  ) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    merge(
      this.value$.pipe(
        tap((value) => {
          const rgba = value ?? { r: 255, g: 255, b: 255, a: 1 };
          this.control.patchValue(rgbaToHex(rgba).toUpperCase(), { emitEvent: false });
        }),
      ),
      this.control.valueChanges.pipe(
        filter(() => {
          const invalid = this.control.invalid;
          if (invalid) {
            this.control.patchValue(rgbaToHex(this.value$.getValue()).toUpperCase(), { emitEvent: false });
          }

          return !invalid;
        }),
        map((value) => {
          let hex = (value.startsWith('#') ? value.substr(1) : value).toUpperCase();
          if (hex.length) {
            if (hex.length === 3 && hex === `${hex[0]}${hex[0]}${hex[0]}`) {
              hex = `${hex}${hex}`;
            } else {
              hex = `00000${hex}`.slice(-6);
            }
          }
          this.value$.next(hexToRgba(hex));
          this.onTouch();
          this.onChange(this.value$.getValue());
        }),
      ),
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
  }

  writeValue(value: RGBA | string): void {
    const rgba = !value || value === 'inherit'
      ? { r: 255, g: 255, b: 255, a: 1 }
      : typeof value === 'string'
        ? stringToRgba(value)
        : value;
    this.value$.next(rgba);
  }
}
