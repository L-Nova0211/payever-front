import { ChangeDetectionStrategy, Component, Inject, Input, OnDestroy, Optional } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { defaultPalette } from './default-palette';

@Component({
  selector: 'peb-color-palette',
  template: `
    <div class="colors-grid" [formGroup]="form">
      <label
        class="color"
        *ngFor="let color of palette; trackBy:trackByIndex"
        [attr.aria-label]="'Color ' + color"
        [style.background-color]="color"
        [class.active]="color === form.value.color"
      >
        <input type="radio" [value]="color" hidden formControlName="color" />
        {{ placeholder }}
      </label>
    </div>
  `,
  styleUrls: ['./color-palette.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebColorPaletteComponent implements ControlValueAccessor, OnDestroy {

  @Input() palette = defaultPalette;
  @Input() placeholder?: string;

  form = new FormGroup({
    color: new FormControl(),
  });

  onChange: (value: string) => void;
  onTouch: () => void;

  private readonly destroy$ = new Subject<void>();

  constructor(@Optional() @Inject(NgControl) private ngControl: NgControl) {
    if (ngControl !== null) {
      ngControl.valueAccessor = this;
    }

    this.form.valueChanges.pipe(
      tap(({ color }) => {
        this.onChange(color);
        this.onTouch();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  trackByIndex(index: number): any {
    return index;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  writeValue(value: string): void {
    this.form.patchValue({ color: value }, { emitEvent: false });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
