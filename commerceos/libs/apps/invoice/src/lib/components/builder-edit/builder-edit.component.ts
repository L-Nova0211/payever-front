import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { MessageBus } from '@pe/common';

import { EDIT_OPTION } from '../../constants';

enum Icons {
  'close' = '/assets/icons/close-icon.svg',
}

@Component({
  selector: 'pe-invoice-builder-edit',
  templateUrl: './builder-edit.component.html',
  styleUrls: ['./builder-edit.component.scss'],
})
export class PeInvoiceBuilderEditComponent {

  readonly options = EDIT_OPTION;

  constructor(
    private dialogRef: MatDialogRef<PeInvoiceBuilderEditComponent>,
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
    this.messageBus.emit('invoice.set.builder_edit', item.option);
    this.dialogRef.close();
  }
}
