import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  ViewEncapsulation,
  ChangeDetectorRef, ViewChild, ElementRef,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { EMPTY, forkJoin } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageChannelMode, PeMessageChannelRoles } from '@pe/shared/chat';
import { PeUser, UserState } from '@pe/user';

import { InviteFacadeClass } from '../../../classes';
import { PeMessageChannelAddAdminsData } from '../../../interfaces';
import {
  PeMessageService,
  PeMessageChatRoomListService,
  PeMessageApiService,
  PeMessageChannelSettingsService, PeMessageGuardService,
} from '../../../services';

@Component({
  selector: 'pe-add-admins',
  templateUrl: './message-add-admins.component.html',
  styleUrls: ['./message-add-admins.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
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
export class PeMessageAddAdminsComponent implements OnInit {
  @SelectSnapshot(UserState.user) userData: PeUser;

  @ViewChild('formContent', { static: true }) formContentRef: ElementRef;

  channelGroup = this.formBuilder.group({
    members: [[]],
  });

  peMessageChannelMode = PeMessageChannelMode;

  constructor(
    public peMessageChannelSettingsService: PeMessageChannelSettingsService,
    public changeDetectorRef: ChangeDetectorRef,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: PeMessageChannelAddAdminsData,
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private chatClass: InviteFacadeClass,
    private formBuilder: FormBuilder,
    private destroyed$: PeDestroyService,
    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: any,
  ) { }

  ngOnInit(): void {
    this.peOverlayConfig.doneBtnCallback = this.addAdmin.bind(this);

    if (this.peOverlayData.mode === PeMessageChannelMode.Common) {
      this.peOverlayConfig.doneBtnCallback = this.addMember.bind(this);
    }

    this.peOverlayConfig.backBtnCallback = () => {
      this.peOverlayData.onCloseSubject$.next(true);
    };
    this.peMessageChannelSettingsService.init(this.destroyed$, this.formContentRef);
  }

  addMember(): void {
    const members = this.channelGroup.value.members;
    this.chatClass.createByRole().next(this.peOverlayData as any).pipe(
      switchMap((invitation) =>
        this.chatClass.inviteMembers(members, this.peMessageChatRoomListService, invitation[0]._id)),
    ).subscribe();

    this.peOverlayData.onCloseSubject$.next(true);
  }

  addAdmin() {
    const invitations$ = [];
    const options = {
      role: PeMessageChannelRoles.Admin,
      permissions: {
        sendMessages: true,
        sendMedia: true,
        addMembers: true,
        pinMessages: true,
        changeGroupInfo: true,
      },
    };

    this.channelGroup.value.members.forEach((member: any) => {
      invitations$.push(
        this.peMessageApiService.postConversationMemberUpdate(
          this.peOverlayData.channel._id,
          member._id,
          this.peOverlayData.channel.type,
          options,
        ),
      );
    });
    forkJoin([...invitations$]).pipe(
      tap( () => {
        this.peOverlayData.onCloseSubject$.next(true);
      }),
      catchError( () => {
        this.peOverlayData.onCloseSubject$.next(true);

        return EMPTY;
      }),
    ).subscribe();
  }
}
