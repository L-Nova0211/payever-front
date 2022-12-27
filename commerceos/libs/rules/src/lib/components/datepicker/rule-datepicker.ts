import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { Moment } from 'moment';

import { AppThemeEnum, EnvService } from '@pe/common';


@Component({
  selector: 'pe-rule-datepicker',
  templateUrl: './rule-datepicker.html',
  styleUrls: ['./rule-datepicker.scss'],
})

export class RuleDatePickerComponent implements AfterViewInit {
  @ViewChild('calendar') calendar: MatCalendar<Moment>;
  @ViewChild('wrapper') wrapper: ElementRef;

  readonly minDate = new Date();

  theme = this.envService.businessData?.themeSettings?.theme ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme] :
    AppThemeEnum.default;

  constructor(
    private dialogRef: MatDialogRef<RuleDatePickerComponent>,
    private renderer: Renderer2,
    private envService: EnvService,
  ) { }

  ngAfterViewInit(): void {
    const calendar = this.wrapper.nativeElement.children[0];
    this.renderer.removeClass(calendar, 'mat-calendar');
  }

  selectedChangeOn(date: Moment): void {
    this.dialogRef.close(date);

  }
}
