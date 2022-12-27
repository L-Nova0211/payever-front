import { animate, state, style, transition, trigger } from '@angular/animations';
import { ListRange } from '@angular/cdk/collections';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  ContentChildren,
  QueryList,
  ContentChild,
  HostBinding,
  ViewEncapsulation,
  OnDestroy,
  OnInit,
  Inject,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  AfterViewInit,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, of, ReplaySubject, Subject } from 'rxjs';
import { debounceTime, map, takeUntil, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { PeChatMessage, PeChatMessageType, PeMessageTrackerService, PeMessageUser } from '@pe/shared/chat';

import { PeBooleanInput } from './chat.helpers';
import { ChatScrollService } from './chat.service';
import { PeChatHeaderComponent } from './components';
import { PeChatFormComponent } from './components/chat-form/chat-form.component';
import { PeChatMessageComponent } from './components/chat-message/chat-message.component';
import { ChatIcons } from './enums/chat-icons.enum';
import { ChatScrollPosition } from './interfaces/chat-scroll-position.interface';
import { VirtualForDirective } from './scrolling/virtual-for.directive';
import { VirtualScrollViewportComponent } from './scrolling/virtual-scroll-viewport.component';

@Component({
  selector: 'pe-chat',
  styleUrls: ['./chat.component.scss'],
  templateUrl: './chat.component.html',
  animations: [
    trigger('showBadgeAnimation', [
      state('show', style({
        opacity: 1,
      })),
      state('hidden', style({
        opacity: 0,
      })),
      transition('show => hidden', [
        animate('1s'),
      ]),
      transition('hidden => show', [
        animate('.2s'),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeChatComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  static ngAcceptInputType_scrollBottom: PeBooleanInput;

  protected destroyed$ = new ReplaySubject<boolean>();
  protected _showScrollButton = false;
  unreadCount = 0;
  stopScroll = false;
  messageScrolled = new Subject();
  showDateTag = false;
  dateTag;

  @Input() keepScrollPositionId: string;
  @Input() theme!: string;
  @Input() title: string;
  @Input() shown$: Observable<boolean> = of(true);
  @Input() noMessagesPlaceholder = 'Add your first contact to start a conversation.';
  @Input() bgColor = '#131414';
  @Input() messagesBottomColor = '';
  @Input() activeUser: PeMessageUser;
  @Input() chatMode: boolean;
  @Input() pinCount: number;

  @Input() set highlightMessage(message: PeChatMessage) {
    if (message) {
      this.navigateToMessage(message._id);
    }
  }

  @Output() scrollPositionChanged = new EventEmitter<{ scrollTop: number, scrollHeight: number }>();
  @Output() backToChatMessage = new EventEmitter<void>();
  @Output() unpinAllMessages = new EventEmitter<void>();

  get scrollBottom() {
    return this._showScrollButton;
  };

  set scrollBottom(value: boolean) {
    this._showScrollButton = value;
  }

  _virtualFor: VirtualForDirective;
  @ViewChild(VirtualScrollViewportComponent) viewport: VirtualScrollViewportComponent;

  @ContentChild(VirtualForDirective) set virtualFor(virtualFor: VirtualForDirective) {
    this._virtualFor = virtualFor;
  }

  get virtualFor() {
    return this._virtualFor;
  }

  @ViewChild('scrollable') scrollable: ElementRef;
  @ViewChild('messageContainer') messageContainer: ElementRef;
  @ContentChildren(PeChatMessageComponent) messages: QueryList<PeChatMessageComponent>;
  @ContentChild(PeChatHeaderComponent) headerForm: PeChatHeaderComponent;
  @ContentChild(PeChatFormComponent) chatForm: PeChatFormComponent;

  @HostBinding('class.show') show = false;
  @HostBinding('class.pe-chat') peChat = true;

  headerFormCaptured = false;
  scrollPosition: ChatScrollPosition = {} as ChatScrollPosition;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private chatService: ChatScrollService,
    private domSanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private scrollDispatcher: ScrollDispatcher,
    private messageTrackerService: PeMessageTrackerService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
    Object.entries(ChatIcons).forEach(([name, path]) => {
      this.matIconRegistry.addSvgIcon(
        name,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/icons/${path}`),
      );
    });
    this.messageScrolled.pipe(
      map(() => {
        this.showDateTag = true;
        this.cdr.detectChanges();
      }),
      debounceTime(1000),
      map(() => {
        this.showDateTag = false;
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
    this.chatService.setInputItems$.pipe(
      tap(items => {
        if (items && this.viewport) {
          this.viewport.items = items;
          this.viewport.itemTemplate = this.virtualFor.template;
          this.viewport.attachView(this.virtualFor.viewContainerRef);
          this.viewport.virtualScroll.renderedRangeStream.pipe(
            tap((ls: ListRange) => {
              if (ls.start === 0 && !this.stopScroll) {
                setTimeout(() => {
                  this.viewport.virtualScroll.scrollToIndex(this.viewport.items.length);
                  this.cdr.detectChanges();
                }, 100);
              }
            })).subscribe();
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  onScroll($event) {
    const { scrollHeight, scrollTop } = $event.target;
    this.scrollBottom = (scrollHeight > scrollTop + document.body.offsetHeight);
  }

  scrollIndexChange() {
    this.chatService.scrollChange$.next();
  }

  ngOnInit() {
    this.messageTrackerService.newMessageTracker$
    .pipe(
      debounceTime(500),
      tap(() => this.scrollListBottom()),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.shown$.pipe(
      tap((data) => {
        this.show = data;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.chatService.scrollToMessage$.pipe(
      tap((repliedMessage: PeChatMessage) => {
        this.navigateToMessage(repliedMessage._id);
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  firstItemIndexChange(index) {
    if (this.viewport && this.viewport.items) {
      this.dateTag = this.viewport.items[index]?.createdAt
        ? this.dateSeparator(this.viewport.items[index].createdAt)
        : null;
    }
  }

  private dateSeparator(dateString: Date) {
    const date = new Date(dateString);

    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  };

  ngAfterViewInit(): void {
    this.scrollDispatcher.scrolled().pipe(
      tap(() => {
        this.messageScrolled.next();
      }),
      map(event => this.viewport.virtualScroll.measureScrollOffset('bottom') < 20),
    ).subscribe(event => {
      this.scrollBottom = !event;
      this.stopScroll = true;
      this.cdr.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.headerForm && !this.headerFormCaptured) {
      this.headerFormCaptured = true;
      this.headerForm.showPinnedMessage.pipe(
        tap((pinnedMessage: PeChatMessage) => {
          this.navigateToMessage(pinnedMessage._id);
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    }

    if (this.headerForm) {
      this.headerForm.chatHeaderToggle.pipe(
        tap(() => {
          this.chatModeToggle();
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    }
  }

  navigateToMessage(messageId) {
    this.viewport.virtualScroll.scrollToIndex(this.findMessageIndex(messageId, this.viewport.items));
    this.highlightMessageFn(messageId, this.messages);
  }

  backToChat(): void {
    this.backToChatMessage.emit();
    this.cdr.detectChanges();
  }

  unpinAllMessage() {
    this.unpinAllMessages.emit();
  }

  public isMessageRead(message: PeChatMessage): boolean {
    const { readBy, sender, type } = message;
    const currentMemberId = (typeof this.activeUser === 'string') ? this.activeUser : this.activeUser?._id;

    return [PeChatMessageType.WelcomeMessage, PeChatMessageType.DateSeparator, PeChatMessageType.Box].includes(type)
      || (readBy && readBy.includes(currentMemberId)) || sender === currentMemberId;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  scrollListBottom(): void {
    this.viewport.virtualScroll.scrollTo({ bottom: 0 });
  }

  highlightMessageFn(replyMessageId, messages) {
    const mCReplied = messages.find(item => item.messageObj._id === replyMessageId);
    if (mCReplied) {
      mCReplied.highlightMessageTrigger += 1;
    }
  }

  public findMessageIndex(messageId, messages) {
    let indexFound = 0;
    messages.forEach((element, index) => {
      if (element._id === messageId) {
        indexFound = index;
      }
    });

    return indexFound;
  }

  chatModeToggle() {
    this.chatMode = !this.chatMode;
  }
}
