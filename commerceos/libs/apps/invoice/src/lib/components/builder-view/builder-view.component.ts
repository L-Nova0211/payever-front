import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { MessageBus } from '@pe/common';

import { OPTIONS } from '../../constants';

enum ViewIcons {
  'delete' = '/assets/icons/delete.svg',
  'close' = '/assets/icons/close.svg',
  'navigator' = '/assets/icons/navigator.svg',
  'inspector' = '/assets/icons/inspector.svg',
  'master-pages' = '/assets/icons/master-pages.svg',
  'layer-list' = '/assets/icons/layer-list.svg',
}

@Component({
  selector: 'pe-builder-view',
  templateUrl: './builder-view.component.html',
  styleUrls: ['./builder-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebInvoiceBuilderViewComponent {
  options = OPTIONS;

  constructor(
    public dialogRef: MatDialogRef<PebInvoiceBuilderViewComponent>,
    private messageBus: MessageBus,
    public iconRegistry: MatIconRegistry,
    public domSanitizer: DomSanitizer,
  ) {
      Object.entries(ViewIcons).forEach(([name, path]) => {
        iconRegistry.addSvgIcon(
          name,
          domSanitizer.bypassSecurityTrustResourceUrl(`${path}`),
        );
      });
  }
  
  onCloseClick() {
    this.dialogRef.close();
  }

  setValue(value) {
    this.messageBus.emit('invoice.set.builder_view', value)
  }

}
