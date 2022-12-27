import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PebPageType } from '@pe/builder-core';

@Component({
  selector: 'peb-page-context-menu',
  templateUrl: './page-context-menu.component.html',
  styleUrls: ['./page-context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContextMenuComponent {
  readonly pageType: typeof PebPageType = PebPageType;

  closeContextMenu() {
  }
}
