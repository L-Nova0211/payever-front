import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

import { AppThemeEnum } from '@pe/common';
import { PeChatMessageFileInterface } from '@pe/shared/chat';

@Component({
  selector: 'pe-chat-message-file-loader',
  templateUrl: 'file-loader.component.html',
  styleUrls: ['file-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeChatMessageFileLoaderComponent {
  @Input() file: PeChatMessageFileInterface;

  @HostBinding('class')
  @Input() theming = AppThemeEnum.default;
}
