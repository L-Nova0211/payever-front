import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

import { AppThemeEnum } from '@pe/common';
import { PeChatMessageFileInterface } from '@pe/shared/chat';
import { fileSize } from '@pe/shared/utils/file-size';

@Component({
  selector: 'pe-chat-message-file-list',
  templateUrl: 'file-list.component.html',
  styleUrls: ['file-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeChatMessageFileListComponent {
  @Input() files: PeChatMessageFileInterface[] = [];

  @HostBinding('class')
  @Input() theming = AppThemeEnum.default;

  public fileSize = fileSize;

  public trackBy(file: PeChatMessageFileInterface, index: number) {
    return file._id;
  }
}
