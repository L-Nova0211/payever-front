import {
  Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, Inject,
  ChangeDetectorRef, HostBinding, ElementRef, AfterViewInit,
} from '@angular/core';
import { merge, Subject, timer } from 'rxjs';
import { takeUntil, tap, delay, filter, first } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageIntegrationSettings } from '@pe/shared/chat';

import { PeMessageColorTabs } from '../../../enums';
import {
  PeMessageIntegrationThemeItem,
  PeMessageColorLayout, PeMessageSettings, PeMessageAppearanceColorBox,
} from '../../../interfaces';
import { PeMessageIntegrationService } from '../../../services';
import { PeMessageService } from '../../../services/message.service';

@Component({
  selector: 'pe-message-appearance',
  templateUrl: './message-appearance.component.html',
  styleUrls: ['./message-appearance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class PeMessageAppearanceComponent implements OnInit, AfterViewInit {
  @HostBinding('class.pe-message-appearance') peMessageAppearance = true;

  theme = this.peOverlayData.theme;
  color!: string;
  label!: string;
  onCloseSubject$ = new Subject<any>();
  onClose$ = this.onCloseSubject$.asObservable();
  bgChatColor = '';

  sidebarWidgetSettingsMode = [
    this.translateService.translate('message-app.message-integration.widget'),
    this.translateService.translate('message-app.message-integration.bubble'),
  ];

  sidebarContainerIndex = 0;
  sidebarColorSettingsIndex = 0;
  sidebarWidgetSettingsIndex = 0;

  defaultPresetColor: number;
  shadowColor: string;
  colorBoxes: PeMessageAppearanceColorBox[];
  currentTheme: string;
  mockUps: PeMessageIntegrationThemeItem[];

  colorTabs = [PeMessageColorTabs.AccentColor, PeMessageColorTabs.Background, PeMessageColorTabs.Message];

  channels = `["${this.peOverlayData.channelList[0]._id}"]`;
  business = this.envService.businessId;
  swiperColorBoxes = false;

  logo = this.peOverlayData.logo;

  backButton!: HTMLElement;
  backBtnCallback!: () => void;
  doneBtnCallback!: () => void;

  constructor(
    private peMessageService: PeMessageService,
    private peMessageIntegrationService: PeMessageIntegrationService,
    private destroyed$: PeDestroyService,
    private peMessageAppearanceRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    private envService: PebEnvService,
    private translateService: TranslateService,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
  ) {
  }

  ngOnInit(): void {
    this.backBtnCallback = this.overlayConfig.backBtnCallback;
    this.doneBtnCallback = this.overlayConfig.doneBtnCallback;

    this.peMessageService.liveChatBubbleClickedStream$.next(true);

    const initSettingsStream$ = this.peMessageIntegrationService.settingsStream$.pipe(
      filter(Boolean),
      first(),
      tap((settings: PeMessageSettings) => {
        this.currentTheme = this.peMessageIntegrationService?.settings?.currentTheme;
        this.mockUps = this.peMessageIntegrationService?.settings?.themes || [];
        this.changeDetectorRef.detectChanges();
      }),
    );

    const initCurrSettings$ = this.peMessageIntegrationService.currSettings$.pipe(
      filter(Boolean),
      first(),
      tap((settings: PeMessageIntegrationThemeItem) => {
        this.defaultPresetColor = settings.settings.defaultPresetColor || 0;
        this.shadowColor = settings.settings.messageWidgetShadow || '';
        this.colorBoxes = settings.settings.customPresetColors;
      }),
    );

    const currSettings$ = this.peMessageIntegrationService.currSettings$.pipe(
      //delay needs for swiper. Didn't find better solution.
      delay(200),
      tap(() => {
        this.swiperColorBoxes = true;
        this.changeDetectorRef.detectChanges();
      })
    );

    merge(
      initSettingsStream$,
      initCurrSettings$,
      currSettings$,
    ).pipe(takeUntil(this.destroyed$)).subscribe();
  }

  ngAfterViewInit(): void {
    const widgetPopup = this.peMessageAppearanceRef.nativeElement.closest('.appearance-widget-panel');
    this.backButton = widgetPopup?.querySelector('.overlay-widget__back');
  }

  secondLevelSettings(): void {
    this.backButton.innerHTML = this.translateService.translate('message-app.message-integration.back');
    this.overlayConfig.backBtnCallback = this.backToSettings.bind(this);
    this.overlayConfig.doneBtnCallback = this.backToSettings.bind(this);
  }

  backToSettings(): void {
    this.sidebarContainerIndex = 0;
    this.backButton.innerHTML = this.translateService.translate('message-app.message-integration.cancel');
    this.overlayConfig.backBtnCallback = this.backBtnCallback;
    this.overlayConfig.doneBtnCallback = this.doneBtnCallback;
    this.sidebarColorSettingsIndex = 0;
    timer(100).subscribe(() => {
      this.peMessageService.liveChatBubbleClickedStream$.next(true);
    });
    this.changeDetectorRef.markForCheck();
  }

  emitChanges(): void {
    const themeItem: PeMessageIntegrationThemeItem = this.peMessageIntegrationService.currSettings;

    switch (this.sidebarColorSettingsIndex) {
      case 1:
        themeItem.settings.bgChatColor = this.color;
        themeItem.settings.customPresetColors[this.defaultPresetColor].bgChatColor = this.color;
        break;
      case 2:
        themeItem.settings.messagesBottomColor = this.color;
        themeItem.settings.customPresetColors[this.defaultPresetColor].messagesBottomColor = this.color;
        break;
      case 0:
      default:
        themeItem.settings.accentColor = this.color;
        themeItem.settings.customPresetColors[this.defaultPresetColor].accentColor = this.color;
        break;
    }

    this.peMessageIntegrationService.currSettings = themeItem;
  }

  changeSidebarColorTab(index: number): void {
    const { settings } = this.peMessageIntegrationService.currSettings;
    this.sidebarColorSettingsIndex = index;
    switch (this.sidebarColorSettingsIndex) {
      case 1:
        this.color = settings.bgChatColor || PeMessageIntegrationSettings.bgChatColor;
        break;
      case 2:
        this.color = settings.messagesBottomColor
          || PeMessageIntegrationSettings.messagesBottomColor;
        break;
      case 0:
      default:
        this.color = settings.accentColor || PeMessageIntegrationSettings.accentColor;
        break;
    }
  }

  colorSelect(event: any): void {
    this.color = event;
    this.emitChanges();
  }

  openColorPicker(event: PeMessageColorLayout): void {
    const boxColor = event.boxColor;
    const index = event.index;
    const { currSettings } = this.peMessageIntegrationService;

    if (this.defaultPresetColor === index) {
      this.peMessageService.liveChatBubbleClickedStream$.next(false);
      this.sidebarContainerIndex = 1;
      this.secondLevelSettings();
      this.color = currSettings.settings.accentColor || PeMessageIntegrationSettings.accentColor;
    } else if (index === -1) {
      this.peMessageService.liveChatBubbleClickedStream$.next(false);
      this.defaultPresetColor = 0;
      currSettings.settings.customPresetColors.unshift({
        accentColor: PeMessageIntegrationSettings.accentColor,
        newItem: true,
      });
      this.sidebarContainerIndex = 1;
      this.secondLevelSettings();
      this.color = PeMessageIntegrationSettings.accentColor;
    } else {
      this.defaultPresetColor = index;
      const themeItem: PeMessageIntegrationThemeItem = currSettings;
      themeItem.settings.accentColor = boxColor?.accentColor || PeMessageIntegrationSettings.accentColor;
      themeItem.settings.bgChatColor = boxColor?.bgChatColor || PeMessageIntegrationSettings.bgChatColor;
      themeItem.settings.messagesBottomColor = boxColor?.messagesBottomColor
        || PeMessageIntegrationSettings.messagesBottomColor;
      this.peMessageIntegrationService.currSettings = themeItem;
    }

    this.peMessageIntegrationService.currSettings.settings.defaultPresetColor = this.defaultPresetColor;
  }

  selectMockUp(mockUp: PeMessageIntegrationThemeItem): void {
    this.mockUps.forEach((mItem: PeMessageIntegrationThemeItem) => { mItem.isDefault = false; });
    mockUp.isDefault = true;
    this.currentTheme = mockUp.name;
    this.defaultPresetColor = mockUp.settings?.defaultPresetColor || 0;
    this.bgChatColor = mockUp.settings?.bgChatColor || '';
    this.shadowColor = mockUp.settings?.messageWidgetShadow || '';
    this.swiperColorBoxes = false;

    this.peMessageIntegrationService.currSettings = mockUp;
    this.changeDetectorRef.markForCheck();
  }

  changeSidebarContainer(): void {
    if (this.sidebarContainerIndex === 0) {
      this.swiperColorBoxes = false;
      const currentSettings = this.peMessageIntegrationService.currSettings;
      const defaultCPC = this.peMessageIntegrationService.currSettings.settings.customPresetColors
        .splice(this.defaultPresetColor, 1);
      currentSettings.settings.customPresetColors =
        [...defaultCPC, ...this.peMessageIntegrationService.currSettings.settings.customPresetColors];
      this.colorBoxes = currentSettings.settings.customPresetColors;

      this.peMessageIntegrationService.currSettings = currentSettings;
      this.defaultPresetColor = 0;
      this.changeDetectorRef.markForCheck();
    }
  }

  changeBoxShadow(event: string): void {
    const currSettings = this.peMessageIntegrationService.currSettings;
    currSettings.settings.messageWidgetShadow = event;
    this.peMessageIntegrationService.currSettings = currSettings;
  }

  done(): void {
    this.backToSettings();
  }

  back() {
    this.onCloseSubject$.next(true);
  }

  switchWidgetBubble(index: number): void {
    this.sidebarWidgetSettingsIndex = index;
    this.peMessageService.liveChatBubbleClickedStream$.next(index === 0);
  }
}
