import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnInit,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';

import { APP_TYPE, AppType } from '@pe/common';
import { PeGridSidenavService } from '@pe/grid';
import {
  PeChatChannelMenuItem,
  ChatHeaderSelectedActionEnum,
  PeChatMessage,
  PeMessageChannelMemberByCategory,
} from '@pe/shared/chat';

import { PeMessageSidenavsEnum } from '../../enums';
import { PeChatAutocompleteOption } from '../../interfaces';

@Component({
  selector: 'pe-chat-header',
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeChatHeaderComponent implements OnInit {
  avatarStyle: SafeStyle;
  _pinnedMessages: PeChatMessage[];

  @Input() activeChannel: PeChatChannelMenuItem;
  @Input() channelMenuItems: PeChatChannelMenuItem[];
  @Input() contacts: PeChatAutocompleteOption[] = [];
  @Input() showContactAutocomplete = false;
  @Input() title: string;
  @Input() timeInfo: any;
  @Input() totalUnreadMessages = '0';
  @Input()
  set avatar(value: string) {
    this.avatarStyle = value ? value : null;
  }

  @Input() activeChatInitials: string;
  @Input() dateFormat = 'shortTime';
  @Input() messageAppColor = '';
  @Input() accentColor = '';
  @Input() mobileView = false;
  @Input() hideChat = false;
  @Input() recipients: any;
  @Input() members = 0;
  @Input() selectedMessages = 0;
  @Input()
  set pinnedMessages(value: PeChatMessage[]) {
    this._pinnedMessages = value ?? [];
    this.indexScroll = this._pinnedMessages.length - 1;
  }

  @Input() typingMembers: PeMessageChannelMemberByCategory[];
  @Input() liveMembersCount = 0;

  @Output() deleteChat = new EventEmitter();
  @Output() selectOption = new EventEmitter<PeChatAutocompleteOption>();
  @Output() channelMenuItem = new EventEmitter<PeChatChannelMenuItem>();
  @Output() clickByAvatarInHeader = new EventEmitter<boolean>();
  @Output() clickByMembersInHeader = new EventEmitter<boolean>();
  @Output() chatHideStatus = new EventEmitter<boolean>();
  @Output() selectedActions = new EventEmitter<any>();
  @Output() showPinnedMessage = new EventEmitter<PeChatMessage>();
  @Output() unpinMessage = new EventEmitter<PeChatMessage>();
  @Output() backArrowClick = new EventEmitter<boolean>();
  @Output() chatHeaderToggle = new EventEmitter<boolean>();

  @ViewChild('input', { static: true }) elementRef: ElementRef;
  @ViewChild('channelSelect') channelSelect: ElementRef;
  @ViewChild('options') options: ElementRef;
  @ViewChild('channelMenu') channelMenu: TemplateRef<any>;

  @HostBinding('class.pe-chat-header') peChatHeader = true;

  channelMenuOverlayRef: OverlayRef;
  formControl: FormControl = new FormControl('');
  filteredItems: Observable<PeChatAutocompleteOption[]>;
  peChatChannelMenuItem = PeChatChannelMenuItem;
  chatHeaderSelectedActionEnum = ChatHeaderSelectedActionEnum;
  indexScroll = 0;

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    protected domSanitizer: DomSanitizer,
    private peGridSidenavService: PeGridSidenavService,
    private cdr: ChangeDetectorRef,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) {
    (window as any)?.PayeverStatic?.SvgIconsLoader?.loadIcons([
      'social-facebook-12',
      'social-whatsapp-12',
      'social-instagram-12',
      'social-live-chat-12',
      'social-telegram-18',
    ]);
  }

  ngOnInit(): void {
    this.filteredItems = this.formControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value)),
    );
  }

  chatHeaderModeToggleMethod() {
    this.chatHeaderToggle.emit(false);
  }

  handleBackArrow(event: Event) {
    this.peGridSidenavService.toggleViewSidebar(PeMessageSidenavsEnum.ConversationList);
    this.backArrowClick.emit(true);
    event.preventDefault();
    event.stopPropagation();
    this.cdr.detectChanges();
  }

  displayFn(option: PeChatAutocompleteOption): string {
    return option && option.title ? option.title : '';
  }

  optionSelected(item: PeChatAutocompleteOption): void {
    this.selectOption.emit(item);
  }

  callAvatar(event) {
    of(event)
      .pipe(
        debounceTime(100),
        tap(e => this.clickOnAvatarInHeader(e)),
      )
      .subscribe();
  }

  callHandleArrow(event: Event) {
    event.stopPropagation();
    of(event)
      .pipe(
        debounceTime(100),
        tap(e => {
          this.handleBackArrow(e);
        }),
      )
      .subscribe();
  }

  getChannelIcon(channel: PeChatChannelMenuItem): string {
    switch (channel) {
      case PeChatChannelMenuItem.FacebookMessenger:
        return '#icon-social-facebook-12';
      case PeChatChannelMenuItem.WhatsApp:
        return '#icon-social-whatsapp-12';
      case PeChatChannelMenuItem.Instagram:
        return '#icon-social-instagram-12';
      case PeChatChannelMenuItem.LiveChat:
        return '#icon-social-live-chat-12';
    }
  }

  getChannelLabel(channel: PeChatChannelMenuItem): string {
    switch (channel) {
      case PeChatChannelMenuItem.FacebookMessenger:
        return 'Facebook';
      case PeChatChannelMenuItem.WhatsApp:
        return 'WhatsApp';
      case PeChatChannelMenuItem.Instagram:
        return 'Instagram';
      case PeChatChannelMenuItem.LiveChat:
        return 'Live Chat';
    }
  }

  closeChannelMenu(item?: PeChatChannelMenuItem): void {
    if (item) {
      this.channelMenuItem.emit(item);
    }

    if (this.channelMenuOverlayRef) {
      this.channelMenuOverlayRef.dispose();
    }
  }

  openChannelMenu(): void {
    this.channelMenuOverlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.channelSelect)
        .withDefaultOffsetY(8)
        .withPositions([
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top',
          },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'pe-chat-channel-menu-backdrop',
    });

    this.channelMenuOverlayRef.backdropClick().subscribe(() => this.channelMenuOverlayRef.dispose());
    this.channelMenuOverlayRef.attach(new TemplatePortal(this.channelMenu, this.viewContainerRef));
  }

  trackOption(index: number, option: PeChatAutocompleteOption): PeChatAutocompleteOption {
    return option;
  }

  private filter(value: string | any): PeChatAutocompleteOption[] {
    const filterValue: string = this.normalizeValue(value.title ?? value);

    return this.contacts.filter(item => this.normalizeValue(item.title).includes(filterValue));
  }

  private normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  openOptions(): void {
    this.channelMenuOverlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.options)
        .withDefaultOffsetY(8)
        .withPositions([
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top',
          },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'pe-chat-options-backdrop',
    });

    this.channelMenuOverlayRef.backdropClick().subscribe(() => this.channelMenuOverlayRef.dispose());
    this.channelMenuOverlayRef.attach(new TemplatePortal(this.channelMenu, this.viewContainerRef));
  }

  clickOnAvatarInHeader(event: Event): void {
    this.clickByAvatarInHeader.emit(true);
    event.preventDefault();
    event.stopPropagation();
    this.cdr.detectChanges();
  }

  clickOnHideChat(): void {
    this.chatHideStatus.emit(true);
  }

  clickOnMembers(): void {
    this.clickByMembersInHeader.emit(true);
  }

  selectedAction(action: ChatHeaderSelectedActionEnum) {
    this.selectedActions.emit(action);
  }

  previewImage(message: PeChatMessage) {
    const attachment = message?.attachments?.find(item => item.url);

    return attachment ? this.domSanitizer.bypassSecurityTrustStyle(`url(${attachment.url})`) : null;
  }

  clickPinnedMessage(message: PeChatMessage) {
    if (this.indexScroll > 0) {
      this.indexScroll -= 1;
    } else {
      this.indexScroll = this._pinnedMessages.length - 1;
    }
    this.showPinnedMessage.emit(message);
  }

  cancelPinnedMessage(event: MouseEvent, message: PeChatMessage) {
    event.stopPropagation();

    this.unpinMessage.emit(message);
  }
}
