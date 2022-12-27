import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AbstractWidgetComponent } from '../abstract-widget.component';

@Component({
  selector: 'pe-widget-social-table',
  templateUrl: './social-table.component.html',
  styleUrls: [
    '../common.widget.scss',
    './social-table.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialTableComponent extends AbstractWidgetComponent {  
}
