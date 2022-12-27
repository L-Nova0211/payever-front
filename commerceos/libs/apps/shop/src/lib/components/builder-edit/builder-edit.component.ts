import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PebLanguagesFormComponent } from 'libs/builder/shared/src/lib/forms/languages';

import { PebEditor } from '@pe/builder-main-editor';
import { PebEditorAccessorService } from '@pe/builder-services';
import { MessageBus } from '@pe/common';

import { EDIT_OPTION } from '../../constants';
import { PebEditorSlot } from '@pe/builder-abstract';

@Component({
  selector: 'pe-shop-builder-edit',
  templateUrl: './builder-edit.component.html',
  styleUrls: ['./builder-edit.component.scss'],
})
export class PeShopBuilderEditComponent {

  readonly options = EDIT_OPTION;

  constructor(
    private dialogRef: MatDialogRef<PeShopBuilderEditComponent>,
    private messageBus: MessageBus,
    private readonly editorAccessorService: PebEditorAccessorService,
  ) { }

  protected get editor(): PebEditor {
    return this.editorAccessorService.editorComponent;
  }

  onCloseClick() {
    this.dialogRef.close();
  }

  setValue(item) {
    switch (item.option) {
      case 'toggleLanguagesSidebar':
        this.editor.insertToSlot(PebLanguagesFormComponent, PebEditorSlot.sidebarDetail);
        this.editor.detail = { back: 'Back', title: 'Edit language' };
        break;

      default:
        this.messageBus.emit('shop.set.builder_edit', item.option);
        break;
    }

    this.dialogRef.close();
  }
}
