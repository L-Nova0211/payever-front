import { Component, ChangeDetectionStrategy, ViewEncapsulation, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { merge } from 'rxjs';
import { tap, take } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageChannelMember, PeMessageChannelType } from '@pe/shared/chat';
import { PePickerDataInterface } from '@pe/ui';
import { PeUser, UserState } from '@pe/user';

import { PeAdditionalChannelSettingsItems } from '../../../enums';
import { PeMessageApiService, PeMessageChatRoomListService } from '../../../services';

@Component({
  selector: 'pe-message-additional-channel-settings',
  templateUrl: './message-additional-channel-settings.component.html',
  styleUrls: ['./message-additional-channel-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeMessageAdditionalChannelSettingsComponent implements OnInit {
  @SelectSnapshot(UserState.user) userData: PeUser;

  title = this.translateService.translate('message-app.channel.settings.more');
  buttonLeftSide = this.translateService.translate('message-app.sidebar.cancel');

  members = this.peOverlayData.members?.reduce((accumulator, member) => {
    if (member._id !== this.userData._id) {
      accumulator.push(this.transformMembers(member));
    }

    return accumulator;
  }, []);

  additionalSettingsGroup = this.formBuilder.group({
    subType: [this.peOverlayData.channel.subType, Validators.required],
    signed: [this.peOverlayData.channel.signed, Validators.required],
    removedUsers: [],
  });

  peAdditionalChannelSettingsItems = PeAdditionalChannelSettingsItems;

  settingsItems = [
    { type: PeAdditionalChannelSettingsItems.Type, label: 'message-app.channel.settings.additional.type' },
    { type: PeAdditionalChannelSettingsItems.Sign, label: 'message-app.channel.settings.additional.sign' },
    { type: PeAdditionalChannelSettingsItems.Remove, label: 'message-app.channel.settings.additional.remove' },
  ];

  types = [
    { title: 'message-app.channel.form.type.public', value: PeMessageChannelType.Public },
    { title: 'message-app.channel.form.type.private', value: PeMessageChannelType.Private },
    { title: 'message-app.channel.form.type.integration', value: PeMessageChannelType.Integration },
  ];

  settingsLevel = 0;

  removedMembers = this.peOverlayData.channel?.removedMembers?.map(
    (memberId: string) => {
      const member = this.peOverlayData.members.find((item: any) => item._id === memberId);
      if (member) {
        return this.transformMembers(member);
      }

      return null;
    }).filter((item: any) => !!item);

  removeUser = (singleMember?: PePickerDataInterface) => {
    const channelMemberExclude$ = [];
    if (singleMember) {
      channelMemberExclude$.push(
        this.peMessageApiService.postConversationMemberExclude(
          this.peOverlayData.channel._id,
          singleMember.value,
          this.peOverlayData.channel.type
        )
      );
    } else {
      this.additionalSettingsGroup.value.removedUsers.forEach((member: PePickerDataInterface) => {
        channelMemberExclude$.push(
          this.peMessageApiService.postConversationMemberExclude(
            this.peOverlayData.channel._id,
            member.value,
            this.peOverlayData.channel.type
          )
        );
      });
    }

    merge(...channelMemberExclude$).pipe(
      tap(() => {
        this.additionalSettingsGroup.patchValue({
          removedUsers: [],
        });
      }),
    ).subscribe();
  };

  constructor(
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageApiService: PeMessageApiService,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
  ) { }

  ngOnInit() {
    this.additionalSettingsGroup.patchValue({
      removedUsers: this.members,
    });
  }

  clickButtonLeftSide(): void {
    if (this.settingsLevel === 0) {
      this.peOverlayData.onCloseSubject$.next(true);
    } else {
      this.settingsLevel = 0;
      this.title = this.translateService.translate('message-app.channel.settings.more');
      this.buttonLeftSide = this.translateService.translate('message-app.sidebar.cancel');
    }
  }

  done(): void {
    const channelSettings = {
      subType: this.additionalSettingsGroup.value.subType,
      signed: this.additionalSettingsGroup.value.signed,
    };

    const { _id, title, description, photo, business } = this.peOverlayData.channel;

    this.peMessageApiService.patchChannel(
      _id,
      { title, description, photo, ...channelSettings },
      business,
    ).pipe(
      take(1),
      tap(res => {
        this.peMessageChatRoomListService.activeChat = { ...this.peOverlayData.channel, ...channelSettings };
      }),
    ).subscribe();
    this.peOverlayData.onCloseSubject$.next(true);
  }

  changeLevel(settingsItem: any): void {
    switch (settingsItem.type) {
      case PeAdditionalChannelSettingsItems.Type:
        this.title = this.translateService.translate('message-app.channel.settings.additional.type');
        this.settingsLevel = 1;
        break;
      case PeAdditionalChannelSettingsItems.Sign:
        this.title = this.translateService.translate('message-app.channel.settings.additional.sign');
        this.settingsLevel = 2;
        break;
      case PeAdditionalChannelSettingsItems.Remove:
        this.title = this.translateService.translate('message-app.channel.settings.additional.remove');
        this.settingsLevel = 3;
        break;
    }

    this.buttonLeftSide = this.translateService.translate('message-app.message-integration.back');
  }

  transformMembers(member: PeMessageChannelMember): PePickerDataInterface {
    return {
          label: member.title,
          image: member.avatar ?? './assets/icons/contact-grid.png',
          value: member._id,
        };
  }

  unblockUser(memberId: string): void {

  }
}
