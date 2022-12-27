import { trigger, style, animate, transition, state } from '@angular/animations';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter, HostBinding,
  HostListener,
  Input,
  NgZone,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, combineLatest, fromEvent, merge, of, Subject, timer } from 'rxjs';
import { debounce, debounceTime, filter, map, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { BusinessInterface, BusinessState } from '@pe/business';
import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import {
  PeMessageChatMember,
  PeChatChannelMenuItem,
  PeChatAttachMenu,
  PeChatAttachMenuItem,
  PeChatImgTypes,
  PeChatMessage,
  PeMessageChat,
  PeChatMemberService,
  PeMessageChatDraft,
} from '@pe/shared/chat';
import { isValidMedia } from '@pe/shared/utils/media-validators';

import { PeChatBox, KeyEventEnum, PeMessageEventType } from '../../enums';
import { PeChatMessageSend } from '../../interfaces';
import { ChatFormFieldAction, DropBoxItems } from '../../interfaces/chat-form.interface';

import {
  PE_CHAT_DROPBOX_COMPRESSED_IMAGE,
  PE_CHAT_DROPBOX_FILE,
  PE_CHAT_DROPBOX_RAW_IMAGE,
} from './dropbox-items.constants';


enum EmojiPickerEnum {
  Hover = 'hover',
  LeavePicker = 'leave-picker',
  ClickSmily = 'click-smily',
  Closed = 'closed',
};

interface CurrentChatsDraft {
  message: string;
  id: string;
}

@Component({
  selector: 'pe-chat-form',
  styleUrls: ['./chat-form.component.scss'],
  templateUrl: './chat-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
  animations: [
    trigger('inOutAnimation', [
      state(
        'hover',
        style({ opacity: 1, right: 0 }),
      ),
      state(
        'click-smily',
        style({ opacity: 1, right: 0 }),
      ),
      state(
        'leave-picker',
        style({ opacity: 0, right: 0 }),
      ),
      state(
        'closed',
        style({ opacity: 0, right: 0 }),
      ),
      transition(
        'leave-picker => hover, click-smily => hover, closed => hover',
        animate(
          '100ms ease-in',
          style({ opacity: 1, right: 0 }),
        ),
      ),
      transition(
        'leave-picker => click-smily, hover => click-smily, closed => click-smily',
        animate(
          '100ms ease-in',
          style({ opacity: 1, right: 0 }),
        ),
      ),
      transition(
        'leave-picker => closed, hover => closed, click-smily => closed',
        animate(
          '100ms ease-in',
          style({ opacity: 0, right: 0 }),
        ),
      ),
      transition(
        'hover => leave-picker',
        animate(
          '400ms ease-out',
          style({ opacity: 0, right: 0 }),
        ),
      ),
    ]),
  ],
})
export class PeChatFormComponent implements OnInit, AfterViewInit {
  @HostBinding('class.pe-chat-form') peChatFormClass = true;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  inputFocus = false;
  inputHover = false;
  compression = false;
  dropBoxItems: DropBoxItems[];
  type;
  public messageText: string;

  _isEmojiPickerVisible: EmojiPickerEnum;
  set isEmojiPickerVisible(value) {
    if (
      value !== this._isEmojiPickerVisible
      && !(
        this._isEmojiPickerVisible === EmojiPickerEnum.ClickSmily
        && value === EmojiPickerEnum.Hover
      )
    ) {
      this._isEmojiPickerVisible = value;
      this.emojiState.shift();
      this.emojiState.push(value);
    }
  }

  get isEmojiPickerVisible() {
    return this._isEmojiPickerVisible;
  }

  previouslyActiveChat: PeMessageChat;
  emojiCloseTimer: NodeJS.Timeout;
  emojiLeavePickerTimer: NodeJS.Timeout;
  emojiBackdropDisplay = false;
  emojiBackdropOpacity = false;
  emojiState = [
    EmojiPickerEnum.Closed,
    EmojiPickerEnum.Closed,
  ];

  isAttachVisible: boolean;
  attachCLoseTimer: NodeJS.Timeout;
  fileOver = false;
  peChatForm = true;
  tagItems = [];
  membersTag = [];
  arrowkeyLocation = -1;
  blurredSubject$ = new Subject<string>();

  avatarStyle: SafeStyle;
  droppedFiles: any[] = [];
  imgDropTypes = [PeChatImgTypes.png, PeChatImgTypes.jpeg, PeChatImgTypes.gif];

  peChatAttachMenuItem = PeChatAttachMenuItem;
  peChatChannelMenuItem = PeChatChannelMenuItem;
  peChatBox = PeChatBox;
  boxMenuItems: PeChatBox[] = [PeChatBox.Small, PeChatBox.Large];
  suffixClasses = ['', '__title', '__subtitle'];
  smallBoxIcon = [
    {
      label: 'No icon',
      value: null,
    },
    {
      label: 'Checklist',
      value: 'checklist',
      icon: {
        id: '#icon-messaging-box-checklist',
        color: '#636363',
      },
    },
    {
      label: 'Close',
      value: 'delete',
      icon: {
        id: '#icon-messaging-box-close-square',
        color: '#636363',
      },
    },
  ];

  public chatForm = this.formBuilder.group({
    textarea: [''],
  });

  private get textarea(): AbstractControl {
    return this.chatForm.controls.textarea;
  }

  smallBoxForm = this.formBuilder.group({
    icon: [],
    text: ['', [Validators.required]],
    url: ['', [Validators.required]],
  });

  largeBoxForm = this.formBuilder.group({
    image: ['', [Validators.required]],
    text: ['', [Validators.required]],
  });

  _editMessage = '';
  _dropFile: DragEvent;
  private readonly activeChat$ = new BehaviorSubject<PeMessageChat>(null);
  private readonly setCursorFocus$ = new BehaviorSubject<boolean>(false);
  _forwardMessage: PeChatMessage[];
  public showNameOnForwardMessage = true;
  _message = '';

  private skipEditingOnInitialize = true;

  @Input() theme = '';
  @Input() attachMenuItems: PeChatAttachMenuItem[];
  @Input() appsMenuItems: PeChatChannelMenuItem[];
  @Input() buttonTitle = 'Send';
  @Input() buttonIcon = 'paper-plane-outline';
  @Input() set dropFiles(value: DragEvent) {
    if (value) {
      this.initializeDroppedFiles(value);
      this.openMenu(this.dropBoxRef);
    } else {
      this.closeMenu();
    }

    this._dropFile = value;
  };

  get dropFiles(): DragEvent {
    return this._dropFile;
  }

  @Input() dropFilePlaceholder = 'Drop file to send';

  private draftMessage = '';

  @Input() dragDimensions: DOMRect;
  @Input() replyMessage: PeChatMessage;
  @Input() set editMessage(messageToEdit: PeChatMessage) {
    if (messageToEdit) {
      this.openEditMessageMenu(messageToEdit.content);
    } else {
      !this.skipEditingOnInitialize && this.closeEditMessageMenu();
      this.skipEditingOnInitialize = false;
    }
  }

  public get editingMessage(): string {
    return this._editMessage;
  }

  @Input() set activeChat(chat: PeMessageChat) {
    this.typing.emit({ chat: this.previouslyActiveChat, isTyping: this.isTyping });
    this.setDraft(chat.draft);
    this.activeChat$.next(chat);
    this.previouslyActiveChat = chat;
    this.textarea.reset();
    this.setTextAreaValueByStoredData();
    sessionStorage.setItem('current_chat_id', chat._id);
  }

  @Input() set cursorFocus(focusStatus) {
    this.setCursorFocus$.next(focusStatus);
  }

  @Input()
  set forwardMessage(value: PeChatMessage[]) {
    this._forwardMessage = value;
    if (value && value.length) {
      this.openForwardMessageMenu();
    } else {
      this.closeForwardMessageMenu();
    }
  }

  get forwardMessage() {
    return this._forwardMessage;
  }

  @Input() messagePlaceholder = this.translateService.translate('message-app.message.write-message');
  @Input() sender: string;
  @Input() showAttachButton = false;
  @Input() showForm = true;
  @Input() showEmailForm = false;
  @Input() showSendButton = false;
  @Input()
  set avatar(value: string) {
    this.avatarStyle = value ? this.domSanitizer.bypassSecurityTrustStyle(`url(${value})`) : null;
  }

  @Input() messageAppColor = '';
  @Input() set members(value: PeMessageChatMember[]) {
    this.membersTag = this.chatMemberService.mapMemberToChat(value);
  }

  get members(): PeMessageChatMember[] {
    return this.membersTag;
  }

  @Input() accentColor = '';
  @Input() appsImages = {};
  @Input() showMenuIcons: boolean;
  @Input() selectedMessageChannel = 'email';
  @Input() customFormFieldActions: ChatFormFieldAction[];
  @Input() canSendEmpty: boolean;
  @Input() messageFull: boolean;

  @Input() smallBoxUrlItems = [];
  @Input() isChatDisabled: boolean;

  @Output() editMessageCancelled = new EventEmitter<Boolean>();
  @Output() forwardMessageCancelled = new EventEmitter<Boolean>();
  @Output() replyMessageCancelled = new EventEmitter<Boolean>();
  @Output() send = new EventEmitter<PeChatMessageSend>();
  @Output() draft = new EventEmitter<PeMessageChatDraft>();
  @Output() attachMenuItem = new EventEmitter<PeChatAttachMenu>();
  @Output() appsMenuItem = new EventEmitter<any>();
  @Output() smallBoxItem = new EventEmitter<any>();
  @Output() largeBoxItem = new EventEmitter<any>();
  @Output() channelChange = new EventEmitter<any>();
  @Output() chatFormContextMenu = new EventEmitter<any>();
  @Output() openChangeRecipientOverlay = new EventEmitter<any>();

  @Output() openLastMessageInEditMenu = new EventEmitter<any>();
  @Output() typing = new EventEmitter<{ chat?: PeMessageChat; isTyping: boolean; }>();

  @ViewChild('textareaMessage') textareaMessage: ElementRef<any>;
  @ViewChild('addFileUpload') addFileUpload: TemplateRef<any>;
  @ViewChild('attachMenu') attachMenu: TemplateRef<any>;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild('addPhotoVideo') addPhotoVideo: TemplateRef<any>;
  @ViewChild('boxMenu') boxMenu: TemplateRef<any>;
  @ViewChild('addSmallBox') addSmallBox: TemplateRef<any>;
  @ViewChild('addLargeBox') addLargeBox: TemplateRef<any>;
  @ViewChild('chatFooter') chatFooter: ElementRef;
  @ViewChild('appsMenu') appsMenu: TemplateRef<any>;
  @ViewChild('appsMenuDetail') appsMenuDetail: TemplateRef<any>;
  @ViewChild('tagMenu') tagMenu: TemplateRef<any>;
  @ViewChild('dropBox') dropBoxRef: TemplateRef<any>;

  appsMenuDetailItem!: PeChatChannelMenuItem;
  isOpenOverlayData$ = new Subject<boolean>();
  resizeInput$ = new Subject();
  inputChange$ = new Subject();
  editMessageMenuTrigger = false;
  forwardMessageMenuTrigger = false;
  editMessageMenuWidth = 'auto';

  private readonly menuOpenStatus$ = new BehaviorSubject<boolean>(false);
  private menuOverlayRef: OverlayRef;
  public menuTrigger = false;

  dragOver = false;
  boxFormSubmited = false;
  isTyping = false;
  largeBoxImage;

  //Space in placeholder need for safari
  get placeholder(): string {
    return ' ' + (this.isChatDisabled ? '' : this.fileOver ? this.dropFilePlaceholder : this.messagePlaceholder);
  }

  private formEventsSubject = new Subject<string>();

  public readonly menuWidth$ = merge(of(null), fromEvent(window, 'resize'))
    .pipe(
      map(() => this.chatFooter.nativeElement.getBoundingClientRect().width + 'px')
    )

  constructor(
    protected cdr: ChangeDetectorRef,
    protected ngZone: NgZone,
    protected domSanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private router: Router,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private translateService: TranslateService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private chatMemberService: PeChatMemberService,
    private readonly destroy$: PeDestroyService,
  ) {
    this.resizeInput$.pipe(
      switchMap(() => this.ngZone.onStable.pipe(
        take(1),
        tap(() => {
          this.autosize?.resizeToFitContent(true);
        })
      )),
      takeUntil(this.destroy$),
    ).subscribe();

    this.formEventsSubject.pipe(
        debounce(type => type === PeMessageEventType.BLUR ? timer(100) : of({})),
        tap((type: string) => {
          if (type === PeMessageEventType.SENDMESSAGE) {
            this.sendMessage();
          } else if (type === PeMessageEventType.BLUR) {
            this.blurredSubject$.next(this.previouslyActiveChat?._id);
          }
        }),
        takeUntil(this.destroy$),
      ).subscribe();
   }

  ngOnInit(): void {

    this.blurredSubject$.pipe(
      tap((chatId) => {
        !this.editMessageMenuTrigger
          && this.draft.emit({
            chatId,
            draftMessage: this.textarea.value,
          });
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.arrowkeyLocation = this.membersTag?.length ?? -1;
    this.initEmojiPicker();
    this.inputChange$.pipe(
      tap(() => {
        this.resizeInput$.next();
        this.checkTyping(true);
      }),
      debounceTime(1000),
      tap(() => {
        this.checkTyping(false);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  openConnect(){
    this.router.navigate([`business/${this.businessData._id}/connect`], { queryParams: { integrationName: 'messaging' } })
    .then(_ => this.closeMenu() );
  }


  setTextAreaValueByStoredData() {
    if (sessionStorage.getItem('current_chats_draft')) {
      const currentChatsDraft = JSON.parse(sessionStorage.getItem('current_chats_draft')) as CurrentChatsDraft[];
      const currentChatDraftIndex = currentChatsDraft.findIndex(chat => chat.id === this.activeChat$.value._id);
      if (currentChatDraftIndex !== -1) {
        this.textarea.setValue(currentChatsDraft[currentChatDraftIndex].message);
      }
    }
  }

  private setDraft(draft: PeChatMessage) {
    const content = draft?.content ?? null;
    this._message = content;
    (!this.menuTrigger && !this.membersTag?.length) && this.textarea.patchValue(content);
  }

  private checkTyping(status: boolean): void {
    if (this.isTyping !== status) {
      this.isTyping = status;
      this.typing.emit({ isTyping: status });
    }
  }

  checkEmojiState() {
    return this.isEmojiPickerVisible === EmojiPickerEnum.ClickSmily
      || this.isEmojiPickerVisible === EmojiPickerEnum.Hover;
  }

  private insertAtCursor(nativeElement, value): void {
    const startPos = nativeElement.selectionStart;
    const lastAt = nativeElement.value.substring(0, startPos).lastIndexOf('@');
    if (lastAt >= 0) {
      const endPos = nativeElement.selectionEnd;
      const message = nativeElement.value.substring(0, lastAt + 1)
        + value
        + nativeElement.value.substring(endPos, nativeElement.value.length);
      this.textarea.patchValue(message);
    } else {
      this.textarea.patchValue(this.textarea.value + value);
    }
  }

  draftMessageChange(message: string) {
    this.textarea.patchValue(message);
  }

  initEmojiPicker() {
    this.emojiBackdropOpacity = false;
    this.emojiBackdropDisplay = true;
    this.isEmojiPickerVisible = EmojiPickerEnum.Hover;
    setTimeout(() => {
      this.emojiBackdropOpacity = true;
      this.emojiBackdropDisplay = false;
      this.isEmojiPickerVisible = EmojiPickerEnum.Closed;
      this.cdr.detectChanges();
    }, 1000);
  }

  handleEmojiBackdropDisplay() {
    this.emojiBackdropDisplay = this.isEmojiPickerVisible === EmojiPickerEnum.ClickSmily
      || this.isEmojiPickerVisible === EmojiPickerEnum.Hover;
    this.cdr.detectChanges();
  }

  cancelEmojiEmojiBackdropDisplayChange() {
    if (this.emojiLeavePickerTimer) {
      clearTimeout(this.emojiLeavePickerTimer);
      this.emojiLeavePickerTimer = null;
    }

    if (this.emojiCloseTimer) {
      clearTimeout(this.emojiCloseTimer);
      this.isEmojiPickerVisible = this.emojiState[0];
      this.handleEmojiBackdropDisplay();
      this.emojiCloseTimer = null;
    }
  }

  handleEmojiBackdropDisplayTimer(timing) {
    if (!timing) {
      this.handleEmojiBackdropDisplay();
    } else {
      this.emojiCloseTimer = setTimeout(() => {
        this.handleEmojiBackdropDisplay();
        this.emojiCloseTimer = null;
      }, timing);
    }
    this.cdr.detectChanges();
  }

  clickSmily() {
    this.isEmojiPickerVisible = this.isEmojiPickerVisible === EmojiPickerEnum.ClickSmily
      ? EmojiPickerEnum.Closed
      : EmojiPickerEnum.ClickSmily;
    this.handleEmojiBackdropDisplayTimer(0);
  }

  leaveSmily() {
    this.isEmojiPickerVisible = this.isEmojiPickerVisible === EmojiPickerEnum.ClickSmily
      ? EmojiPickerEnum.ClickSmily
      : EmojiPickerEnum.Closed;
    this.handleEmojiBackdropDisplayTimer(100);
  }

  hoverSmily() {
    this.isEmojiPickerVisible = this.isEmojiPickerVisible === EmojiPickerEnum.ClickSmily
      ? EmojiPickerEnum.ClickSmily
      : EmojiPickerEnum.Hover;
    this.cancelEmojiEmojiBackdropDisplayChange();
    this.handleEmojiBackdropDisplayTimer(0);
  }

  leavePickerEmoji() {
    this.emojiLeavePickerTimer = setTimeout(() => {
      this.isEmojiPickerVisible = this.isEmojiPickerVisible === EmojiPickerEnum.ClickSmily
        ? EmojiPickerEnum.ClickSmily
        : EmojiPickerEnum.LeavePicker;
      this.handleEmojiBackdropDisplayTimer(400);
      this.cdr.detectChanges();
    }, 200);
  }

  closeEmojiMenu() {
    this.isEmojiPickerVisible = EmojiPickerEnum.Closed;
    this.handleEmojiBackdropDisplay();
  }

  addEmoji(event) {
    const { nativeElement } = this.textareaMessage;
    const cursorStart = nativeElement.selectionStart;
    const message = this.textarea.value;
    const emojiMessage = message
      ? `${message.substring(0, cursorStart)}${event.emoji.native}${message.substring(cursorStart)}`
      : event.emoji.native;
    this.textarea.patchValue(emojiMessage);
    this.messageFull = true;
    nativeElement.setSelectionRange(cursorStart + event.emoji.native.length, cursorStart + event.emoji.native.length);
    nativeElement.focus();
    this.cdr.detectChanges();
  }

  showEmoji = (emoji)=>{
    return emoji !== '263A-FE0F';
  }

  ngAfterViewInit(): void {
    combineLatest([
      this.menuOpenStatus$,
      this.peOverlayWidgetService.isOpenOverlay$.pipe(startWith(false)),
      this.setCursorFocus$,
      this.activeChat$,
    ]).pipe(
      filter(() => !!this.textareaMessage),
      tap(([menuOpenStatus, isOverlayOpen]) => {
        const { nativeElement } = this.textareaMessage;
        const isMenuOrOverlayOpen = menuOpenStatus || isOverlayOpen;
        isMenuOrOverlayOpen && nativeElement.blur();
        window.innerWidth >= 720 && !isMenuOrOverlayOpen && nativeElement.focus();
      }),
      takeUntil(this.destroy$))
      .subscribe();
  }

  private createOverlay(): OverlayRef {
    return this.overlay.create({
      backdropClass: 'pe-chat-menu-backdrop',
      hasBackdrop: true,
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.chatFooter)
        .withDefaultOffsetY(0)
        .withPositions([
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom',
          },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
  }

  public openMenu(menuTemplate: TemplateRef<any>, alwaysFocus = false): void {
    !alwaysFocus && this.menuOpenStatus$.next(true);
    this.menuOverlayRef && this.closeMenu(true);
    this.menuOverlayRef = this.createOverlay();
    this.menuOverlayRef
      .backdropClick()
      .pipe(
        tap(() => {
          this.closeMenu();
        }))
      .subscribe();
    this.menuOverlayRef.attach(new TemplatePortal(menuTemplate, this.viewContainerRef));
    this.menuTrigger = true;
  }

  public closeMenu(switchMenu = false): void {
    this.menuOverlayRef && this.menuOverlayRef.dispose();
    this.menuTrigger = false;
    !switchMenu && this.menuOpenStatus$.next(false);
  }

  onDropFiles($event: DragEvent, type: PeChatAttachMenuItem, compression: boolean) {
    $event.preventDefault();
    $event.stopPropagation();
    this.chooseAttachMenu(type);
    this._dropFile = $event;
    const notMedia = this.notMedia($event.dataTransfer.files);
    this.type = PeChatAttachMenuItem[notMedia ? 'File' : 'PhotoOrVideo'];
    this.compression = compression;
  }

  removeFile(file): void {
    const index = this.droppedFiles.indexOf(file);
    if (index >= 0) {
      this.droppedFiles.splice(index, 1);
    }
  }

  checkDragDrop($event): void {
    const { pageX, pageY } = $event;
    const { left, right, top, bottom } = this.dragDimensions;
    if (left > pageX || pageX > right || top > pageY || pageY > bottom) { this.dropFiles = null; }
  }

  @HostListener('window:dragover', ['$event']) onDragOver($event) {
    $event?.preventDefault();
    $event?.target?.classList?.contains('pe-drop-box') && $event?.target?.classList?.add('drag-over');
    this.checkDragDrop($event);
  };

  @HostListener('window:dragleave', ['$event']) onDragLeave($event) {
    $event?.preventDefault();
    $event.stopPropagation();
    const targetClass = $event?.target?.classList;
    const relatedTargetClass = $event?.relatedTarget?.classList;
    if (
      !this.suffixClasses.some(suffix => relatedTargetClass?.contains(`drop-box${suffix}`))
      && targetClass?.contains('pe-drop-box')
    ) {
      targetClass?.remove('drag-over');
    };
    this.checkDragDrop($event);
  }

  filterMembersTag(search: string) {
    return this.members?.filter(item => item.title.toLowerCase().includes(search.toLowerCase()));
  }

  public openEditMessageMenu(messageToEdit: string): void {
    if (!messageToEdit) {
      return;
    }
    this.draftMessage = this.textarea.value;
    this._editMessage = messageToEdit;
    this.editMessageMenuTrigger = true;
    this.textareaMessage.nativeElement.focus();
    this.textarea.patchValue(messageToEdit);
  }

  private notMedia(files: DataTransferItemList | FileList) {
    return Array.from<DataTransferItem | File>(files).some(file => !isValidMedia(file.type));
  }

  initializeDroppedFiles($event: DragEvent) {
    this.dropBoxItems = this.notMedia($event.dataTransfer.items)
      ? [PE_CHAT_DROPBOX_FILE]
      : [
        PE_CHAT_DROPBOX_RAW_IMAGE,
        PE_CHAT_DROPBOX_COMPRESSED_IMAGE,
      ];
  }

  openForwardMessageMenu(): void {
    this.forwardMessageMenuTrigger = true;
    this.showNameOnForwardMessage = true;
  }

  public onSelectTag(chat): void {
    if (chat) {
      this.insertAtCursor(this.textareaMessage?.nativeElement, chat.title + ' ');
      this.closeMenu();
    }
    this.cdr.detectChanges();
  }

  public chooseAppsDetailMenu(item: any): void {
    this.appsMenuItem.emit({ app: this.appsMenuDetailItem, image: item });
    this.closeMenu();
  }

  public openAttachMenu(): void {
    this.openMenu(this.attachMenu);
  }

  public chooseAppsMenu(item: PeChatChannelMenuItem): void {
    this.appsMenuDetailItem = item;
    this.openMenu(this.appsMenuDetail);
  }

  public chooseAttachMenu(item: PeChatAttachMenuItem): void {
    switch (item) {
      case PeChatAttachMenuItem.Product:
        this.attachMenuItem.emit({ type: item });
        this.closeMenu();
        break;
      case PeChatAttachMenuItem.App:
        this.openMenu(this.appsMenu);
        break;
      case PeChatAttachMenuItem.File:
      case PeChatAttachMenuItem.PhotoOrVideo:
        this.type = item;
        this.openMenu(this.addFileUpload);
        this.messageText = this.textarea.value;
        this.chatForm.patchValue({ textarea: '' });
        break;
      case PeChatAttachMenuItem.Box:
        this.openMenu(this.boxMenu);
        break;
    }
  }

  public chooseBoxMenu(item: PeChatBox): void {
    switch (item) {
      case PeChatBox.Small:
        this.openMenu(this.addSmallBox);
        break;
      case PeChatBox.Large:
        this.openMenu(this.addLargeBox);
        break;
    }
  }

  public showForwardMessageAuthor(showAuthor: boolean): void {
    this.showNameOnForwardMessage = showAuthor;
  }

  removeSessionStorageChatDraftMessage(): void {
    if (sessionStorage.getItem('current_chats_draft')) {
      const currentChatsDraft = JSON.parse(sessionStorage.getItem('current_chats_draft')) as CurrentChatsDraft[];
      const currentChatId = sessionStorage.getItem('current_chat_id');
      const currentChatIndex = currentChatsDraft.findIndex(chat => chat.id === currentChatId);
      if (currentChatIndex !== -1) {
        currentChatsDraft[currentChatIndex].message = '';
        sessionStorage.setItem('current_chats_draft', JSON.stringify(currentChatsDraft));
      }
    }
  }

  public sendMessage(): void {
    this.isTyping = false;

    const pastedText = this.textareaMessage.nativeElement.value || null;
    if (pastedText) {
     this.textarea.patchValue(pastedText);
    }

    if (
      this.droppedFiles.length
      || String(this.textarea.value).trim().length
      || this.canSendEmpty
      || this.forwardMessageMenuTrigger
      || this.editMessageMenuTrigger
    ) {
      const editingAction = this.editMessageMenuTrigger;
      this.send.emit({
        message: this.textarea.value,
        files: this.droppedFiles,
        withSender: this.showNameOnForwardMessage,
      });
      !editingAction && this.textarea.patchValue('');
      this.removeSessionStorageChatDraftMessage();
      this.messageFull = false;
      this.droppedFiles = [];
      this.cdr.detectChanges();
    }
    else if (!this.textarea.value && !!this.replyMessage) {
      this.replyMessageCancelled.emit(true);
    }
  }

  sendFiles(event): void {
    this.attachMenuItem.emit({
      type: PeChatAttachMenuItem.File,
      data: event,
    });
    this.closeMenu();
  }
  
  public smallBoxUrlSelected(event): void {
    this.smallBoxForm.get('url').patchValue(event?.url ?? event);
  }

  public sendSmallBox(): void {
    this.boxFormSubmited = true;
    if (this.smallBoxForm.valid) {
      this.boxFormSubmited = false;
      this.smallBoxItem.emit(this.smallBoxForm.value);
      this.closeMenu();
    }
  }

  public sendLargeBox(): void {
    this.boxFormSubmited = true;
    if (this.largeBoxForm.valid) {
      this.boxFormSubmited = false;
      this.largeBoxItem.emit({ image: this.largeBoxImage, text: this.largeBoxForm.value.text });
      this.closeLargeBoxMenu();
    }
  }

  closeForwardMessageMenu(): void {
    this.forwardMessageMenuTrigger = false;
    this.forwardMessageCancelled.emit(true);
  }

  public closeLargeBoxMenu(): void {
    this.largeBoxImage = undefined;
    this.largeBoxForm.reset();
    this.closeMenu();
  }

  public closeEditMessageMenu(): void {
    this.textarea.patchValue(this.draftMessage);
    this.editMessageMenuTrigger = false;
    this.editMessageCancelled.emit(true);
    this.textareaMessage.nativeElement.focus();
  }

  moveArrowKey(index): void {
    this.arrowkeyLocation = Math.max(Math.min(this.arrowkeyLocation + index, this.tagItems.length - 1), 0);
  }

  onKeyDown($event): void {
    if ($event.key === KeyEventEnum.ENTER && !$event.shiftKey) {
      $event.preventDefault();
    }
    const message = this.textarea.value;
    if (
      ($event.key === KeyEventEnum.ENTER && $event.shiftKey)
      || ($event.key === KeyEventEnum.ENTER && $event.metaKey)
      || ($event.key === KeyEventEnum.UP
        && (message === null || message.trim() === ''))
    ) {
      return;
    }

    if(this.menuTrigger) {
      switch ($event.key) {
        case KeyEventEnum.UP: this.moveArrowKey(-1); $event.preventDefault(); break;
        case KeyEventEnum.DOWN: this.moveArrowKey(1); $event.preventDefault(); break;
        case KeyEventEnum.ENTER: $event.preventDefault(); this.cdr.detectChanges(); break;
      }
    }
  }

  onInput($event) {
    this.inputChange$.next();
  }

  onKeyUp($event): void {
    const message = this.textarea.value;
    this.storeDraftMessagesInSessionStorageByChat(message);
    if (
      ($event.key === KeyEventEnum.ENTER && $event.shiftKey)
      || ($event.key === KeyEventEnum.ENTER && $event.metaKey)
    ) {
      return;
    }

    if (($event.key === KeyEventEnum.UP && (message === null || message.trim() === ''))) {
      this.openLastMessageInEditMenu.emit();

      return;
    }

    switch ($event.key) {
      case KeyEventEnum.ENTER:
        if (this.menuTrigger) {
          $event.preventDefault();
          this.onSelectTag(this.tagItems[this.arrowkeyLocation]);
          this.arrowkeyLocation = this.tagItems.length;
          this.cdr.detectChanges();
        } else {
          this.cdr.detectChanges();
          this.sendMessage();
        }
        break;
      default:
        const { nativeElement } = this.textareaMessage;
        const startPos = nativeElement.selectionStart;
        const message = nativeElement.value as string;
        const lastAt = message.substring(0, startPos).lastIndexOf('@');
        const search = message.substring(lastAt + 1, startPos);
        const isWhitespaceFirst = search[0] === ' ';
        const results = isWhitespaceFirst ? [] : this.filterMembersTag(search);

        if (!results?.length || lastAt < 0 || isWhitespaceFirst) {
          this.menuTrigger && this.closeMenu();
        } else {
          this.tagItems = results;
          !this.menuTrigger && this.openMenu(this.tagMenu, true);
          this.cdr.detectChanges();
        }
        break;
    }
  }

  storeDraftMessagesInSessionStorageByChat(message: string): void {
    let currentChatsDraft: CurrentChatsDraft[] = [];
    if (sessionStorage.getItem('current_chats_draft')) {
      currentChatsDraft = JSON.parse(sessionStorage.getItem('current_chats_draft')) as CurrentChatsDraft[];
    }
    const currentChatIndex = currentChatsDraft.findIndex(chat => chat.id === this.activeChat$.value._id);
    if (message?.length >= 0) {
      let currentChatsDraftElement: CurrentChatsDraft = { message: message, id: this.activeChat$.value._id };
      if (currentChatIndex === -1) {
        currentChatsDraft.push(currentChatsDraftElement);
      } else {
        currentChatsDraft[currentChatIndex] = currentChatsDraftElement;
      }
      sessionStorage.setItem('current_chats_draft', JSON.stringify(currentChatsDraft));
    } else {
      if (currentChatIndex !== -1) {
        currentChatsDraft.splice(currentChatIndex, 1);
        sessionStorage.setItem('current_chats_draft', JSON.stringify(currentChatsDraft));
      }
    }
  }

  autogrow(textareaMessage): void {
    if (textareaMessage) {
      this.messageFull = textareaMessage?.value.trim() !== '';
      textareaMessage.style.overflow = 'hidden';
      textareaMessage.style.height = '0px';
      textareaMessage.style.height = textareaMessage.scrollHeight + 'px';
    }
  }

  onFileOver(event): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    this.informationBoxChange(event.dataTransfer.files);
  }

  onFileLeave(event): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  informationBoxChange(files): void {
    const reader = new FileReader();
    this.largeBoxImage = files[0];
    reader.readAsDataURL(files[0]);
    reader.onload = () => {
      this.largeBoxForm.get('image').patchValue(reader.result);
      this.cdr.detectChanges();
    };
  }

  selectMessageChannel(channel: string): void {
    this.selectedMessageChannel = channel;
    this.channelChange.emit(channel);
  }

  onFormFieldActionClick(formFieldAction: { title: string, onClick: () => void }): void {
    formFieldAction.onClick();
  }

  public blur() {
    this.formEventsSubject.next(PeMessageEventType.BLUR);
  }

  public sendMessageButtonClick() {
    this.formEventsSubject.next(PeMessageEventType.SENDMESSAGE);
  }

  public openChangeRecipient(): void {
    this.openChangeRecipientOverlay.emit();
  }

  previewReplyImage() {
    const attachment = this.replyMessage?.attachments?.find(item => item.url);

    return attachment ? this.domSanitizer.bypassSecurityTrustStyle(`url(${attachment.url})`) : null;
  }

  cancelReplyMessage() {
    this.replyMessageCancelled.emit(true);
  }

  textareaWidth(textarea: HTMLTextAreaElement) {
    return Math.round(textarea.clientWidth * 0.8);
  }
}
