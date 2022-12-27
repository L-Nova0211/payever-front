import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Renderer2,
  Self,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { fromEvent, merge, Observable, of, Subject, timer } from 'rxjs';
import { distinctUntilChanged, filter, map, mapTo, scan, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { finalizeWithValue } from '../../forms/finalize-with-value';


/** @dynamic */
@Component({
  selector: 'peb-number-input',
  template: `
    <div class="input-value">
      <input #input/>
      <div class="units" *ngIf="units">{{ units }}</div>
    </div>
  `,
  styleUrls: ['./number-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebNumberInputComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {

  @Input() units?: string;
  @Input() step = 1;
  @Input() precision = 0;
  @Input() min = Number.NEGATIVE_INFINITY;
  @Input() max = Number.POSITIVE_INFINITY;
  @Input() increment?: HTMLButtonElement;
  @Input() decrement?: HTMLButtonElement;

  @ViewChild('input', { static: true }) private input: ElementRef;

  onChange: (value: number) => void;
  onTouch: () => void;

  private readonly destroy$ = new Subject<void>();
  private selection: { start: number; end: number; };
  private value: number;

  @HostBinding('attr.role') role = 'spinbutton';

  @HostBinding('attr.aria-valuenow') get ariaValueNow() {
    return isFinite(this.value) ? this.value.toFixed(this.precision) : 0;
  }

  @HostBinding('attr.aria-valumin') get ariaValueMin() {
    if (isFinite(this.min)) {
      return this.min.toFixed(this.precision);
    }

    return null;
  }

  @HostBinding('attr.aria-valuemax') get ariaValueMax() {
    if (isFinite(this.max)) {
      return this.max.toFixed(this.precision);
    }

    return null;
  }

  @HostBinding('class.multiple') get multiple(): boolean {
    return Array.isArray(this.value);
  }

  constructor(
    private renderer: Renderer2,
    private elmRef: ElementRef,
    @Inject(DOCUMENT) private document: Document,
    @Optional() @Self() public ngControl: NgControl,
  ) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  writeValue(value: number | number[]): void {
    /**
     * For multiple text selection styles value is Array.
     * TODO: temporary solution, should be processed in forms.
     */
    const normalizedValue = Array.isArray(value) ? Math.min(...value) : value;

    if (!isNaN(normalizedValue)) {
      this.value = Math.max(this.min, Math.min(normalizedValue, this.max));
      this.renderer.setProperty(this.input.nativeElement, 'value', this.value.toFixed(this.precision));
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.input.nativeElement, 'disabled', isDisabled);

    if (this.increment) {
      this.renderer.setProperty(this.increment, 'disabled', isDisabled);
    }

    if (this.decrement) {
      this.renderer.setProperty(this.decrement, 'disabled', isDisabled);
    }
  }

  ngAfterViewInit(): void {
    const onKeydown$ = fromEvent<KeyboardEvent>(this.input.nativeElement, 'keydown').pipe(
      filter((ev: KeyboardEvent) => ['ArrowUp', 'ArrowDown'].includes(ev.code)),
      tap((ev: KeyboardEvent) => ev.preventDefault()),
      map((ev: KeyboardEvent) => ev.code),
      map(code => code === 'ArrowUp' ? this.step : -this.step),
      switchMap(value => of(value).pipe(
        scan((acc, delta) => Math.max(this.min, Math.min(acc + delta, this.max)), this.value),
      )),
      tap((value) => {
        this.onChange(value);
      }),
    );

    const events: Array<Observable<number>> = [];
    if (this.increment) {
      events.push(fromMouseDown(this.increment).pipe(mapTo(this.step)));
    }
    if (this.decrement) {
      events.push(fromMouseDown(this.decrement).pipe(mapTo(-this.step)));
    }

    let onMousedown$: Observable<number>;
    if (events.length) {
      onMousedown$ = merge(...events).pipe(
        switchMap(delta => timer(500, 50).pipe(
          startWith(this.value + delta),
          scan(acc => Math.max(this.min, Math.min(acc + delta, this.max)), this.value),
          takeUntil(fromEvent(this.document, 'mouseup')),
          finalizeWithValue((value) => {
            this.onTouch();
            this.onChange(value);
          }),
        )),
      );
    }

    const onInput$ = (onMousedown$ ? merge(onKeydown$, onMousedown$) : onKeydown$).pipe(
      tap(() => {
        this.saveSelection();
      }),
      map(value => Math.max(this.min, Math.min(value, this.max))),
      distinctUntilChanged(),
      filter(value => value !== this.value),
      tap((value) => {
        this.writeValue(value);
        this.onChange(value);
        this.restoreSelection();
        /** Update ngControl value, just in case if same formControl is bound to multiple inputs */
        this.ngControl.control.setValue(value, { emitEvent: false });
      }),
    );

    const onFocusout$ = fromEvent(this.input.nativeElement, 'focusout').pipe(
      tap(() => {
        const value = this.normalizeValue(this.input.nativeElement.value);
        this.onTouch();
        this.input.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
        this.writeValue(value ?? this.value);
      }),
    );

    const onEnter$ = fromEvent<KeyboardEvent>(this.input.nativeElement, 'keydown').pipe(
      filter((ev: KeyboardEvent) => ev.key === 'Enter'),
      tap(() => {
        const value = this.normalizeValue(this.input.nativeElement.value);
        if (value !== undefined && value !== this.value) {
          this.onTouch();
          this.onChange(value);
          this.writeValue(value);
        } else {
          this.writeValue(value ?? this.value);
        }
        this.input.nativeElement.blur();
        this.elmRef.nativeElement.dispatchEvent(new Event('blur'));
      }),
    );

    const onChange$ = fromEvent<Event>(this.input.nativeElement, 'change').pipe(
      tap(($event: Event) => {
        const value = this.normalizeValue(($event.target as HTMLInputElement).value);
        if (value !== undefined && value !== this.value) {
          this.writeValue(value);
          this.onChange(value);
          this.ngControl.control.setValue(value, { emitEvent: false });
        }
      }),
    );

    merge(
      onFocusout$,
      onEnter$,
      onInput$,
      onChange$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private normalizeValue(value: string): number | undefined {
    const normalized = parseFloat(value);
    if (!isNaN(normalized)) {
      return Number(Math.max(this.min, Math.min(normalized, this.max)).toFixed(this.precision));
    }

    return undefined;
  }

  private saveSelection(): void {
    const input = this.input.nativeElement as HTMLInputElement;
    this.selection = { start: input.selectionStart, end: input.selectionEnd };
  }

  private restoreSelection(): void {
    const { start, end } = this.selection;
    const input = this.input.nativeElement as HTMLInputElement;
    input.setSelectionRange(start, end);
  }
}


export function fromMouseDown(elm: HTMLElement): Observable<MouseEvent> {
  return fromEvent<MouseEvent>(elm, 'mousedown').pipe(tap((ev: MouseEvent) => ev.preventDefault()));
}
