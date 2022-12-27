import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select } from '@ngxs/store';
import { combineLatest, EMPTY, Observable, of, Subject } from 'rxjs';
import { catchError, take, takeUntil, tap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { PeDestroyService } from '@pe/common';
import { ConfirmActionDialogComponent } from '@pe/confirm-action-dialog';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeMessageIntegrationSettings } from '@pe/shared/chat';

import { ChatListFacade } from '../../../classes';
import {
  PeMessageIntegrationThemeItem,
  PeMessageIntegrationThemeItemValues,
  PeMessageBubble,
  PeMessageSettings, PeMessageChannelInfo,
} from '../../../interfaces';
import {
  PeMessageService,
  PeMessageApiService,
  PeMessageIntegrationService,
  PeMessageChatRoomListService,
} from '../../../services';
import { MessageState } from '../../../state/message.state';
import { PeMessageAppearanceComponent } from '../message-appearance';

@Component({
  selector: 'pe-message-integration-root',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ PeDestroyService ],
})
export class PeMessageIntegrationRootComponent implements OnInit {
  @SelectSnapshot(MessageState.messageSettings) settings: PeMessageSettings;
  @Select(MessageState.messageCurrentSettings) currentSettings$: Observable<PeMessageIntegrationThemeItem>;

  theme = 'dark';
  config: PeOverlayConfig;

  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private peMessageService: PeMessageService,
    private peMessageIntegrationService: PeMessageIntegrationService,
    private peMessageApiService: PeMessageApiService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private envService: PebEnvService,
    private router: Router,
    private route: ActivatedRoute,
    private destroyed$: PeDestroyService,
    private peMessageChatListService: PeMessageChatRoomListService
  ) { }

  ngOnInit(): void {
    this.peMessageApiService.getIntegrationChannelList({
      filters: {
        usedInWidget: true,
      },
    }).pipe(
      tap((integrationChannelList) => {
        const chatList = new ChatListFacade(this.peMessageService);
        this.peMessageIntegrationService.integrationChannelList
          = chatList.init(integrationChannelList).normalizeChatList(this.peMessageChatListService) as any;
        this.openAppearanceOverlay();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private openAppearanceOverlay(): void {
    const onCloseSubject$ = new Subject<any>();
    const prevSettings: PeMessageIntegrationThemeItemValues =
      Object.assign({}, this.peMessageIntegrationService.currSettings.settings);
    const prevBubble: PeMessageBubble = Object.assign({}, this.peMessageService.bubble);
    const pervSettingsName: string = this.peMessageIntegrationService.currSettings.name || 'default';

    this.config = {
      hasBackdrop: true,
      backdropClick: () => {
        this.confirmDialogAppearance(prevSettings, pervSettingsName, prevBubble);
      },
      component: PeMessageAppearanceComponent,
      data: {
        channelList: this.peMessageIntegrationService.integrationChannelList,
        onCloseSubject$,
        theme: this.theme,
      },
      backdropClass: 'appearance-backdrop',
      panelClass: 'appearance-widget-panel',
      headerConfig: {
        title: this.translateService.translate('message-app.message-interface.integration'),
        theme: 'dark',
        backBtnTitle: this.translateService.translate('message-app.message-interface.cancel'),
        backBtnCallback: () => {
          this.confirmDialogAppearance(prevSettings, pervSettingsName, prevBubble);
        },
        cancelBtnTitle: '',
        cancelBtnCallback: () => { },
        doneBtnTitle: this.translateService.translate('message-app.message-interface.done'),
        doneBtnCallback: this.saveSettingsWidget.bind(this),
      },
    };

    onCloseSubject$.pipe(
      take(1),
      tap(() => {
        this.peOverlayWidgetService.close();
      }),
    ).subscribe();

    if (this.peMessageIntegrationService.integrationChannelList.length > 0) {
        this.peOverlayWidgetService.open(this.config);
    }
    else {
      this.informAboutEmptyPublicChannelList();
    }
  }

  private dismissChangesInAppearance(
    prevSettings: PeMessageIntegrationThemeItemValues,
    pervSettingsName: string, prevBubble: PeMessageBubble): void {

    this.router.navigate(['../'], { relativeTo: this.route.parent });
    this.peOverlayWidgetService.close();

    this.changeIntegrationSettingsState(prevSettings, pervSettingsName);

    this.peMessageIntegrationService.currSettings.settings.defaultPresetColor = 0;
    this.peMessageIntegrationService.currSettings.settings.customPresetColors =
      this.peMessageIntegrationService.currSettings.settings.customPresetColors.filter(item => !item.newItem);

    this.peMessageService.bubble = prevBubble;
  }

  private confirmDialogAppearance(
    prevSettings: PeMessageIntegrationThemeItemValues,
    pervSettingsName: string, prevBubble: PeMessageBubble): void {

    const config: MatDialogConfig<any> = {
      data: {
        theme: this.theme,
        title: this.translateService.translate('message-app.message-integration.dismiss-changes'),
        cancelButtonTitle: this.translateService.translate('message-app.message-overlay.delete.decline'),
        confirmButtonTitle: this.translateService.translate('message-app.message-overlay.delete.confirm'),
      },
      panelClass: 'dialog-dismiss-integration-changes',
    };
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, config);
    dialogRef.afterClosed().subscribe((dismiss: boolean | undefined) => {
      if (dismiss) {
        this.dismissChangesInAppearance(prevSettings, pervSettingsName, prevBubble);
      }

      this.peMessageService.isLiveChat = false;
      this.peMessageService.isEmbedChat = false;
    });
  }

  private informAboutEmptyPublicChannelList(): void {
    const config: MatDialogConfig<any> = {
      data: {
        theme: this.theme,
        title: this.translateService.translate('message-app.message-integration.not-exist-integration-channel'),
        subtitle: this.translateService.translate('message-app.message-integration.create-integration-channel'),
        cancelButtonTitle: this.translateService.translate('message-app.message-integration.cancel'),
        confirmButtonTitle: this.translateService.translate('message-app.message-integration.new-channel'),
      },
      panelClass: 'dialog-empty-integration-channel',
    };
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, config);
    dialogRef.afterClosed().pipe(
      tap((create: boolean | undefined) => {
        if (create) {
          this.router.navigate(['../channel'], { relativeTo: this.route.parent });
        } else {
          this.router.navigate(['../'], { relativeTo: this.route.parent });
        }
      }),
    ).subscribe();
  }

  private saveSettingsWidget(): void {
    if (this.config.headerConfig.isLoading) { return; }
    this.config.headerConfig.doneBtnTitle = this.translateService.translate('loading');
    this.config.headerConfig.isLoading = true;
    combineLatest([
      ...this.saveIntegration(),
      this.saveTheme(),
      this.saveBubble(),
    ]).pipe(
      tap(() => {
        this.router.navigate(['../'], { relativeTo: this.route.parent });
        this.peOverlayWidgetService.close();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  saveIntegration(): Observable<PeMessageChannelInfo>[] {
    const patchIntegrationChannels$ = [];
    this.config.data.channelList.filter(item => item.usedInWidget).forEach(item => {
      const ICList = this.peMessageIntegrationService.integrationChannelList;
      const isUsedInWidget = ICList.length === 0 || !!ICList.find(ICItem => ICItem.value === item._id);
      patchIntegrationChannels$.push(this.peMessageApiService.patchIntegrationChannel(
        this.envService.businessId,
        item._id,
        { usedInWidget: isUsedInWidget }
      ).pipe(catchError(() => EMPTY)));
    });

    return patchIntegrationChannels$;
  }

  saveBubble(): Observable<any> {
    const bubble = this.peMessageService.bubble;
    const bubbleClear: PeMessageBubble = {
      bgColor: PeMessageIntegrationSettings.bubbleBgColor,
      textColor: PeMessageIntegrationSettings.bubbleTextColor,
      ...bubble,
    };
    delete bubbleClear.businessDocument;
    delete bubbleClear.business;
    delete bubbleClear.businessId;
    delete bubbleClear.id;
    delete bubbleClear._id;
    delete bubbleClear.__v;

    return this.peMessageApiService.patchBubble(bubbleClear);
  }

  saveTheme(): Observable<any> {
    // clean preset colors from useless variables
    this.peMessageIntegrationService.currSettings.settings.customPresetColors =
      this.peMessageIntegrationService.currSettings.settings.customPresetColors
        .map(({ _id, newItem, ...item }) => item);

    // set up default preset colors on head of stack
    const defaultPresetColor = this.peMessageIntegrationService.currSettings.settings.defaultPresetColor;
    if (defaultPresetColor && defaultPresetColor > 0) {
      const currentSettings = this.peMessageIntegrationService.currSettings;
      const defaultCPC = this.peMessageIntegrationService
        .currSettings.settings.customPresetColors.splice(defaultPresetColor, 1);
      currentSettings.settings.customPresetColors =
        [...defaultCPC, ...this.peMessageIntegrationService.currSettings.settings.customPresetColors];

      this.peMessageIntegrationService.currSettings = currentSettings;
      this.peMessageIntegrationService.currSettings.settings.defaultPresetColor = 0;
    }

    this.changeIntegrationSettingsState(
      this.peMessageIntegrationService.currSettings.settings,
      this.peMessageIntegrationService.currSettings.name as string
    );

    const themeItem: PeMessageIntegrationThemeItem = this.peMessageIntegrationService.currSettings;
    const themeItemClear: PeMessageIntegrationThemeItem = {
      isDefault: themeItem.isDefault,
      settings: themeItem.settings,
    };

    return themeItem?._id ? this.peMessageApiService.patchSettings(themeItemClear, themeItem._id) : of(null);
  }

  changeIntegrationSettingsState(settings: PeMessageIntegrationThemeItemValues, settingsName: string): void {
    this.peMessageIntegrationService.settings?.themes?.forEach( (mItem: PeMessageIntegrationThemeItem) => {
      mItem.isDefault = mItem.name === settingsName;
      if (mItem.name === settingsName) {
        mItem.settings = settings;
        this.peMessageIntegrationService.currSettings = mItem;
      }
    });
  }
}
