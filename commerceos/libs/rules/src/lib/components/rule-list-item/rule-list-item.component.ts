import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ActionType } from '../../models/rules.model';

@Component({
  selector: 'pe-rule-list-item',
  templateUrl: './rule-list-item.component.html',
  styleUrls: ['./rule-list-item.component.scss'],
})
export class RuleListItemComponent {
  @Input() ruleName: string;
  @Output() action = new EventEmitter<ActionType>();

  onDuplicateClick(): void {
    this.action.emit(ActionType.Duplicate);
  }

  onEditClick(): void {
    this.action.emit(ActionType.Edit);
  }

  onDeleteClick(): void {
    this.action.emit(ActionType.Delete);
  }
}
