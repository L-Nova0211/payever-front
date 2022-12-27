import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { EMPTY, of } from 'rxjs';
import { catchError, filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { EnvService, PeDestroyService } from '@pe/common';
import { PeGridItem } from '@pe/grid';
import { Contact, ContactsAppState, PopupMode } from '@pe/shared/contacts';
import { SnackbarConfig, SnackbarService } from '@pe/snackbar';

import { ConversationFacade } from '../../classes/conversation';
import { PeContactPopupMode, PeMessageChatType } from '../../enums';
import { ContactsDialogService } from '../../services';
import { PeMessageChatRoomListService } from '../../services/message-chat-room-list.service';
import { PeMailBuilderService } from '../editor/message-builder/mail-builder.service';

@Component({
  selector: 'pe-message-contacts-component',
  templateUrl: './message-contacts-root.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeMessageContactsRootComponent implements AfterViewInit {
  @SelectSnapshot(ContactsAppState.contacts) contactsSnapshot: PeGridItem<Contact>[];

  private dialogRef: MatDialogRef<any>;
  theme = 'dark';

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private contactDialogService: ContactsDialogService,
    private peMailBuilderService: PeMailBuilderService,
    private store: Store,
    private envService: EnvService,
    private destroyed$: PeDestroyService,
    private snackbarService: SnackbarService,
    private conversationFacade: ConversationFacade,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.openContactsOverlay();
  }

  private openContactsOverlay(): void {
    this.store.dispatch(new PopupMode(true));
    this.dialogRef = this.matDialog.open(this.templateRef, {
      backdropClass: 'message-contacts-backdrop',
      hasBackdrop: true,
      maxWidth: window.innerWidth > 720 ? '80vw' : 'none',
      width: window.innerWidth > 720 ? '80vw' : 'calc(100vw - 32px)',
      height: '90vh',
      panelClass: 'message-contacts',
      data: {
        theme: this.theme,
      },
    });

    this.dialogRef.afterClosed().pipe(
      filter((added) => !!added),
      switchMap(() => {
        this.store.dispatch(new PopupMode(false));

        return this.switchNextTask();
      }),
      catchError( () => {
        const config: SnackbarConfig = {
          boldContent: 'Error! ',
          content: `Something went wrong. Please try again.`,
          duration: 5000,
          useShowButton: false,
        };

        this.snackbarService.toggle(true, config);
        this.router.navigateByUrl(`/business/${this.envService.businessId}/message`);

        return EMPTY;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  switchNextTask() {
    switch (this.route.snapshot.params['mode']) {
      case PeContactPopupMode.Email:
        this.router.navigate(['../editor'], { relativeTo: this.route.parent }).then((nav) => {
          const emails = this.contactsSnapshot.map(recipient => recipient.data?.email);
          this.peMailBuilderService.setMailConfig({
            recipients: emails,
            sender: null,
            subject: null,
            testMailRecipient: null,
          });
        });

        return EMPTY;

      case PeContactPopupMode.AddMember:
        this.contactDialogService.changeSaveStatus(true);
        this.router.navigate([`/business/${this.envService.businessId}/message/`]);

        return EMPTY;

      default:
        return this.createChatOrGroup();
    }
  }

  createChatOrGroup() {
    const contacts = this.contactsSnapshot;
    const userId = contacts[0].data.metaUserId;

    if (contacts.length === 1 && !contacts[0].data.email) {
      const config: SnackbarConfig = {
        content: `This contact doesn't have email. Please add it.`,
        duration: 5000,
        useShowButton: false,
      };
      this.snackbarService.toggle(true, config);

      return of(null);
    }

    let foundDirectChat = false;
    if (contacts.length === 1 && userId) {
      const directChats = this.peMessageChatRoomListService.chatList
        .filter(chat => chat.type === PeMessageChatType.DirectChat);
      directChats.forEach(chat => {
        if (chat.members.map(member => member.user).includes(userId)) {
          this.peMessageChatRoomListService.activeChat = chat;
          this.router.navigateByUrl(`/business/${this.envService.businessId}/message`);
          foundDirectChat = true;
        }
      });

      if (foundDirectChat) {
        return of(null);
      }
    }

    const groupNumber = this.peMessageChatRoomListService.chatList
      .filter(group => group.type === PeMessageChatType.Group).length;

    return this.conversationFacade.createConversation({
      contacts,
    }, groupNumber).pipe(
      tap(() => {
        const config: SnackbarConfig = {
          boldContent: 'Success! ',
          content: `Contact has been connected.`,
          duration: 5000,
          useShowButton: false,
          iconId: 'icon-commerceos-success',
          iconSize: 24,
          iconColor: '#00B640',
        };
        this.snackbarService.toggle(true, config);

        this.changeDetectorRef.markForCheck();

        this.router.navigateByUrl(`/business/${this.envService.businessId}/message`);
      }),
    );
  }

  addContactDialog(): void {
    this.dialogRef.close(true);
  }

  closeContactDialog(): void {
    this.store.dispatch(new PopupMode(false));
    this.dialogRef.close(false);
    this.router.navigate([`/business/${this.envService.businessId}/message/`]);
  }
}
