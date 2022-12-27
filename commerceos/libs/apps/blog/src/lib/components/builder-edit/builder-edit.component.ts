import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { MessageBus, PE_ENV } from '@pe/common';

import { EDIT_OPTION } from '../../constants';
import { Icons } from '../icons';

@Component({
  selector: 'pe-blog-builder-edit',
  templateUrl: './builder-edit.component.html',
  styleUrls: ['./builder-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeBlogBuilderEditComponent {

  readonly options = EDIT_OPTION;

  constructor(
    private dialogRef: MatDialogRef<PeBlogBuilderEditComponent>,
    private messageBus: MessageBus,
    public iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    @Inject(PE_ENV) private env
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
    this.messageBus.emit('Blog.set.builder_edit', item.option);
    this.dialogRef.close();
  }
}
