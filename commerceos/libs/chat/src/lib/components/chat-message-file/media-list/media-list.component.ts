import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

import { AppThemeEnum } from '@pe/common';
import { PeChatMessageFileInterface } from '@pe/shared/chat';

@Component({
  selector: 'pe-chat-message-media-list',
  templateUrl: 'media-list.component.html',
  styleUrls: ['media-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeChatMessageMediaListComponent {
  @Input() files: PeChatMessageFileInterface[] = [];

  @HostBinding('class')
  @Input() theming = AppThemeEnum.default;

  public get isSingleFile(): boolean {
    return this.files.length === 1;
  }

  public get isFileList(): boolean {
    return this.files.length > 1;
  }

  public trackBy(file: PeChatMessageFileInterface, index: number) {
    return file._id;
  }
}
