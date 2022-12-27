import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { xor } from 'lodash-es';
import { EMPTY, forkJoin, iif, merge, of, Subject } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebEditorStore } from '@pe/builder-services';
import { AppType, MessageBus } from '@pe/common';
import { ConfirmActionDialogComponent } from '@pe/confirm-action-dialog';
import { DockerItemInterface, DockerState } from '@pe/docker';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeMessageContact, PeMessageIntegration } from '@pe/shared/chat';
import { ContactsAppState } from '@pe/shared/contacts';
import { SnackbarService, SnackbarConfig } from '@pe/snackbar';

import { MessageBusEvents } from '../../enums';
import {
  CosMessageBus,
  PeMarketingApiService,
  PeMessageApiService,
  PeMessageChatRoomListService,
} from '../../services';

import { PeMailBuilderService } from './message-builder/mail-builder.service';
import { PeMessageBuilderComponent } from './message-builder/message-builder.component';

@Component({
  selector: 'pe-message-editor',
  templateUrl: './message-editor.component.html',
})
export class PeMessageEditorComponent implements OnInit, OnDestroy {
  @SelectSnapshot(ContactsAppState.contacts) contactsSnapshot: any;
  @SelectSnapshot(DockerState.dockerItems) dockerItems: DockerItemInterface[];

  contacts: any;

  dialogRef: MatDialogRef<any>;
  theme = 'dark';

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  destroy$ = new Subject<void>();
  onCloseOverlay$ = new Subject<boolean>();

  constructor(
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    @Inject(MessageBus) private messageBus: CosMessageBus<MessageBusEvents>,
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMailBuilderService: PeMailBuilderService,
    private peMarketingApiService: PeMarketingApiService,
    private snackbarService: SnackbarService,
    private editorStore: PebEditorStore,
    private matDialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private apmService: ApmService,
  ) {
  }

  ngOnInit(): void {
    this.openMessageBuilderOverlay();

    merge(
      this.messageBus.listen(MessageBusEvents.ContactsOpen).pipe(
        tap(() => {
          const app = this.dockerItems?.find(item => item.code === AppType.Contacts);
          if (app?.installed) {
            this.peMailBuilderService.blockRouteNavigation$.next(false);
            this.router.navigateByUrl(this.router.url.replace('/message/editor', '/message/contacts')).then(() => {
              this.peOverlayWidgetService.close();
            });
          } else {
            this.snackbarService.toggle(true, {
              content: this.translateService.translate( 'message-app.sidebar.contact_isnt_installed' ),
              iconColor: '#E2BB0B',
              duration: 2500,
            });
          }
        }),
      ),
      this.onCloseOverlay$.pipe(
        tap((closed) => {
          this.peMailBuilderService.blockRouteNavigation$.next(false);
          this.router.navigate(['..'], { relativeTo: this.route.parent }).then(
            () => {
              if (closed) {
                const config: SnackbarConfig = {
                  boldContent: 'Success! ',
                  content: `Your campaign has been sent.`,
                  duration: 5000,
                  useShowButton: false,
                  iconId: 'icon-commerceos-success',
                  iconSize: 24,
                  iconColor: '#00B640',
                };

                this.snackbarService.toggle(true, config);
              } else {
                const config: SnackbarConfig = {
                  boldContent: 'Error! ',
                  content: `Something went wrong. Please try again.`,
                  duration: 5000,
                  useShowButton: false,
                };

                this.snackbarService.toggle(true, config);
              }
            }
          );
        }),
      ),
      this.messageBus.listen(MessageBusEvents.SaveDraft).pipe(
        switchMap((message) => {
          const config: SnackbarConfig = {
            content: `Saving...`,
            duration: 50000,
            useShowButton: false,
            pending: true,
          };
          this.snackbarService.toggle(true, config);

          return this.peMessageApiService.postChannel({
            title: message.content && JSON.parse(message.content).subject
              ? JSON.parse(message.content).subject
              : 'No subject',
            contacts: this.contactsSnapshot.map(contact => contact.id),
            integrationName: PeMessageIntegration.Email,
          }).pipe(
            switchMap((channel) => {
              return this.peMessageApiService.postChatMessage(channel._id, message).pipe(
                tap(() => {
                  const config: SnackbarConfig = {
                    boldContent: 'Success! ',
                    content: `Your draft has been saved.`,
                    duration: 5000,
                    useShowButton: false,
                    iconId: 'icon-commerceos-success',
                    iconSize: 24,
                    iconColor: '#00B640',
                  };
                  this.snackbarService.toggle(true, config);
                  this.peMailBuilderService.blockRouteNavigation$.next(false);
                  this.router.navigateByUrl(this.router.url.replace('/message/editor', '/message')).then(() => {
                    this.peOverlayWidgetService.close();
                  });
                }),
              );
            }),
            catchError((err: HttpErrorResponse) => {
              this.snackbarService.toggle(true, {
                boldContent: `${err.status} ${err.name}! `,
                content: err.error.error,
                duration: 5000,
                iconId: 'icon-apps-alert',
                iconSize: 24,
                useShowButton: false,
              });
              this.apmService.apm.captureError(err);

              return EMPTY;
            }),
          );
        }),
      ),
      this.messageBus.listen(MessageBusEvents.SendMail).pipe(
        switchMap(({ mail, isTestMail }) => {
          if ((!isTestMail && (!mail.mailConfig.recipients || !mail.mailConfig.subject)) ||
            (isTestMail && (!mail.mailConfig.testMailRecipient || !mail.mailConfig.subject))) {

            const mailTo = isTestMail ? `"Test Mail"` : `"To"`;
            this.matDialog.open(ConfirmActionDialogComponent, {
              panelClass: 'message-confirm-dialog',
              hasBackdrop: true,
              backdropClass: 'confirm-dialog-backdrop',
              data: {
                title: 'Required Fields',
                subtitle: `Fields ${mailTo} and "Subject" are required and must be filled.`,
                confirmButtonTitle: 'OK',
                theme: this.theme,
              },
            });

            return EMPTY;
          }
          const recipients = isTestMail ? [mail.mailConfig.testMailRecipient] : mail.mailConfig.recipients;
          const dialogRef = this.matDialog.open(ConfirmActionDialogComponent, {
            panelClass: 'message-confirm-dialog',
            hasBackdrop: true,
            backdropClass: 'confirm-dialog-backdrop',
            data: {
              title: 'Send this message?',
              subtitle: `By clicking "Send" this campaign will be sent to ${recipients.length} people.`,
              confirmButtonTitle: 'Send',
              confirmButtonColor: '#2482e7',
              cancelButtonTitle: 'Cancel',
              theme: this.theme,
              payeverIcon: true,
            },
          });

          return dialogRef.afterClosed().pipe(
            filter(send => send),
            switchMap((res) => {
              return this.peMarketingApiService.postMailSchedule({
                data: {
                  themeId: this.editorStore.theme.id,
                  contacts: recipients,
                  from: mail.mailConfig.sender,
                  name: mail.mailConfig.subject,
                  date: new Date().toISOString(),
                  schedules: mail.schedule,
                  status: 'new',
                },
                operationName: 'createCampaign',
              }).pipe(
                tap((campaign) => {
                  const config: SnackbarConfig = {
                    content: `Sending...`,
                    duration: 50000,
                    useShowButton: false,
                    pending: true,
                  };

                  this.snackbarService.toggle(true, config);
                }),
                switchMap(() => {
                  const contactsFilter = recipients.map((recipient: any) => ({
                    'communications.identifier': recipient,
                    'communications.integrationName': PeMessageIntegration.Email,
                  }));

                  return this.peMessageApiService.getContactList(contactsFilter).pipe(
                    switchMap((contacts: PeMessageContact[]) => {
                      const newContacts = xor(
                        contacts.map((contact: PeMessageContact) => {
                          return contact.communications
                            .find((comm: { identifier: string, integrationName: PeMessageIntegration }) => {
                              return comm.integrationName === PeMessageIntegration.Email;
                            })?.identifier;
                        }),
                        recipients,
                      );

                      if (newContacts.length) {
                        return forkJoin([
                          ...newContacts.map((recipient: any) => {
                            return this.peMessageApiService.postContact({
                              name: recipient,
                              communications: [{
                                identifier: recipient,
                                integrationName: PeMessageIntegration.Email,
                              }],
                            });
                          }),
                        ]).pipe(
                          map(addedContacts => [...addedContacts, ...contacts]),
                        );
                      }

                      return of(contacts);
                    }),
                    switchMap((contacts: any) => {
                      return iif(
                        () => !!mail.channel,
                        of(mail.channel),
                        this.peMessageApiService.postChannel({
                          title: mail.mailConfig.subject,
                          integrationName: PeMessageIntegration.Email,
                          description: `${recipients.length} members`,
                          contacts: contacts.map((contact: PeMessageContact) => contact._id),
                        }),
                      ).pipe(
                        switchMap((channel) => {
                          const data = this.editorStore.page;
                          data.stylesheets = { desktop: data.stylesheets?.desktop || {} };
                          const message = {
                            attachments: [],
                            content: JSON.stringify(data),
                            sentAt: new Date(),
                          };

                          return this.peMessageApiService.postChatMessage(channel._id, message).pipe(
                            switchMap(() => {
                              if (isTestMail) {
                                const config: SnackbarConfig = {
                                  boldContent: 'Success! ',
                                  content: `Your test email has been sent.`,
                                  duration: 5000,
                                  useShowButton: false,
                                  iconId: 'icon-commerceos-success',
                                  iconSize: 24,
                                  iconColor: '#00B640',
                                };

                                this.snackbarService.toggle(true, config);
                              } else {
                                this.peOverlayWidgetService.close();
                                this.onCloseOverlay$.next(true);
                              }

                              return this.peMessageChatRoomListService.getConversationList();
                            }),
                            catchError(err => {
                              this.peOverlayWidgetService.close();
                              this.onCloseOverlay$.next(false);

                              return this.peMessageChatRoomListService.getConversationList();
                            }),
                          );
                        }),
                      );
                    }),
                  );
                }),
              );
            }),
          );
        }),
      )
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  addContactDialog(): void {
    this.dialogRef.close(true);
  }

  closeContactDialog(): void {
    this.dialogRef.close(false);
  }

  private openMessageBuilderOverlay(): void {
    const peOverlayConfig: PeOverlayConfig = {
      backdropClick: () => {
        const dialogRef = this.matDialog.open(ConfirmActionDialogComponent, {
          panelClass: 'message-confirm-dialog',
          hasBackdrop: true,
          backdropClass: 'confirm-dialog-backdrop',

          data: {
            title: 'Are you sure?',
            subtitle: `All data will be lost and you will not be able to restore it.`,
            confirmButtonTitle: 'OK',
            cancelButtonTitle: 'Cancel',
            theme: this.theme,
          },
        });

        dialogRef.afterClosed().pipe(
          filter(closed => !!closed),
          tap(closed => {
            this.peMailBuilderService.blockRouteNavigation$.next(false);
            this.router.navigate(['..'], { relativeTo: this.route.parent }).then(
              () => {
                this.peOverlayWidgetService.close();
              },
            );
          }),
          takeUntil(this.destroy$),
        ).subscribe();

      },
      data: {
        theme: this.theme,
      },
      hasBackdrop: true,
      headerConfig: {
        hideHeader: true,
        removeContentPadding: true,
        title: this.translateService.translate('message-app.message-overlay.overlay.title'),
        theme: this.theme,
      },
      panelClass: 'pe-message-message-form-overlay',
      component: PeMessageBuilderComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
