import { Component, EventEmitter, HostBinding, Output } from '@angular/core';
import { Moment } from 'moment';

import { PeGridService } from '../grid.service';

@Component({
  selector: 'pe-grid-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
})
export class PeGridDatepickerComponent {

  @HostBinding('class') get theme() {
    return this.peGridService.theme;
  }

  @Output() closed = new EventEmitter<void>();
  @Output() selectedDate = new EventEmitter<Date>();

  constructor(private peGridService: PeGridService) {}

  onSelectData(date: Moment): void {
    this.selectedDate.emit(date.toDate());
  }
}
