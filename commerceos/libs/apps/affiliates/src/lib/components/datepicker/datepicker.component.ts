import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Moment } from 'moment';

@Component({
  selector: 'pe-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeDatepickerComponent implements AfterViewInit {

  @ViewChild('calendar') calendar: MatCalendar<Moment>;
  @ViewChild('wrapper') wrapper: ElementRef;

  readonly minDate = new Date();

  constructor(
    @Inject(MAT_DIALOG_DATA) public currentDate: Date,
    private dialogRef: MatDialogRef<PeDatepickerComponent>,
    private renderer: Renderer2
  ) { }

  ngAfterViewInit(): void {
    const calendar = this.wrapper.nativeElement.children[0];
    this.renderer.removeClass(calendar, 'mat-calendar');
  }

  public selectedChangeOn(date: Moment): void {
    this.dialogRef.close(Date.parse(date.toISOString()));
  }
}
