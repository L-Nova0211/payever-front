import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { ListDataModel } from './interfaces';

@Component({
  selector: 'peb-list-info',
  templateUrl: './list-info.html',
  styleUrls: ['./list-info.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PebListInfoComponent {
  @Input() listData: ListDataModel[];
  @Input() header: string = null;
}
