import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { fromEvent, merge, Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'peb-angle-picker',
  templateUrl: 'angle-picker.component.html',
  styleUrls: ['./angle-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebAnglePickerComponent implements ControlValueAccessor, AfterViewInit, OnInit, OnDestroy {

  @ViewChild('circle', { static: true }) circle: ElementRef;

  onChange: (value: number) => void;
  onTouch: () => void;

  circleCenterX = 0;
  circleCenterY = 0;

  value = 0;

  private disabled = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private element: ElementRef,
    @Optional() @Self() public ngControl: NgControl,
  ) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngAfterViewInit() {
    this.updateValueAndRotateCircle(this.value);
  }

  ngOnInit() {
    fromEvent(this.element.nativeElement, 'mousedown').pipe(
      map(this.preventDefaultMouseEvent),
      filter((event: MouseEvent) => event.button === 0 && !this.disabled),
      tap(() => this.calculateCircleCenter()),
      switchMap(() => fromEvent(document, 'mousemove').pipe(
        takeUntil(merge(
          fromEvent(document, 'mouseup').pipe(
            tap(() => {
              this.onTouch();
              this.element.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
            }),
          ),
          fromEvent(document, 'click'),
        )),
      )),
      tap((event: MouseEvent) => {
        this.calculateAndUpdateAngleIfChanged(event.pageX, event.pageY);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: number): void {
    this.updateValueAndRotateCircle(value);
  }

  private calculateAndUpdateAngleIfChanged(cursorPositionX: number, cursorPositionY: number) {
    const deltaX = cursorPositionX - this.circleCenterX;
    const deltaY = cursorPositionY - this.circleCenterY;

    let angle = Math.round(Math.atan2(-deltaY, deltaX) * (180 / Math.PI));
    angle = angle >= 0 ? angle : angle + 360;

    if (this.value !== angle) {
      this.updateValueAndRotateCircle(angle);
      this.onChange(angle);
      this.ngControl.control.setValue(angle, { emitEvent: false });
      this.element.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  private calculateCircleCenter() {
    const circleRect = this.circle.nativeElement.getBoundingClientRect();

    this.circleCenterX = circleRect.left + circleRect.width / 2;
    this.circleCenterY = circleRect.top + circleRect.height / 2;
  }

  private updateValueAndRotateCircle(value: number): void {
    this.value = value;
    if (this.circle) {
      this.circle.nativeElement.style.transform = `rotate(-${value}deg)`;
    }
  }

  private preventDefaultMouseEvent = (mouseEvent: Event) => {
    mouseEvent.preventDefault();

    return mouseEvent;
  }
}
