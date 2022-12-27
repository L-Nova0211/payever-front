import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, concat, merge, Subject } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService } from '@pe/confirmation-screen';
import { PeGridSidenavService } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_CONFIG, PeOverlayConfig, PeOverlayWidgetService, OverlayHeaderConfig } from '@pe/overlay-widget';
import {
  PeMessageChannelMember,
  PeMessageChannelMode,
  PeMessageConversationMemberAddMethod,
} from '@pe/shared/chat';

import { PeMessageChatAction, PeMessageChatActionItem, PeMessageSidenavsEnum } from '../../enums';
import { CONVERSATION_ACTIONS, PeMessageChannelPermissionsEnum } from '../../interfaces';
import {
  MessageChatDialogService,
  PeMessageApiService,
  PeMessageChannelSettingsService,
  PeMessageChatRoomListService,
  PeMessageService,
} from '../../services';
import { PeMessageInviteFormComponent } from '../invite';

import { PeMessageChatPermissionsComponent } from './message-chat-permissions';
import { PeMessageEditInfoComponent } from './message-edit-info';
import { PeMessageInviteLinkComponent } from './message-invite-link';
import { PeMessagePermissionsComponent } from './message-permissions';

@Component({
  selector: 'pe-message-chat-room-settings',
  templateUrl: './message-chat-room-settings.component.html',
  styleUrls: ['./message-chat-room-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeMessageChatRoomSettingsComponent implements OnInit {
  @ViewChild('deleteForEveryOneTemplate', { static: true }) deleteForEveryOneTemplateRef;
  activeChat = this.peMessageChatRoomListService.activeChat;
  subscribers: any;
  admins: any;
  peMessageChatAction = PeMessageChatAction;
  peMessageChannelMode = PeMessageChannelMode;

  currentOverlayConfig?: PeOverlayConfig;
  currentOverlayData?: any;

  isAdmin: boolean;
  canAddMember: boolean;
  actions: PeMessageChatActionItem[];

  constructor(
    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
    private confirmScreenService: ConfirmScreenService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
    private peGridSidenavService: PeGridSidenavService,
    private peMessageApiService: PeMessageApiService,
    private peMessageChannelSettingsService: PeMessageChannelSettingsService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageService: PeMessageService,
    private messageChatDialogService: MessageChatDialogService,
  ) {
    this.currentOverlayConfig = {
      component: PeMessageChatRoomSettingsComponent,
      hasBackdrop: true,
      headerConfig: this.peOverlayConfig,
    };
  }

  private get checkForPermissios(): boolean {
    const { addMethod, permissions } = this.activeChat.currentMember;

    return addMethod !== PeMessageConversationMemberAddMethod.Owner && permissions?.changeGroupInfo === false;
  }

  ngOnInit(): void {
    this.peMessageChatRoomListService.formReopen$.pipe(
      take(1),
      tap((result) => {
        if (result){
          this.peMessageChatRoomListService.overlayFormReopen = false;
          this.reOpenSettingForm();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    const initActiveConversationSettings$ = this.peMessageChatRoomListService.activeChat$.pipe(
      take(1),
      tap(activeChat => {
        const adminMembers = this.peMessageChatRoomListService.getMembersByCategory(true, activeChat.membersInfo);
        this.admins = this.peMessageChatRoomListService.getWhoIsOnline(adminMembers);
        const subscribedMembers = this.peMessageChatRoomListService.getMembersByCategory(false, activeChat.membersInfo);
        this.subscribers = this.peMessageChatRoomListService.getWhoIsOnline(subscribedMembers);
        this.isAdmin = this.peMessageChatRoomListService.isCurrentUserAdmin;
        const hasPermission = permission => this.peMessageChatRoomListService.hasPermission(permission);
        this.canAddMember = hasPermission(PeMessageChannelPermissionsEnum.AddMembers);
        this.actions = CONVERSATION_ACTIONS.filter(({ permissions, types }) => {
          return (
            types.includes(activeChat.type) &&
            (this.isAdmin || permissions.some(permission => hasPermission(permission)))
          );
        });
      }),
    );

    const openPermissionPopUp$ = this.peMessageChatRoomListService.openPermissionPopUp$.pipe(
      tap(this.conversationPermissions),
    );

    merge(initActiveConversationSettings$, openPermissionPopUp$).pipe(takeUntil(this.destroy$)).subscribe();
  }

  private closeForm = (): void => {
    this.peOverlayWidgetService.close();
  };

  private reOpenSettingForm = (): void => {
    this.peOverlayWidgetService.close();
    this.peOverlayWidgetService.open(this.currentOverlayConfig);
  };

  public pushAction(action: PeMessageChatAction): void {
    switch (action) {
      case PeMessageChatAction.Add:
        this.addChannelMembers(PeMessageChannelMode.Common);
        break;
      case PeMessageChatAction.Link:
        this.inviteLink();
        break;
      case PeMessageChatAction.Edit:
        this.editChannel();
        break;
      case PeMessageChatAction.Delete:
        this.chatLeaveDeleteOption();
        break;
      case PeMessageChatAction.Permissions:
        this.conversationPermissions();
        break;
    }
  }

  public addChannelMembers(mode: PeMessageChannelMode): void {
    if (this.checkForPermissios) {
      this.peMessageService.alert(this.translateService.translate('message-app.permissions.add-members'));

      return;
    }

    this.closeForm();

    let dataDependsFromMode: any = {
      data: [],
      lazyLoadData: this.peMessageChannelSettingsService.lazyLoadData$,
      onKeyUp: (event, changeDetectorRef) => {
        this.peMessageChannelSettingsService.keyUp(event, changeDetectorRef);
      },
    };

    if (mode === PeMessageChannelMode.Admin) {
      dataDependsFromMode = {
        data: this.subscribers,
        lazyLoadData: null,
        onKeyUp: (event, changeDetectorRef) => {},
      };
    }

    const onCloseSubject$ = new Subject<boolean>();
    const isLoading$ = new BehaviorSubject<boolean>(false);
    const closeForm = () => {
      onCloseSubject$.next(true);
    };
    const config: PeOverlayConfig = {
      backdropClick: closeForm,
      component: PeMessageInviteFormComponent,
      data: {
        onCloseSubject$,
        isLoading$,
        channel: this.activeChat,
        theme: this.peOverlayConfig.theme,
        mode,
        ...dataDependsFromMode,
      },
      hasBackdrop: true,
      headerConfig: {
        backBtnCallback: closeForm,
        hideHeader: true,
        theme: this.peOverlayConfig.theme,
        title: this.translateService.translate('message-app.sidebar.add'),
      },
      panelClass: 'pe-message-add-admins-overlay',
    };

    this.peOverlayWidgetService.open(config);

    onCloseSubject$
      .pipe(
        filter(close => !!close),
        take(1),
        tap(this.reOpenSettingForm),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  private inviteLink(): void {
    this.closeForm();
    const onSaveSubject$ = new BehaviorSubject<boolean>(false);
    const closeForm = () => {
      onSaveSubject$.next(true);
    };
    const config: PeOverlayConfig = {
      backdropClick: closeForm,
      component: PeMessageInviteLinkComponent,
      data: {
        channel: this.activeChat,
      },
      hasBackdrop: true,
      headerConfig: {
        backBtnCallback: closeForm,
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        doneBtnTitle: this.translateService.translate('message-app.sidebar.done'),
        onSaveSubject$,
        theme: this.peOverlayConfig.theme,
        title: this.translateService.translate('message-app.channel.settings.invite-link'),
      },
      panelClass: 'pe-message-invite-link-overlay',
    };

    const getChatInvites$ = this.peMessageApiService.getChatInvites(this.activeChat._id)
      .pipe(
        tap(channel => {
          config.data.slug = channel[0].code;
          this.peOverlayWidgetService.open(config);
        }));

    const saveAction$ = onSaveSubject$
      .pipe(
        filter(Boolean),
        take(1),
        tap(this.reOpenSettingForm));

    concat(
      getChatInvites$,
      saveAction$,
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  private editChannel(): void {
    if (this.checkForPermissios) {
      this.peMessageService.alert(this.translateService.translate('message-app.permissions.change-group-info'));

      return;
    }

    this.closeForm();
    const onSaveSubject$ = new BehaviorSubject<boolean>(false);
    const closeForm = () => {
      onSaveSubject$.next(true);
    };
    const config: PeOverlayConfig = {
      backdropClick: closeForm,
      component: PeMessageEditInfoComponent,
      data: this.activeChat,
      hasBackdrop: true,
      headerConfig: {
        backBtnCallback: closeForm,
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        doneBtnTitle: this.translateService.translate('message-app.sidebar.done'),
        onSaveSubject$,
        theme: this.peOverlayConfig.theme,
        title: this.activeChat?.title ?? this.translateService.translate('message-app.channel.overlay.title'),
      },
      panelClass: 'pe-message-edit-channel-overlay',
    };

    this.peOverlayWidgetService.open(config);

    onSaveSubject$
      .pipe(
        filter(Boolean),
        take(1),
        tap(this.reOpenSettingForm),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private conversationPermissions = (): void => {
    this.closeForm();
    const onSaveSubject$ = new BehaviorSubject<boolean>(false);
    const closeForm = () => {
      onSaveSubject$.next(true);
    };
    const config: PeOverlayConfig = {
      backdropClick: closeForm,
      component: PeMessageChatPermissionsComponent,
      data: this.activeChat,
      hasBackdrop: true,
      headerConfig: {
        backBtnCallback: closeForm,
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        doneBtnTitle: this.translateService.translate('message-app.sidebar.done'),
        onSaveSubject$,
        removeContentPadding: true,
        theme: this.peOverlayConfig.theme,
        title: this.translateService.translate('message-app.channel.permissions.title'),
      },
      panelClass: 'pe-permissions-settings',
    };

    this.peOverlayWidgetService.open(config);

    onSaveSubject$
      .pipe(
        filter(Boolean),
        take(1),
        tap(this.reOpenSettingForm),
        takeUntil(this.destroy$))
      .subscribe();
  };

  public memberPermissions(member: PeMessageChannelMember): void {
    const isCurrentMemberOwner = this.activeChat.members.some(activeChatMember => {
      return (
        activeChatMember.user === member._id &&
        activeChatMember.addMethod === PeMessageConversationMemberAddMethod.Owner
      );
    });

    this.closeForm();
    const onSaveSubject$ = new BehaviorSubject<boolean>(false);
    const closeForm = () => {
      onSaveSubject$.next(true);
    };
    const config: PeOverlayConfig = {
      backdropClick: closeForm,
      component: PeMessagePermissionsComponent,
      data: {
        member,
        isNotEditable: member._id === this.peMessageService.getUserData().uuid || isCurrentMemberOwner,
        channel: this.activeChat,
      },
      hasBackdrop: true,
      headerConfig: {
        backBtnCallback: closeForm,
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        doneBtnTitle: this.translateService.translate('message-app.sidebar.done'),
        onSaveSubject$,
        theme: this.peOverlayConfig.theme,
        title: member.title,
      },
      panelClass: 'pe-message-permission-overlay',
    };

    this.peOverlayWidgetService.open(config);

    onSaveSubject$
      .pipe(
        filter(Boolean),
        take(1),
        tap(this.reOpenSettingForm),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private chatLeaveDeleteOption(): void {
    this.messageChatDialogService.deleteLeaveChatDialog(
      this.activeChat, this.isAdmin ? this.deleteForEveryOneTemplateRef : null, false
    );
    this.closeForm();
    window.innerWidth <= 720
        && this.peGridSidenavService.sidenavOpenStatus[PeMessageSidenavsEnum.ConversationList].next(false);
  }

}
