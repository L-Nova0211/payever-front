import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { MessageBus, PeDataGridItem } from '@pe/common';

import { EmployeeStatusEnum } from '../../../../misc/interfaces';

@Component({
  selector: 'peb-employees-list-status-buttons',
  templateUrl: './employees-list-status-buttons.component.html',
  styleUrls: ['./employees-list-status-buttons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesListStatusButtonsComponent {
  EmployeeStatusEnum = EmployeeStatusEnum;
  @Input() item: PeDataGridItem;

  get active(): string {
    return EmployeeStatusEnum[this.item.data.status];
  }

  get buttonLocale(): string {
    return `pages.employees.datagrid.list.${this.active}`;
  }

  constructor(private messageBus: MessageBus) { }

  editEmployee() {
    this.messageBus.emit('settings.edit.employee', this.item.id);
  }

  resendInvitation() {
    this.messageBus.emit('settings.resend.employee.invitation', this.item.id);
  }
}
