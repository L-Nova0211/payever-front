import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

import { NotificationsResponseInterface } from '../notification.interfaces';

const minHeight = 72;
@Component({
  selector: 'dashboard-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NotificationListComponent {
  @Input() notifications: NotificationsResponseInterface;
  @Output() hide = new EventEmitter();


  constructor() {
  }

  get height(): number {
    if (!this.notifications?.notifications.length) {
      return minHeight;
    }

    return Math.max(this.notifications.notifications.length * 42, minHeight)
  }

  close(){
    this.hide.emit()
  }
}
