import { FocusMonitor } from '@angular/cdk/a11y';
import {
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, ElementRef,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-form-field-textarea',
  templateUrl: './form-field-textarea.html',
  styleUrls: ['./form-field-textarea.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebFormFieldTextareaComponent implements AfterViewInit, OnDestroy {
  /** Sets appearance */
  @Input() appearance: string;
  /** Sets label. (if appearance = 'label') */
  @Input() label: string;
  /** Sets error message */
  @Input() errorMessage: string;
  /** Whether field is invalid */
  @Input() isFieldInvalid = false;

  constructor(
    private focusMonitor: FocusMonitor,
    private elRef: ElementRef<HTMLElement>,
    private readonly destroy$: PeDestroyService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {

  }

  ngAfterViewInit() {
    const textarea = this.elRef.nativeElement.querySelector('textarea');
    this.focusMonitor.monitor(this.elRef.nativeElement, true)
      .pipe(
        tap((focus) => {
          if (focus === null) {
            textarea.blur();
          } else {
            textarea.focus();
          }
          this.changeDetectorRef.detectChanges();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnDestroy() {
    this.focusMonitor.stopMonitoring(this.elRef.nativeElement);
  }
}
