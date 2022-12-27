import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  Optional,
  Renderer2,
  Self,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { finalizeWithValue } from '../../forms/finalize-with-value';

@Component({
  selector: 'peb-editor-text-input',
  template: `
    <input
      #input
      type="text"
      [placeholder]="placeholder"
      [disabled]="disabled"
      (input)="onValueChange()"
    />
  `,
  styleUrls: ['./text.input.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class SidebarTextInput implements ControlValueAccessor {
  @Input() placeholder = '';

  @ViewChild('input', { static: true }) input: ElementRef;

  onChange: (value: string) => void;
  onTouch: () => void;

  value$ = new BehaviorSubject(null);
  disabled = false;

  constructor(
    private renderer: Renderer2,
    @Optional() @Self() public ngControl: NgControl,
    private readonly destroy$: PeDestroyService,
  ) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }

    this.value$
    .pipe(
      takeUntil(this.destroy$),
      finalizeWithValue((value) => {
        if(!value) { return; }
        this.onTouch();
        this.onChange(value);
      }),
    )
    .subscribe();
  }

  @HostListener('focusout') onFocusOut(): void {
    this.onTouch();
  }

  @HostBinding('attr.disabled') get isDisabled(): string | null {
    return this.disabled ? '' : null;
  }

  onValueChange(): void {
    const value = (this.input.nativeElement as HTMLInputElement).value;
    this.value$.next(value);
    this.onChange(value);
  }

  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: string): void {
    this.renderer.setProperty(this.input.nativeElement, 'value', value);
  }
}
