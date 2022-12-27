import { Component } from '@angular/core';

import { Widget } from '@pe/widgets';

import { AbstractWidgetComponent } from '../abstract-widget.component';

@Component({
  selector: 'pe-widget-avatars',
  templateUrl: './avatars.component.html',
  styleUrls: [
    '../common.widget.scss',
    './avatars.component.scss',
  ],
})
export class AvatarsComponent extends AbstractWidgetComponent {

  openChat(widget: Widget, id: string) {
    widget.openButtonFn(id).subscribe();
  }

  openApplication(widget: Widget) {
    widget.openButtonFn().subscribe();
  }
}
