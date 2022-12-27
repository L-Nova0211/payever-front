import {
  Component, ChangeDetectionStrategy, HostBinding, Inject, OnInit,
  Input, Output, EventEmitter,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { tap, takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageChannelType, PeMessageChatSteep } from '@pe/shared/chat';

import { ChannelFacadeClass } from '../../../../classes';
import { PeMessageTypeChannel } from '../../../../interfaces';

@Component({
  selector: 'pe-creating-chat-steps-type',
  templateUrl: './creating-chat-steps-type.component.html',
  styleUrls: ['./creating-chat-steps-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeCreatingChatStepsTypeComponent implements OnInit {
  @HostBinding('class') hostClass = this.peOverlayData.theme;

  @Input() step: PeMessageChatSteep;
  @Input() channelClass: ChannelFacadeClass;

  @Output() typeChannel = new EventEmitter<PeMessageTypeChannel>();

  @Output() typeChannelChanging = new EventEmitter<PeMessageChannelType>();

  types = [
    { title: 'message-app.channel.form.type.public', value: PeMessageChannelType.Public },
    { title: 'message-app.channel.form.type.private', value: PeMessageChannelType.Private },
    { title: 'message-app.channel.form.type.integration', value: PeMessageChannelType.Integration },
  ];

  typeGroup = this.formBuilder.group({
    subType: [PeMessageChannelType.Public, Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private destroyed$: PeDestroyService,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
  ) {
  }

  ngOnInit(): void {
    this.typeGroup.valueChanges.pipe(
      tap(data => {
        this.typeChannelChanging.emit(data.subType);
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
