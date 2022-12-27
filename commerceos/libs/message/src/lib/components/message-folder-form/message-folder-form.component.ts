import { ChangeDetectionStrategy, Component, HostBinding, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';


@Component({
  selector: 'pe-message-folder-form',
  templateUrl: './message-folder-form.component.html',
  styleUrls: ['./message-folder-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeMessageFolderFormComponent {

  @HostBinding('class') class = this.peOverlayData.theme;

  folderFormGroup = this.formBuilder.group({
    _id: [],
    name: [],
    position: [0],
    parentFolderId: [],
  });

  constructor(
    private destroyed$: PeDestroyService,
    private formBuilder: FormBuilder,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public peOverlayConfig: any,
  ) {
    this.folderFormGroup.patchValue(this.peOverlayData.folder, { emitEvent: false });
    this.folderFormGroup.valueChanges.pipe(
      tap(value => { this.peOverlayData.newFolder = value; }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

}
