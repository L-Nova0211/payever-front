import { ChangeDetectionStrategy, Component, ElementRef, Optional, Renderer2, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { animationFrameScheduler, fromEvent, merge, ReplaySubject } from 'rxjs';
import { finalize, map, startWith, switchMap, takeUntil, tap, throttleTime, withLatestFrom } from 'rxjs/operators';

import { HSVA } from './formats';
import { hsvaToRgba } from './hsva-to-rgb';


@Component({
  selector: 'peb-hsva-picker',
  template: `
    <div class="hsva">
      <canvas #canvas width="256" height="256" class="hsva__picker"></canvas>
      <div
        class="hsva__cursor"
        *ngIf="value$ | async as hsva"
        [style.top.%]="100 - hsva.v"
        [style.left.%]="hsva.s"
      ></div>
    </div>
  `,
  styleUrls: ['./hsva-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebHSVColorPickerComponent implements ControlValueAccessor {

  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  private readonly hsva$ = new ReplaySubject<HSVA>(1);

  change$ = fromEvent<MouseEvent>(this.elmRef.nativeElement, 'mousedown').pipe(
    tap(() => {
      /** Disable pointer events in case there are any iframe */
      this.renderer.setStyle(document.body, 'pointer-events', 'none');
    }),
    map(({ clientX, clientY, target }) => {
      if (isCursor(target)) {
        const rect = target.getBoundingClientRect();
        const offsetX = rect.width / 2 + rect.left - clientX;
        const offsetY = rect.height / 2 + rect.top - clientY;

        return { clientX, clientY, offsetX, offsetY };
      }

      return { clientX, clientY, offsetX: 0, offsetY: 0 };
    }),
    switchMap(mouseDown => fromEvent<MouseEvent>(document, 'mousemove').pipe(
      startWith({ clientX: mouseDown.clientX, clientY: mouseDown.clientY }),
      throttleTime(0, animationFrameScheduler, { trailing: true }),
      withLatestFrom(this.hsva$),
      map(([{ clientX, clientY }, hsva]) => {
        const { left, top, width, height } = this.canvas.nativeElement.getBoundingClientRect();

        const saturation = Math.max(0, Math.min(100, (clientX - left + mouseDown.offsetX) / width * 100));
        const value = Math.max(0, Math.min(100, (clientY - top + mouseDown.offsetY) / height * 100));

        return new HSVA(hsva.h, saturation, 100 - value, hsva.a);
      }),
      tap((hsva) => {
        this.onChange(hsva);
      }),
      finalize(() => {
        this.renderer.setStyle(document.body, 'pointer-events', 'auto');
        this.onTouch();
        this.elmRef.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
      }),
      takeUntil(fromEvent(document, 'mouseup')),
    )),
  );

  value$ = merge(
    this.hsva$.pipe(
      tap((hsva) => {
        const { r, g, b, a } = hsvaToRgba(new HSVA(hsva.h, 100, 100, hsva.a));
        const ctx = this.canvas.nativeElement.getContext('2d');
        ctx.clearRect(0, 0, 256, 256);
        const saturationGradient = ctx.createLinearGradient(0, 0, 256, 0);
        saturationGradient.addColorStop(0, `rgba(255, 255, 255, ${a})`);
        saturationGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${a})`);

        const valueGradient = ctx.createLinearGradient(0, 0, 0, 256);
        valueGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        valueGradient.addColorStop(1, 'rgb(0, 0, 0)');

        ctx.fillStyle = saturationGradient;
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = valueGradient;
        ctx.fillRect(0, 0, 256, 256);
      }),
    ),
    this.change$,
  );

  onChange: (value: HSVA) => void;
  onTouch: () => void;

  constructor(
    private readonly elmRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
    @Optional() @Self() public ngControl: NgControl,
  ) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  registerOnChange(fn: (value: HSVA) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
  }

  writeValue(value: HSVA): void {
    this.hsva$.next(value);
  }
}

export function isCursor(elm: EventTarget): elm is HTMLElement {
  return (elm as HTMLElement).classList.contains('hsva__cursor');
}
