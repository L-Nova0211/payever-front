import { Component } from '@angular/core';

import { AbstractWidgetComponent } from '../abstract-widget.component';

@Component({
  selector: 'pe-widget-contacts-table',
  templateUrl: './contacts-table.component.html',
  styleUrls: [
    '../common.widget.scss',
    './contacts-table.component.scss',
  ],
})
export class ContactsTableComponent extends AbstractWidgetComponent {
}
