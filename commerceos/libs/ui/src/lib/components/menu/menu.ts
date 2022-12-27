import { ChangeDetectionStrategy, Component, Inject, Optional, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';

import { PeDestroyService } from '@pe/common';

import { PE_MENU_DATA, PE_MENU_THEME } from './constants';

@Component({
  selector: 'pe-menu',
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PebMenuComponent {
  select$ = new Subject();
  readonly destroyed$ = this.destroy$.asObservable();
  constructor(
    @Optional() @Inject(PE_MENU_THEME) public theme: string,
    @Optional() @Inject(PE_MENU_DATA) public data: any,
    private readonly destroy$: PeDestroyService,
  ) {}

  /** On select return selected item value */
  onSelect(value: string) {
    this.select$.next(value);
  }

  /** Closes menu */
  onClose() {
    this.select$.next();
  }
}
