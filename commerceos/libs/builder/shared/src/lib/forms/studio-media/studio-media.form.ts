import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { filter, takeUntil } from 'rxjs/operators';

import { MediaItemType, MediaType, PebEditorState } from '@pe/builder-core';
import { MediaDialogService } from '@pe/builder-media';
import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-studio-media-form',
  templateUrl: './studio-media.form.html',
  styleUrls: ['./studio-media.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class EditorStudioMediaForm {
  @Input() formGroup: FormGroup;
  @Input() label = 'Choose media from payever Studio';
  @Input() type: MediaType = MediaType.Image;

  constructor(
    private readonly destroy$: PeDestroyService,
    private state: PebEditorState,
    private mediaDialogService: MediaDialogService,
  ) {
  }

  openStudio(): void {
    const type = this.type === MediaType.Video ? MediaItemType.Video : MediaItemType.Image;
    const dialog = this.mediaDialogService.openMediaDialog({ types: [type] });
    dialog.afterClosed().pipe(
      takeUntil(this.destroy$),
      filter(data => data && data !== ''),
    ).subscribe((data) => {
      if (this.type === MediaType.Image) {
        this.formGroup.patchValue({
          src: data.thumbnail,
        });
      } else if (this.type === MediaType.Video) {
        this.formGroup.patchValue({
          source: data.sourceUrl,
          preview: data.thumbnail,
        });
      }
    });
  }
}
