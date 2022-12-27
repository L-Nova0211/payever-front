import { ChangeDetectionStrategy, Component, Inject, OnInit, Optional, ViewEncapsulation } from '@angular/core';

import { PE_HEADERMENU_DATA, PE_HEADERMENU_THEME } from './constants';
import { PeHeaderMenuRef } from './header-menu-ref.model';

@Component({
  selector: 'pe-header-menu',
  templateUrl: './header-menu.html',
  styleUrls: ['./header-menu.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeHeaderMenuComponent implements OnInit {
  options;
  constructor(
    private dialogRef: PeHeaderMenuRef,
    @Optional() @Inject(PE_HEADERMENU_THEME) public theme: string,
    @Optional() @Inject(PE_HEADERMENU_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    if (this.data?.option?.length === 1) {
      this.options = this.data.option[0].list;
    } else {
      this.options = this.data.list;
    }
  }

  /** Selectes menu option */
  onSelectList(value: string) {
    this.dialogRef.close(value);
  }

  /** Closes dialog */
  onCancel() {
    this.dialogRef.close();
  }
}
