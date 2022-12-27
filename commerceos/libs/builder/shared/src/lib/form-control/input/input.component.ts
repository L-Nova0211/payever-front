import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  Optional,
  Renderer2,
  Self,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { debounceTime, first, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-input',
  template: `
    <div class="input-value">
      <div class="prefix" *ngIf="prefix">{{ prefix }}</div>
      <input #input [type]="type" [placeholder]="placeholder" (keyup.enter)="onBlur()" [style.text-align]="textAlign"/>
      <div class="suffix" *ngIf="suffix">{{ suffix }}</div>
    </div>
  `,
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebInputComponent implements ControlValueAccessor {

  @Input() placeholder = '';
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() change: 'focusout' | 'keyup' = 'focusout';
  @Input() textAlign: 'left' | 'right' | 'center' = 'right';
  @Input() valuePrefix = '';
  @Input() type: 'text' | 'password' | 'number' = 'text';

  @ViewChild('input', { static: true }) input: ElementRef;

  onChange: (value: string) => void;
  onTouch: () => void;

  constructor(
    private renderer: Renderer2,
    private destroy$: PeDestroyService,
    @Optional() @Self() public ngControl: NgControl,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }

    this.ngZone.onStable.pipe(
      first(),
      switchMap(() =>
        fromEvent(this.input?.nativeElement, this.change).pipe(
          debounceTime(this.change === 'keyup' ? 500 : 0),
          tap(() => {
            this.onChange(this.input.nativeElement.value);
            this.onTouch();
            this.cdr.markForCheck();
          }),
          takeUntil(this.destroy$),
        ),
      ),
    ).subscribe();
  }

  registerOnChange(fn: any): void {
    this.onChange = (value) => {
      let inputValue = value;
      if (this.valuePrefix) {
        if (value && !value.startsWith('/')) {
          inputValue = `${this.valuePrefix}${value}`;
          this.renderer.setProperty(this.input.nativeElement, 'value', inputValue);
        }
      }

      fn(inputValue);
    };
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  writeValue(value: string): void {
    this.renderer.setProperty(this.input.nativeElement, 'value', value);
  }

  onBlur(): void {
    this.onChange(this.input.nativeElement.value);
    this.onTouch();
  }
}
