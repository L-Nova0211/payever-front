import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit, Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, merge, Observable, of } from 'rxjs';
import { catchError, filter, first, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { PebEnvService } from '@pe/builder-core';
import {
  APP_TYPE,
  AppThemeEnum, AppType,
  EnvironmentConfigInterface,
  MessageBus,
  PE_ENV,
  PeDestroyService, PreloaderState,
} from '@pe/common';
import { PeGridSidenavService } from '@pe/grid';
import { TranslationLoaderService } from '@pe/i18n-core';
import { PeOverlayWidgetService, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeChatChannelMenuItem, PeMessageContact, PeMessageUser } from '@pe/shared/chat';

import { showLiveMessage } from '../../animations';
import { PeMessageChatRoomListComponent } from '../../components';
import { MessageBusEvents, PeMessageSidenavsEnum, PeMessageWebsocketType } from '../../enums';
import {
  PeMessageBubble,
  PeMessageCheckoutApp,
  PeMessageSettings,
  PeMessageIntegrationThemeItem,
  PeMessageShopApp,
  PeMessageSiteApp,
  PeMessageSubscription,
  PeMessageSubscriptionAll,
} from '../../interfaces';
import {
  CosMessageBus,
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageChatRoomService,
  PeMessageIntegrationService,
  PeMessageLiveChatService, PeMessageNavService,
  PeMessageOverlayService,
  PeMessageService,
  PeMessageThemeService,
  PeMessageWebSocketService,
} from '../../services';
import { SetSubscriptionList } from '../../state/message.actions';
import { MessageState } from '../../state/message.state';

@Component({
  selector: 'pe-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
  animations: [showLiveMessage],
})
export class PeMessageComponent implements OnDestroy, OnInit {
  @SelectSnapshot(PreloaderState.loading) loading: { [key: string]: boolean };

  @ViewChild('chatRoomList', { static: false, read: PeMessageChatRoomListComponent })
  chatRoomListCmp!: PeMessageChatRoomListComponent;

  @Input() channels!: string;
  @Input() shown$ = of(true);
  @Input() business!: string;
  @Input() mobileView = false;
  @Input() isLiveChat = false;
  @Input() isEmbedChat = false;
  @Input() theme = this.pebEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  @Output() activatedChat = new EventEmitter<boolean>();

  public loaded = false;
  public messageWidgetShadow!: string;
  public peMessageSidenavsEnum = PeMessageSidenavsEnum;
  public readonly translationsReady$ = new BehaviorSubject<boolean>(false);
  public readonly socketInitialized$ = new BehaviorSubject<boolean>(false);
  public readonly sidenavNameEmbedView$ = combineLatest([
    this.peGridSidenavService.toggleOpenStatus$,
    this.peGridSidenavService.getSidenavOpenStatus(PeMessageSidenavsEnum.ConversationList),
  ]).pipe(
    map(([folders, conversationList]) =>
      folders && conversationList
        ? null
        : !folders && conversationList
          ? PeMessageSidenavsEnum.Folders : PeMessageSidenavsEnum.ConversationList
    ),
  );

  @HostBinding('class') class = `message-list ${this.theme}`;
  @HostBinding('class.pe-message') peMessage = true;
  @HostBinding('class.shadow') shadow = false;

  private readonly openChatDialog$ = this.messageBus
    .listen(MessageBusEvents.OpenDialog)
    .pipe(
      tap((data) => {
        switch (data.dialog) {
          case 'chat':
            this.peOverlayWidgetService.close();
            this.chatRoomListCmp.openChatRoomFormOverlay(data.mailConfig.recipients);
        }
      }));

  private readonly toggleSidebarListener$ = this.messageBus
    .listen(MessageBusEvents.ToggleSidebar)
    .pipe(
      tap(() => {
        this.peGridSidenavService.toggleViewSidebar();
      }));

  private readonly getContactList$ = this.peMessageApiService
    .getContactList()
    .pipe(
      catchError(() => of([])),
      tap((contacts: PeMessageContact[]) => {
        this.peMessageService.contactList = contacts;
      }));

  private readonly getSubscriptionList$ = this.peMessageApiService
    .getSubscriptionList()
    .pipe(
      switchMap((subscriptions: PeMessageSubscription[]) => {
        this.peMessageService.subscriptionList = subscriptions.filter(subscription => subscription.installed);
        this.peMessageChatRoomService.channelMenuItems$.next(
          subscriptions
            .filter(subscription => subscription.enabled)
            .map(subscription => subscription.integration.name) as PeChatChannelMenuItem[]
        );

        return this.peMessageApiService.getSubscriptionsAll();
      }),
      tap((subscriptions: PeMessageSubscriptionAll[]) => {
        subscriptions.forEach((subscription: PeMessageSubscriptionAll) => {
          const foundSubscription = this.peMessageService.subscriptionList
            .find(s => s.integration.name === subscription.integration.name);

          if (foundSubscription) {
            foundSubscription.info = {
              ...subscription.info,
              authorizationId: subscription.authorizationId,
            };
          }
        });

        this.store.dispatch(new SetSubscriptionList(this.peMessageService.subscriptionList));
      }));

  private readonly getUserList$ = this.peMessageApiService
    .getUserList()
    .pipe(
      tap((users: PeMessageUser[]) => {
        this.peMessageService.userList = users;
      }));

  private readonly getCheckout$ = this.peMessageApiService
    .getCheckout()
    .pipe(
      tap((checkout: PeMessageCheckoutApp[]) => {
        if (checkout && checkout.length > 0) {
          const defaultCheckout = checkout.filter((item: PeMessageCheckoutApp) => item.default);
          this.peMessageService.checkoutId = defaultCheckout[0]._id;
        }
      }));

  private readonly getShop$ = this.peMessageApiService
    .getShop()
    .pipe(
      tap((shop: PeMessageShopApp[]) => {
        if (shop && shop.length > 0) {
          const defaultShop = shop.filter((item: PeMessageShopApp) => item.isDefault);
          this.peMessageService.shopId = defaultShop[0]._id;
        }
      }));

  private readonly getSite$ = this.peMessageApiService
    .getSite()
    .pipe(
      tap((site: PeMessageSiteApp[]) => {
        if (site && site.length > 0) {
          const defaultSite = site.filter((item: PeMessageSiteApp) => item.isDefault);
          this.peMessageService.siteId = defaultSite[0]._id;
        }
      }));

  private readonly initPeExternalAppsId$ = merge(
    this.getCheckout$,
    this.getShop$,
    this.getSite$,
  );

  private readonly initMailIfOpenedFromContacts$ = this.store
    .select(MessageState.mailConfig)
    .pipe(
      filter(mailConfig => !!mailConfig && !!Object.values(mailConfig).some(value => value)),
      tap(() => {
        this.router.navigate(['editor'], { relativeTo: this.activatedRoute });
      }));

  private readonly initTranslations$ = this.translationLoaderService
    .loadTranslations(['commerceos-message-app'])
    .pipe(
      take(1),
      tap(() => {
        this.translationsReady$.next(true);
      }),
      catchError(error => {
        console.warn('Cant load translations for domains', ['message-app'], error);

        return of(true);
      }))

  @HostListener('window:resize', ['$event']) onResize(): void {
    this.mobileView = window.innerWidth < 719;
    this.peMessageChatRoomListService.mobileView = this.mobileView;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private matIconRegistry: MatIconRegistry,
    private router: Router,
    private store: Store,

    @Optional() @Inject(APP_TYPE) private appType: AppType,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    @Inject(MessageBus) private messageBus: CosMessageBus<MessageBusEvents>,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    @Optional() private peAuthService: PeAuthService,
    private pebEnvService: PebEnvService,
    private peGridSidenavService: PeGridSidenavService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translationLoaderService: TranslationLoaderService,
    private readonly destroy$: PeDestroyService,

    private peMessageNavService: PeMessageNavService,
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageChatRoomService: PeMessageChatRoomService,
    private peMessageIntegrationService: PeMessageIntegrationService,
    private peMessageLiveChatService: PeMessageLiveChatService,
    private peMessageService: PeMessageService,
    private peMessageThemeService: PeMessageThemeService,
    private peMessageWebSocketService: PeMessageWebSocketService,
    private peMessageOverlayService: PeMessageOverlayService
  ) {
    const ICONS = {
      close: `${this.env.custom.cdn}/icons-filter/small-close-icon.svg`,
      navigation: `${this.env.custom.cdn}/icons-messages/navigation.svg`,
      chatHide: `${this.env.custom.cdn}/icons-messages/chat/chat-hide.svg`,
    };

    Object.entries(ICONS).forEach(([name, path]) => {
      const url = this.domSanitizer.bypassSecurityTrustResourceUrl(path);
      this.matIconRegistry.addSvgIcon(name, url);
    });
  }

  public get isGlobalLoading(): boolean {
    return this.appType && this.loading[this.appType];
  }

  ngOnDestroy():void {
    this.peMessageWebSocketService.clearWetSocketSubjects();
    this.peMessageWebSocketService.destroy();
  }

  ngOnInit(): void {
    this.peMessageService.isBusiness = this.router.url.split('/')[1] === 'business';
    this.peMessageService.isLiveChat = this.isLiveChat;
    this.peMessageService.isEmbedChat = this.isEmbedChat;
    this.peMessageService.activationChatId = this.activatedRoute.snapshot.params.chatId;
    this.mobileViewHandler();

    const initApp$ = this.isLiveChat
      ? this.initLiveChat()
      : this.initMessageApp();

    merge(
      this.initTranslations$,
      this.openChatDialog$,
      this.toggleSidebarListener$,
      initApp$,
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  public activatedChatListener(event: boolean) {
    this.activatedChat.emit(event);
  }

  public clickOnHideChat(): void {
    this.peMessageService.liveChatBubbleClickedStream$.next(false);
  }

  public sidebarToggleButton() {
    const conversationListStatus =
      this.peGridSidenavService.getSidenavOpenStatus(PeMessageSidenavsEnum.ConversationList).value;
    if (conversationListStatus) {
      this.peGridSidenavService.toggleViewSidebar();
    } else {
      this.peGridSidenavService.toggleViewSidebar(PeMessageSidenavsEnum.ConversationList);
    }
  }

  private initSettings(settings: PeMessageSettings) {
    this.peMessageIntegrationService.settings = settings;

    settings.themes?.forEach((themeItem: PeMessageIntegrationThemeItem) => {
      if (themeItem.isDefault && this.isLiveChat) {
        this.theme = themeItem.settings?.messageAppColor
          ? this.peMessageThemeService.setTheme(themeItem.settings?.messageAppColor)
          : this.theme;
      }
      themeItem.isDefault && (this.peMessageIntegrationService.currSettings = themeItem);
    });

    this.cdr.markForCheck();
  }

  private initLiveChat(): Observable<any> {

    this.shown$ = this.peMessageService.liveChatBubbleClickedStream$.asObservable();
    const getBubble$ = this.peMessageApiService
      .getBubble(this.business)
      .pipe(
        tap((bubble: PeMessageBubble) => {
          this.loaded = true;
          this.peMessageService.bubble = bubble;
          this.cdr.detectChanges();
        }));

    const initSettings$ = this.peMessageApiService.getSettings(this.business).pipe(tap( d => this.initSettings(d)))

    const setMessageWidgetShadow$ = this.peMessageIntegrationService.currSettings$.pipe(
      filter((themeItem: PeMessageIntegrationThemeItem) => themeItem._id !== undefined),
      tap((themeItem: PeMessageIntegrationThemeItem) => {
        const messageWidgetShadow = themeItem.settings?.messageWidgetShadow || '';
        this.messageWidgetShadow = messageWidgetShadow !== ''
          ? `0 0 10px ${messageWidgetShadow}`
          : '';
        this.cdr.detectChanges();
      }));

    const initLiveChat$ = this.translationsReady$
      .pipe(
        filter(Boolean),
        first(),
        switchMap(() => {

          return this.peMessageApiService.fetchGuestToken().pipe(
            switchMap((res: {accessToken: string}) => {
              this.pebEnvService.businessId = this.business;
              const integrationsChannels$ = this.peMessageLiveChatService
                .initIntegrationChannel(this.business, res.accessToken);
              const liveChatConversations$ = this.peMessageLiveChatService.initLiveChatFromStorage();

              return merge(...liveChatConversations$, integrationsChannels$);
            }));
        }),
        tap(() => {
          this.socketInitialized$.next(true);
          this.peMessageOverlayService.loadingOverlay$.next(false);
        }),
      );

    return merge(
      getBubble$,
      initLiveChat$,
      initSettings$.pipe(switchMap(() => setMessageWidgetShadow$)),
    );
  }

  private initMessageApp(): Observable<any> {
    this.socketInitialized$.next(true);
    const initChat$ = this.translationsReady$
      .pipe(
        filter(Boolean),
        take(1),
        // ws chat should initialize only for message app common use or for embed mode (isEmbedChat)
        switchMap(() => this.peMessageWebSocketService
          .init(
            `${this.env.backend.message}/chat`,
            { token: this.peAuthService.token },
            PeMessageWebsocketType.Regular,
          )
          .pipe(
            filter(result => !result.liveChat),
            switchMap((result: PeMessageUser) => {
              this.peMessageService.activeUser = result;
              this.peMessageWebSocketService
                .businessRoomJoin(PeMessageWebsocketType.Regular, `${this.pebEnvService.businessId}`);
              this.cdr.detectChanges();
              const { chatList, chatList$ } = this.peMessageChatRoomListService;
              const joinChats$ = chatList.length ? of(chatList) : chatList$;

              return joinChats$
                .pipe(
                  filter(chats => !!chats.length),
                  take(1),
                  tap((chats) => {
                    this.peMessageOverlayService.loadingOverlay$.next(false);
                    chats.forEach(({ _id, websocketType }) => {
                      this.peMessageWebSocketService.chatRoomJoin(websocketType ?? PeMessageWebsocketType.Regular, _id);
                    });
                  }));
            }))
        ));

    const initSettings$ = this.peMessageApiService.getSettings(this.business).pipe(tap(d => this.initSettings(d)));

    const isNotEmbedChat$ = !this.isEmbedChat
      ? merge(
        this.getContactList$,
        this.getSubscriptionList$,
      )
      : of (null);

    const isBusiness$ =  this.peMessageService.isBusiness
      ? merge(
        this.getUserList$,
        this.initPeExternalAppsId$,
        isNotEmbedChat$,
      )
      : of(null);

    return merge(
      initChat$,
      isBusiness$,
      initSettings$,
      this.initMailIfOpenedFromContacts$,
    );
  }

  private mobileViewHandler(): void {
    this.peMessageChatRoomListService.mobileView = this.mobileView;
    if (this.mobileView) {
      this.onResize = (): void => {};
    }
  }
}
