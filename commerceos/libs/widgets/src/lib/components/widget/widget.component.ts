import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { take, tap } from 'rxjs/operators';

import { WidgetNotification, WidgetType } from '../../interfaces';
import { AbstractWidgetComponent } from '../abstract-widget.component';

@Component({
  selector: 'pe-widget',
  templateUrl: './widget.component.html',
  styleUrls: [
    '../common.widget.scss',
    './widget.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WidgetComponent extends AbstractWidgetComponent {
  readonly WidgetType: typeof WidgetType = WidgetType;

  showNotifications = false;
  openButtonLoading = false;

  constructor() {
    super();
  }

  openApplication() {
    this.openButtonLoading = true;
    this.widget.openButtonFn().pipe(
      take(1),
      tap(() => {
        this.openButtonLoading = false;
      }),
    ).subscribe();
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  openNotification(notification: WidgetNotification) {
    if (!notification.notProcessLoading) {
      notification.loading = true;
    }
    notification.openFn().pipe(
      take(1),
      tap(() => {
        if (!notification.notProcessLoading) {
          notification.loading = false;
        }
      }),
    ).subscribe();
  }
}
