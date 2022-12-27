import { Component } from '@angular/core';
import { take, tap } from 'rxjs/operators';

import { AbstractWidgetComponent } from '../abstract-widget.component';

@Component({
  selector: 'pe-widget-start',
  templateUrl: './start.component.html',
  styleUrls: [
    '../common.widget.scss',
    './start.component.scss',
  ],
})
export class StartComponent extends AbstractWidgetComponent {
  installLoading = false;

  onInstallClick() {
    this.installLoading = true;
    this.widget.onInstallAppClick(this.widget.appName).pipe(
      take(1),
      tap(() => {
        this.installLoading = false;
      }),
    ).subscribe();
  }
}
