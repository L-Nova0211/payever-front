import { ChangeDetectionStrategy, Component, HostBinding, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeMessageFolder } from '../../interfaces';


@Component({
  selector: 'pe-message-folder-tree',
  templateUrl: './message-folder-tree.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeMessageFolderTreeComponent {

  @HostBinding('class') class = this.peOverlayData.theme;

  folderTree = this.peOverlayData.folderTree;
  foldersControl = new FormControl();

  constructor(
    private destroyed$: PeDestroyService,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public peOverlayConfig: any,
  ) {
    this.foldersControl.valueChanges.pipe(
      tap((value: PeMessageFolder[]) => {
        this.peOverlayConfig.onSaveSubject$.next(value.length ? value[0]._id : undefined);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

}
