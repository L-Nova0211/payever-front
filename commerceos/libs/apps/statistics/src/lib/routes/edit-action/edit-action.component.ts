import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { isSelectableItem } from '@pe/common';

import { PeStatisticsItem, PeStatisticsSingleSelectedAction } from '../../interfaces/statistics.interface';

/**
 * @deprecated
 */
@Component({
  selector: 'peb-edit-action',
  templateUrl: './edit-action.component.html',
  styleUrls: ['./edit-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditActionComponent {


  @Input() item: PeStatisticsItem;
  @Input() actions: PeStatisticsSingleSelectedAction[];

  constructor() { }

  onAction(event: MouseEvent, action: PeStatisticsSingleSelectedAction) {
    event.stopPropagation();
    event.preventDefault();
    if (action.callback) {
      isSelectableItem(this.item) ? action.callback(this.item.id) : action.callback();
    }

    action.callback();
  }

}
