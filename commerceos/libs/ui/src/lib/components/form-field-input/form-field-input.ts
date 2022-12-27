import { animate, state, style, transition, trigger } from '@angular/animations';
import { FocusMonitor } from '@angular/cdk/a11y';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  Input,
  OnDestroy,
  ViewEncapsulation,
  AfterContentInit,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-form-field-input',
  templateUrl: './form-field-input.html',
  styleUrls: ['./form-field-input.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
  animations: [
    trigger('isFocusedLabel', [
      state(
        'true',
        style({
          // height: '36px',
          // 'line-height': '36px',
          transform: 'scale(1)',
        }),
      ),
      state(
        'false',
        style({
          // height: '16px',
          // 'line-height': '16px',
          'pointer-events': 'none',
          transform: 'translate(3px, 4px) scale(.75)',
        }),
      ),
      transition('true => false', animate('150ms cubic-bezier(0.4,0,0.2,1)')),
      transition('false => true', animate('150ms cubic-bezier(0.4,0,0.2,1)')),
    ]),
    trigger('isFocuesText', [
      state(
        'true',
        style({
          height: 0,
          overflow: 'hidden',
        }),
      ),
      state(
        'false',
        style({
          // height: '16px',
        }),
      ),
      transition('true => false', animate('150ms cubic-bezier(0.4,0,0.2,1)')),
      transition('false => true', animate('150ms cubic-bezier(0.4,0,0.2,1)')),
    ]),
  ],
})
export class PebFormFieldInputComponent implements AfterViewInit, OnDestroy, AfterContentInit {
  /**
   * Changes field appearance.
   *
   * There is normal appearance when this attribute is not set.
   * And there is label appearance when this attribute is set to 'label'
   */
  @Input() appearance: string = null;
  /** Sets input label. (only when appearance = 'label') */
  @Input() label: string;
  /** Sets error message */
  @Input() errorMessage: string;
  /** Whether field is invalid */
  @Input() isFieldInvalid = false;
  /** Whether field is animated */
  @Input() animated = false;

  /** Whether field is focused */
  isFocused = false;
  /** Whether field has any text */
  isAnyText = false;
  @ContentChild('input') inputRef: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private elRef: ElementRef<HTMLElement>,
    private focusMonitor: FocusMonitor,

    private readonly destroy$: PeDestroyService,
  ) { }

  get isAppearanceLabel(): boolean {
    return this.appearance === 'label';
  }

  get isAppearanceSearch(): boolean {
    return this.appearance === 'search';
  }

  ngAfterContentInit() {
    const input = this.elRef.nativeElement.querySelector('input');
    this.isAnyText = input.value.length !== 0;
    this.isFocused = input.value.length !== 0;
  }

  ngAfterViewInit() {
    const input = this.elRef.nativeElement.querySelector('input');
    this.isAnyText = input.value.length!== 0;
    if(this.isAnyText){
      this.isFocused = true;
      this.changeDetectorRef.detectChanges();
    }

    this.focusMonitor.monitor(this.elRef.nativeElement, true)
      .pipe(
        tap((focus) => {
          if (focus === null) {
            if (!this.isAnyText) {
              this.isFocused = false;
            }
            input.blur();
          } else {
            this.isFocused = true;
            input.focus();
          }
          this.changeDetectorRef.detectChanges();
        }),
        takeUntil(this.destroy$))
      .subscribe();

    if (this.animated) {
      fromEvent(input, 'input').subscribe((val: any) => {
        this.isAnyText = val.target.value.length !== 0;
        this.changeDetectorRef.detectChanges();
      });
      fromEvent(input, 'focus').subscribe((val: any) => {
        this.isAnyText = val.target.value.length !== 0;
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  /** Whether field should be animated */
  shouldAnimate() {
    if (this.animated && this.isFieldInvalid) {
      return false;
    }

    return this.animated && !this.isFocused;
  }

  ngOnDestroy(): void {
    this.focusMonitor.stopMonitoring(this.elRef.nativeElement);
  }
}
