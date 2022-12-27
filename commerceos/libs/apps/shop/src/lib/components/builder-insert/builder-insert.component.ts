import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { MessageBus } from '@pe/common';

import { INSERT_OPTION } from '../../constants';

@Component({
  selector: 'pe-builder-insert',
  templateUrl: './builder-insert.component.html',
  styleUrls: ['./builder-insert.component.scss'],
})
export class PebShopBuilderInsertComponent {

  readonly options = INSERT_OPTION;
  constructor(
    private dialogRef: MatDialogRef<PebShopBuilderInsertComponent>,
    private messageBus: MessageBus,
  ) { }

  onCloseClick() {
    this.dialogRef.close();
  }

  setValue(item) {
    this.messageBus.emit('shop.set.builder_insert', { type: item.option, params: item.payload });
    this.dialogRef.close();
  }
}
