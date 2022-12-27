import { Pipe, PipeTransform } from '@angular/core';

import { TranslateService } from '@pe/i18n-core';
import { PeMessageChannelMemberByCategory } from '@pe/shared/chat';

import { PeTruncatingPipe } from '../truncating/truncating.pipe';

@Pipe({
  name: 'typing',
})
export class PeTypingMembersPipe implements PipeTransform {
  typingString: string;

  constructor(
    private translateService: TranslateService,
    private truncatingPipe: PeTruncatingPipe,
  ) {}

  transform(
    value: PeMessageChannelMemberByCategory[], 
    truncateLength: number, 
  ): string {
    if (!value) {
      return;
    }

    let typingString = `${value.map(a => a.userAccount.firstName).join(', ')}`;
    typingString +=
      value.length === 1
        ? ` ${this.translateService.translate('message-app.channel.istyping')}`
        : ` ${this.translateService.translate('message-app.channel.aretyping')}`;

    return this.truncatingPipe.transform(typingString, truncateLength);
  }
}
