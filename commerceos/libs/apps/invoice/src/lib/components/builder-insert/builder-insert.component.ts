import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { MessageBus } from '@pe/common';

import { INSERT_OPTION } from '../../constants';

enum Icons {
  'close' = '/assets/icons/close-icon.svg',
}

@Component({
  selector: 'pe-builder-insert',
  templateUrl: './builder-insert.component.html',
  styleUrls: ['./builder-insert.component.scss'],
})
export class PebInvoiceBuilderInsertComponent {

  readonly options = INSERT_OPTION;
  constructor(
    private dialogRef: MatDialogRef<PebInvoiceBuilderInsertComponent>,
    private messageBus: MessageBus,
    public iconRegistry: MatIconRegistry,
    public domSanitizer: DomSanitizer,
  ) {
    Object.entries(Icons).forEach(([name, path]) => {
      iconRegistry.addSvgIcon(
        name,
        domSanitizer.bypassSecurityTrustResourceUrl(`${path}`),
      );
    });
   }

  onCloseClick() {
    this.dialogRef.close();
  }

  setValue(item) {
    this.messageBus.emit('invoice.set.builder_insert', { type: item.option, params: item.payload });
    this.dialogRef.close();
  }
}
