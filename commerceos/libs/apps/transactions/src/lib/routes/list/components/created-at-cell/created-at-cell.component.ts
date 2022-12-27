import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import moment from 'moment';

import { PeGridItem } from '@pe/grid';
import { LocaleConstantsService } from '@pe/i18n';

import { TransactionInterface } from '../../../../shared';

@Component({
  selector: 'pe-date-field',
  template: `{{date}}`,
  styles: [`:host {
    text-transform: capitalize;
  }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CreatedAtCellComponent implements AfterViewInit {
  item: PeGridItem<TransactionInterface>;

  constructor(
    public localeConstantsService: LocaleConstantsService,
    private cdr: ChangeDetectorRef
  ) {
  }

  get locale(): string {
    return this.localeConstantsService.getLocaleId();
  }

  get date(): string {
    return moment(this.item.data.created_at, undefined, this.locale)
      .format(this.isToday(this.item.data.created_at) ? 'HH:mm' : 'DD MMMM YYYY HH:mm');
  }

  private isToday(date: string): boolean {
    return new Date(date).toDateString() === new Date().toDateString();
  }

  ngAfterViewInit() {
    this.cdr.detach();
  }
}
