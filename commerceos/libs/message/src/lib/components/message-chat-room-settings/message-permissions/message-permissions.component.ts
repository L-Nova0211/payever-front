import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { EMPTY } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { OverlayHeaderConfig, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageChannelRoles } from '@pe/shared/chat';

import { PeMessageMember } from '../../../interfaces/message-websocket.interface';
import { PeMessageChatRoomListService } from '../../../services';
import { PeMessageApiService } from '../../../services/message-api.service';

import { MEMBER_PERMISSIONS, MessagePermissionOptions } from './message-permission.constants';

@Component({
  selector: 'pe-message-permissions',
  templateUrl: './message-permissions.component.html',
  styleUrls: ['./message-permissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessagePermissionsComponent implements OnInit {
  public readonly isNotEditable = this.peOverlayData.isNotEditable;
  public readonly memberPermissions = MEMBER_PERMISSIONS;
  public memberPermissionsForm = this.formBuilder.group({
    sendMessages: [],
    sendMedia: [],
  });

  public removeMemberButtonText: string;

  member: PeMessageMember;
  constructor(
    private formBuilder: FormBuilder,

    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,

    private peMessageApiService: PeMessageApiService,
    private readonly destroy$: PeDestroyService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private confirmScreenService: ConfirmScreenService,
    private translateService: TranslateService,
  ) {
    const memberPermissions = this.peOverlayData.member.permissions;
    this.member = this.peOverlayData.member;
    this.memberPermissionsForm.patchValue(memberPermissions);
    this.memberPermissionsForm.markAsPristine();
    this.peOverlayConfig.doneBtnCallback = () => {
      if (this.memberPermissionsForm.dirty) {
        this.savePermissions();
      } else {
        this.peOverlayConfig.backBtnCallback();
      }
    };
  }

  ngOnInit() {
    this.removeMemberButtonText = this.member.role === PeMessageChannelRoles.Admin
      ? this.translateService.translate('message-app.channel.settings.dismiss-admin')
      : this.translateService.translate('message-app.channel.settings.remove-member');
  }

  private savePermissions(): void {
    this.peOverlayConfig.isLoading = true;
    const { channel, member } = this.peOverlayData;
    const permissionsToUpdate = {
      permissions: this.memberPermissionsForm.value,
      role: member.role,
    };

    this.peMessageApiService.postConversationMemberUpdate(channel._id, member._id, channel.type, permissionsToUpdate)
      .pipe(
        tap(() => {
          const { activeChat } = this.peMessageChatRoomListService;
          const memberIndex = activeChat.membersInfo.findIndex(memberInfo => memberInfo.user._id === member._id);
          if (memberIndex !== -1) {
            activeChat.membersInfo[memberIndex].permissions = this.memberPermissionsForm.value;
          }
          this.peOverlayConfig.onSaveSubject$.next(true);
          this.peOverlayConfig.isLoading = false;
        }),
        catchError(() => {
          this.peOverlayConfig.onSaveSubject$.next(true);

          return EMPTY;
        }))
      .subscribe();
  }

  public isHideOption(option: string): boolean {
    return this.peOverlayData.member.role !== PeMessageChannelRoles.Admin
      && (option === MessagePermissionOptions.addMembers
      || option === MessagePermissionOptions.changeGroupInfo);
  }

  public dismissMember(): void {
    const { channel, member } = this.peOverlayData;
    this.showDismissMemberConfirmationDialog(channel, member);
  }

  public showDismissMemberConfirmationDialog(channel, member) {
    const headings: Headings = {
      title:  this.translateService.translate
        ('message-app.channel.settings.remove-member-overlay.title')
        .replace('{memberLabel}', member.label),
      subtitle: '',
      declineBtnText:
        this.translateService.translate('message-app.channel.settings.remove-member-overlay.decline'),
      confirmBtnText:
        this.translateService.translate('message-app.channel.settings.remove-member-overlay.confirm'),
      icon: {
        iconType: null,
        path: null,
      },
    };

    this.confirmScreenService
      .show(headings, true)
      .pipe(
        switchMap(val => {
          if (val) {
            return this.peMessageApiService.postConversationMemberExclude(channel._id, member._id, channel.type).pipe(
              tap(() => {
                this.peOverlayConfig.onSaveSubject$.next(true);
              }),
              catchError(() => {
                this.peOverlayConfig.onSaveSubject$.next(true);

                return EMPTY;
              })
            );
          }
        }),
        takeUntil(this.destroy$)
      ).subscribe();
  }
}
