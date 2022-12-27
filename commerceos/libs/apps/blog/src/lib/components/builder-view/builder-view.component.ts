import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { MessageBus, PE_ENV } from '@pe/common';

import { OPTIONS } from '../../constants';
import { Icons } from '../icons';

@Component({
  selector: 'pe-builder-view',
  templateUrl: './builder-view.component.html',
  styleUrls: ['./builder-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebBlogBuilderViewComponent {
  options = OPTIONS;

  constructor(
    public dialogRef: MatDialogRef<PebBlogBuilderViewComponent>,
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

  setValue(value) {
    this.messageBus.emit('blog.set.builder_view', value)
  }

}
