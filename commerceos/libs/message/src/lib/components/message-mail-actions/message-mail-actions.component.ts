import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, iif, Observable, of, Subject } from 'rxjs';
import { map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { PeMessageChat, PeMessageContact, PeMessageIntegration } from '@pe/shared/chat';

import { PeMailBuilderService } from '../../modules/editor/message-builder/mail-builder.service';
import { PeMessageApiService, PeMessageChatRoomListService, PeMessageService } from '../../services';

@Component({
  selector: 'pe-mail-actions',
  templateUrl: './message-mail-actions.component.html',
  styleUrls: ['./message-mail-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageMailActionsComponent implements OnDestroy {

  @ViewChild('flagColorMenu') flagColorMenu!: TemplateRef<any>;
  @ViewChild('flagColorAction') flagColorAction!: ElementRef<HTMLElement>;

  @Input() activeChat!: PeMessageChat;

  flagColor = { name: 'red', color: 'red' };
  flagColorOverlay!: OverlayRef;
  flagColors: { name: string, color: string }[] = [
    {
      name: 'orange',
      color: 'orange',
    },
    {
      name: 'red',
      color: 'red',
    },
    {
      name: 'purple',
      color: 'purple',
    },
    {
      name: 'blue',
      color: 'blue',
    },
    {
      name: 'yellow',
      color: 'yellow',
    },
    {
      name: 'green',
      color: 'green',
    },
    {
      name: 'grey',
      color: 'grey',
    },
  ];

  destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private envService: PebEnvService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMailBuilderService: PeMailBuilderService,
    private peMessageApiService: PeMessageApiService,
    private peMessageService: PeMessageService,
  ) { }

  ngOnDestroy(): void {
    this.flagColorOverlay?.dispose();
  }

  onMailActionClick(action: string): void {
    switch (action) {
      case 'get':
        this.peMessageChatRoomListService.getConversationList().subscribe();
        this.cdr.detectChanges();
        break;
      case 'create':
        this.router.navigate(['editor'], { relativeTo: this.route }).catch(() => {
          this.router.navigate([`business/${this.envService.businessId}/message/editor`]);
        });
        break;
      case 'delete':
        this.peMessageChatRoomListService.deleteChat(this.activeChat._id)
          .pipe(takeUntil(this.destroy$))
          .subscribe();
        break;
      case 'reply':
        const sender = this.activeChat.messages?.[this.activeChat.messages.length - 1].sender;
        if (sender) {
          this.getRecipients([sender]).pipe(
            tap((recipients) => {
              this.peMailBuilderService.setMailConfig({
                recipients: recipients,
                subject: `Re: ${this.activeChat.title.replace('Re:', '').replace('Fw:', '').trim()}`,
                sender: null,
                testMailRecipient: null,
              });
            }),
          ).subscribe();
        }
        this.router.navigate(['editor'], { relativeTo: this.route }).catch(() => {
          this.router.navigate([`business/${this.envService.businessId}/message/editor`]);
        });
        break;
      case 'reply-all':
        this.getRecipients(this.activeChat.contacts).pipe(
          tap((recipients) => {
            this.peMailBuilderService.setMailConfig({
              recipients: recipients,
              subject: `Re: ${this.activeChat.title.replace('Re:', '').replace('Fw:', '').trim()}`,
              sender: null,
              testMailRecipient: null,
            });
          }),
        ).subscribe();

        this.peMailBuilderService.replyConfig$.next(this.activeChat);

        this.router.navigate(['editor'], { relativeTo: this.route }).catch(() => {
          this.router.navigate([`business/${this.envService.businessId}/message/editor`]);
        });
        break;
      case 'forward':
        const lastMessage = this.activeChat?.messages?.[this.activeChat?.messages.length - 1];
        if (lastMessage) {
          const subject = `Fw: ${this.activeChat.title.replace('Re:', '').replace('Fw:', '').trim()}`;

          this.peMailBuilderService.setMailConfig({
            recipients: [],
            subject,
            sender: null,
            testMailRecipient: null,
          });

          this.peMailBuilderService.forwardConfig$.next({
            subject,
            mailTheme: JSON.parse(lastMessage.content),
          });
        }
        this.router.navigate(['editor'], { relativeTo: this.route }).catch(() => {
          this.router.navigate([`business/${this.envService.businessId}/message/editor`]);
        });
        break;
      case 'flag':
        // TODO: Add flag chat functionality after BE implemented
        break;
      case 'flag-color':
        this.flagColorOverlay = this.overlay.create({
          positionStrategy: this.overlay
            .position()
            .flexibleConnectedTo(this.flagColorAction)
            .withDefaultOffsetX(-5)
            .withDefaultOffsetY(-12)
            .withPositions([
              {
                originX: 'start',
                originY: 'top',
                overlayX: 'start',
                overlayY: 'bottom',
              },
            ]),
          scrollStrategy: this.overlay.scrollStrategies.reposition(),
          hasBackdrop: true,
          backdropClass: 'pe-chat-attach-menu-backdrop',
          panelClass: 'message-attach-menu',
        });

        this.flagColorOverlay.backdropClick().subscribe(() => this.flagColorOverlay.dispose());
        this.flagColorOverlay.attach(new TemplatePortal(this.flagColorMenu, this.viewContainerRef));
        break;
      case 'notification':
        if (!this.activeChat._id) {
          break;
        }
        iif(
          () => this.isNotificationsDisabled(this.activeChat),
          this.peMessageApiService.postNotificationEnable(this.activeChat?._id),
          this.peMessageApiService.postNotificationDisable(this.activeChat?._id, { forever: true }),
        ).pipe(
          switchMap(() => this.peMessageChatRoomListService.getConversationList()),
          take(1),
        ).subscribe();
        break;
    }
  }

  isNotificationsDisabled(activeChat: PeMessageChat | null): boolean {
    const disabledUntil = this.activeChat?.members?.find(member =>
      member?.user === this.peMessageService.activeUser?._id)?.notificationDisabledUntil;

    return !!disabledUntil;
  }

  onCloseMenu(template: TemplateRef<any>): void {
    this.flagColorOverlay.dispose();
  }

  onFlagColorSelected(flag: { name: string, color: string }): void {
    this.flagColor = flag;
    this.cdr.detectChanges();
    this.flagColorOverlay.dispose();
  }

  getRecipients(contacts: string[]): Observable<any> {
    const reqs$ = contacts.map((recipient) => {
      return iif(() => recipient === this.peMessageService.activeUser?._id,
        of(this.peMessageService.activeUser?.userAccount?.email),
        this.peMessageApiService.getContactList().pipe(
          map((contactList: any) =>
            this.findContactByEmail(contactList, recipient)
          ))
        );
    });

    return forkJoin(reqs$).pipe(take(1));
  }

  private findContactByEmail(contactList: PeMessageContact[], email: string): any {
    return contactList.find((contact: any) =>
              contact._id === email)?.communications?.find((communication: any) =>
                communication.integrationName === PeMessageIntegration.Email)?.identifier;
  }
}
