import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { PeChatOptions } from '../../chat.options';


@Component({
  selector: 'pe-chat-message-map',
  template: `
    <pe-chat-message-file [files]="[file]" [message]="message" [sender]="sender" [date]="date"
     [dateFormat]="dateFormat"></pe-chat-message-file>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeChatMessageMapComponent {

  @Input() message: string;
  @Input() sender: string;
  @Input() date: Date;
  @Input() dateFormat = 'shortTime';
  @Input() latitude: number;
  @Input() longitude: number;

  get file() {
    return {
      url: `${this.environmentConfig}?center=${this.latitude},${this.longitude}&zoom=12&size=400x400&key=${this.mapKey}`,
      type: 'image/png',
      icon: 'location',
    };
  }

  mapKey: string;

  constructor(
    options: PeChatOptions,
    @Inject(PE_ENV) private environmentConfig: EnvironmentConfigInterface,
  ) {
    this.mapKey = options.messageGoogleMapKey;
  }
}
