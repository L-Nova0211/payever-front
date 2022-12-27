import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';

import { PebNumberInputComponent } from './number-input.component';

/** @dynamic */
@Component({
  selector: 'peb-number-input-spinbutton',
  template: `
    <div class="input-value">
      <input #input/>
      <div class="units" *ngIf="units">{{ units }}</div>
    </div>
    <button #decrement class="button button--decrement" tabindex="-1">
      <mat-icon [svgIcon]="'font-size-decrement'"></mat-icon>
    </button>
    <button #increment class="button button--increment" tabindex="-1">
      <mat-icon [svgIcon]="'font-size-increment'"></mat-icon>
    </button>
  `,
  styleUrls: [
    './number-input.component.scss',
    './number-input-spinbutton.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebNumberInputSpinButtonsComponent extends PebNumberInputComponent implements AfterViewInit {
  @ViewChild('increment', { static: true }) private incrementRef: ElementRef;
  @ViewChild('decrement', { static: true }) private decrementRef: ElementRef;

  ngAfterViewInit(): void {
    this.increment = this.incrementRef.nativeElement;
    this.decrement = this.decrementRef.nativeElement;
    super.ngAfterViewInit();
  }
}
