import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
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
  selector: 'peb-textarea',
  template: `<textarea
              #textarea
              [disabled]="disabled"
              (input)="onInput()"
              ></textarea>`,
  styleUrls: ['./textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebTextareaComponent implements ControlValueAccessor {

  @ViewChild('textarea', { static: true }) private textarea: ElementRef;

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

  onInput(): void {
    const value = (this.textarea.nativeElement as HTMLTextAreaElement).value;
    this.value$.next(value);
    this.onChange(value);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: string): void {
    this.renderer.setProperty(this.textarea.nativeElement, 'value', value);
  }

}
