import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { MessageBus, PE_ENV } from '@pe/common';

import { INSERT_OPTION } from '../../constants';
import { Icons } from '../icons';

@Component({
  selector: 'pe-builder-insert',
  templateUrl: './builder-insert.component.html',
  styleUrls: ['./builder-insert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebBlogBuilderInsertComponent {
  readonly options = INSERT_OPTION;

  constructor(
    private dialogRef: MatDialogRef<PebBlogBuilderInsertComponent>,
    private messageBus: MessageBus,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    @Inject(PE_ENV) private env,
  ) { 
    for (let key in Icons) {
      this.matIconRegistry.addSvgIcon(
        key,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`${Icons[key]}`),
      );
    }
  }

  onCloseClick() {
    this.dialogRef.close();
  }

  setValue(item) {
    this.messageBus.emit('blog.set.builder_insert', { type: item.option, params: item.payload });
    this.dialogRef.close();
  }
}
