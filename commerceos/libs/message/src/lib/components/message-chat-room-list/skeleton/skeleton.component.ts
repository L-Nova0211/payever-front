import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { range } from 'lodash-es';

import { AppThemeEnum } from '@pe/common';

@Component({
  selector: 'pe-chat-list-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PeChatListSkeletonComponent {

  @Input() theme: AppThemeEnum = AppThemeEnum.default;

  get chats(): number {
    return range(8);
  }

}
