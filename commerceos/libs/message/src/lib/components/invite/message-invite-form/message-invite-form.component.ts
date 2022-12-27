import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { of } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageChannelType, PeMessageChatSteep } from '@pe/shared/chat';

import { InviteFacadeClass } from '../../../classes';
import { PeMessageChatType } from '../../../enums';
import { PeMessageCreatingChatData } from '../../../interfaces';
import { PeMessageChatRoomListService } from '../../../services';
import { PeMessageApiService } from '../../../services/message-api.service';
import { PeMessageGuardService } from '../../../services/message-guard.service';
import { PeMessageService } from '../../../services/message.service';

@Component({
  selector: 'pe-message-invite-form',
  templateUrl: './message-invite-form.component.html',
  styleUrls: ['./message-invite-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
    {
      provide: InviteFacadeClass,
      useFactory: (
        peMessageService: PeMessageService,
        peMessageApiService: PeMessageApiService,
        peMessageGuardService: PeMessageGuardService,
      ) => {
        return new InviteFacadeClass(
          peMessageService.app,
          peMessageApiService,
          peMessageGuardService
        );
      },
      deps: [PeMessageService, PeMessageApiService, PeMessageGuardService],
    },
  ],
})
export class PeMessageInviteFormComponent implements OnInit, AfterViewInit {
  @HostBinding('class.pe-message-invite-form') peMessageInviteForm = true;
  @HostBinding('class') hostClass = this.peOverlayData.theme;

  @ViewChild('formContent', { static: true }) formContentRef: ElementRef;

  messageChatType = PeMessageChatType.DirectChat;
  type = PeMessageChannelType.Private;
  title: string;
  nextButton: string;
  code: '';
  invitationId: '';
  optionsItemWidth;
  currentStep = PeMessageChatSteep.Main;

  constructor(
    public inviteClass: InviteFacadeClass,
    private changeDetectorRef: ChangeDetectorRef,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private destroyed$: PeDestroyService,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: PeMessageCreatingChatData,
    @Inject(PE_OVERLAY_CONFIG) public peOverlayConfig: any,
  ) { }

  ngOnInit(): void {
    this.inviteClass.create();
    this.inviteClass.chatClass.postIntegrationChannel$ = of(null);

    this.peMessageChatRoomListService.activeChat$.pipe(
      filter((chat) => !!chat),
      tap((chat)=> {
        this.inviteClass.chat = chat;
      }),
      switchMap(()=> {
        return this.inviteClass.chatClass.next(this.peOverlayData);
      }),
      tap((e)=> {
        if (e.length) {
          this.invitationId = e[0]?._id;
        }
        }),
      takeUntil(this.destroyed$),
      ).subscribe();
  }

  ngAfterViewInit() {
    this.optionsItemWidth = this.formContentRef.nativeElement.scrollWidth - 2;
    this.changeDetectorRef.detectChanges();
  }

  cancel(): void {
    this.peOverlayData.onCloseSubject$.next(true);
  }

  changeStep(step: PeMessageChatSteep): void {
    this.currentStep = step;
    this.changeDetectorRef.detectChanges();
  }

  done(): void {
    this.currentStep = PeMessageChatSteep.Contacts;
    this.changeDetectorRef.detectChanges();
  }
}
