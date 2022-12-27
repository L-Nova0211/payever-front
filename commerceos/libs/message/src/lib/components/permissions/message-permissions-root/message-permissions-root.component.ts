import { Component, OnInit, ChangeDetectionStrategy, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, EMPTY, forkJoin, of, Subject } from 'rxjs';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { AppThemeEnum, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageChannelMemberByCategory, PeMessageChannelRoles } from '@pe/shared/chat';

import { PeMessageChannelPermissions } from '../../../interfaces';
import { PeMessageApiService, PeMessageChatRoomListService, PeMessageService } from '../../../services';
import { PeMessageChatPermissionsComponent } from '../../message-chat-room-settings';

@Component({
  selector: 'pe-permissions-root',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessagePermissionsRootComponent implements OnInit {
  public readonly theme = this.pebEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  activeChat = this.peMessageChatRoomListService.activeChat;

  subscribers: PeMessageChannelMemberByCategory[];
  admins: PeMessageChannelMemberByCategory[];

  constructor(
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private destroyed$: PeDestroyService,
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private  dialog: MatDialog,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private peMessageService: PeMessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private pebEnvService: PebEnvService,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
  ) {}

  ngOnInit(): void {
    const chatId = this.route.snapshot.params.chatId;
    this.peMessageApiService.getChat(chatId).pipe(
      tap(res => {
        this.permissionsSettings(this.activeChat);
      }),
      switchMap(() => {
        return this.peMessageApiService.getConversationMembers(this.activeChat?.type, this.activeChat?._id).pipe(
          tap(subscribersInfo => {
            this.subscribers = this.membersByCategory(
              [PeMessageChannelRoles.Subscriber, PeMessageChannelRoles.Member],
              subscribersInfo,
            );
            this.admins = this.membersByCategory([PeMessageChannelRoles.Admin], subscribersInfo);
            this.changeDetectorRef.detectChanges();
          }),
        );
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  permissionsSettings(activeChat): void {
    const onCloseSubject$ = new Subject<any>();
    const onSaveSubject$ = new BehaviorSubject<boolean>(false);
    const peOverlayConfig: PeOverlayConfig = {
      data: activeChat,
      hasBackdrop: true,
      backdropClick: () => {
        this.peOverlayWidgetService.close();
        this.router.navigate([`business`, `${this.pebEnvService.businessId}`, `message`]);
      },
      headerConfig: {
        removeContentPadding: true,
        backBtnCallback: () => {
          this.peOverlayWidgetService.close();
          this.router.navigate([`business`, `${this.pebEnvService.businessId}`, `message`]);
        },
        doneBtnCallback: () => this.peOverlayWidgetService.close(),
        doneBtnTitle: this.translateService.translate('message-app.sidebar.done'),
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        title: this.translateService.translate('message-app.channel.permissions.title'),
        theme: this.theme,
        onSaveSubject$,
      },
      panelClass: 'pe-permissions-settings',
      component: PeMessageChatPermissionsComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onSaveSubject$
      .pipe(
        filter(Boolean),
        take(1),
        tap(() => {
          this.peOverlayWidgetService.close(),
          this.router.navigate([`business`, `${this.pebEnvService.businessId}`, `message`]);
        }),
        takeUntil(this.destroyed$))
      .subscribe();

    onCloseSubject$
      .pipe(
        filter(close => !!close),
        take(1),
        switchMap((payload: PeMessageChannelPermissions) => {
          const { _id, type, business } = activeChat;

          return typeof payload === 'object'
              ? forkJoin([
                  this.peMessageApiService.postConversationPermissions(business, _id, type, payload),
                  this.peMessageApiService.getConversationMembers(type, _id),
                ])
              : of([EMPTY, EMPTY]);
        }),
        tap(([chatResponse, members]) => {
          this.peMessageChatRoomListService.updatePermissionsData(chatResponse);
          this.subscribers = this.membersByCategory(
            [PeMessageChannelRoles.Subscriber, PeMessageChannelRoles.Member],
            members,
          );
          this.admins = this.membersByCategory([PeMessageChannelRoles.Admin], members);
          this.peOverlayWidgetService.close();
          this.router.navigate([`business`, `${this.pebEnvService.businessId}`, `message`]);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  membersByCategory(roles: PeMessageChannelRoles[], subscribersInfo): PeMessageChannelMemberByCategory[] {
    return (
      subscribersInfo
        .map(member => roles.includes(member?.role) ? this.peMessageChatRoomListService.getMember(member) : [])
        .filter(member => member) ?? []
    );
  }
}
