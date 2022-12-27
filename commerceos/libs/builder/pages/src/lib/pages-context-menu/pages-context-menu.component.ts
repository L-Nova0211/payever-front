import { ChangeDetectionStrategy, Component, EventEmitter, Inject, InjectionToken, Input } from '@angular/core';

export const PAGES_CONTEXT_DATA = new InjectionToken('PAGES_CONTEXT_DATA');

@Component({
  selector: 'peb-pages-context-menu',
  templateUrl: './pages-context-menu.component.html',
  styleUrls: ['./pages-context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebPagesContextMenuComponent {

  @Input() options: Array<{
    title: string,
    onClick: () => void,
  }>;

  readonly onClose = new EventEmitter();

  constructor(
    @Inject(PAGES_CONTEXT_DATA) public data: any,
  ) {
    this.options = data.options ?? [];
  }
}
