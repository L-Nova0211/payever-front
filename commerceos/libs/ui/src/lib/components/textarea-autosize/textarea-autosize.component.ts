import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { first, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'pe-textarea-autosize',
  template: `<textarea
    #textarea
    cdkTextareaAutosize
    [(ngModel)]="value"
    (ngModelChange)="onChange($event)"
    #autosize="cdkTextareaAutosize"
  ></textarea>`,
  styleUrls: ['./textarea-autosize.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: PebTextareaAutosizeComponent,
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebTextareaAutosizeComponent implements ControlValueAccessor {
  @ViewChild('textarea', { static: true }) public textarea: ElementRef;
  @Output('change') changeOn = new EventEmitter<void>();

  readonly destroyed$ = this.destroy$.asObservable();

  constructor(private ref: ChangeDetectorRef, private _ngZone: NgZone, private readonly destroy$: PeDestroyService) {
    this._ngZone.onStable.pipe(first(), takeUntil(this.destroyed$),tap(() =>  this.ref.markForCheck())).subscribe();
  }

  value: string;

  onChange: (value: string) => void;

  writeValue(value: string) {
    this.value = value;
    this.ref.markForCheck();
  }

  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function): void {}
}
