import { AfterViewInit, ChangeDetectionStrategy, Component, HostBinding, Injector, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { AppThemeEnum } from '@pe/common';
import { PeChatMessage, PeChatMessageAttachment, PeChatMessageFileInterface } from '@pe/shared/chat';

import { PeChatMessageFile } from './chat-message-file.class';

@Component({
  selector: 'pe-chat-message-file',
  styleUrls: ['./chat-message-file.component.scss'],
  templateUrl: './chat-message-file.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeChatMessageFileComponent implements AfterViewInit {
  public groupFiles: PeChatMessageFileInterface[] = [];
  private readonly initFilesLoading = new Subject<void>();

  @HostBinding('class')
  @Input() theme = AppThemeEnum.default;

  @Input() reply: boolean;
  @Input() notReply: boolean;
  @Input() message: string;
  @Input() messageObj: PeChatMessage;
  @Input() accentColor: string;
  @Input() sender: string;
  @Input() date: Date;
  @Input() dateFormat = 'shortTime';

  @Input() set files(attachments: PeChatMessageAttachment[]) {
    this.groupFiles = (attachments || []).map(this.initFile);
  }

  constructor(private injector: Injector) { }

  ngAfterViewInit(): void {
    this.messageObj.intersectedViewport = () => {
      this.initFilesLoading.next();
    };
  }

  private readonly initFile = (attachment: PeChatMessageAttachment): PeChatMessageFileInterface => {
    const file = new PeChatMessageFile(attachment, this.injector);
    this.initFilesLoading.pipe(take(1), tap(file.download)).subscribe();

    return file;
  };

  public isNotMedia(): boolean {
    return this.groupFiles.some(file => !file.isMedia);
  }
}
