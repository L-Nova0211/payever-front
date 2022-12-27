import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { isEmpty } from 'lodash-es';
import { EMPTY, forkJoin, iif, merge, of, Subject } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebEditorApi, PebEditorWs } from '@pe/builder-api';
import { pebCreateEmptyShop, PebEditorState } from '@pe/builder-core';
import { EditorSidebarTypes, PebEditorStore } from '@pe/builder-services';
import { PebViewerPreviewDialog } from '@pe/builder-viewer';
import { ChatFormFieldAction } from '@pe/chat';
import { MessageBus } from '@pe/common';
import { ConfirmActionDialogComponent } from '@pe/confirm-action-dialog';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { PeChatAttachMenuItem, PeChatChannelMenuItem, PeChatMessage } from '@pe/shared/chat';

import { MessageBusEvents } from '../../../enums';
import { PeMessageSchedule } from '../../../enums/message-schedule.enum';
import { PeMessageIntegrationService } from '../../../services';
import { PeMessageApiService } from '../../../services/message-api.service';
import { CosMessageBus } from '../../../services/message-bus.service';
import { PeMessageService } from '../../../services/message.service';
import { MessageState } from '../../../state/message.state';
import { PeMessageThemeComponent } from '../message-theme-overlay/message-theme-overlay.component';

import { PeMailConfig } from './interfaces/mail-builder.interface';
import { PeMailBuilderService } from './mail-builder.service';
import { PeMessageScheduleComponent } from './message-schedule/message-schedule.component';


@Component({
  selector: 'pe-message-builder',
  templateUrl: 'message-builder.component.html',
  styleUrls: ['message-builder.component.scss'],
})
export class PeMessageBuilderComponent implements OnInit, OnDestroy {

  @SelectSnapshot(MessageState.mailConfig) mailConfigState: PeMailConfig;

  @ViewChild('attachFile', { static: true }) attachFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('attachImage', { static: true }) attachImageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('chatFooter', { static: true }) chatFooter!: ElementRef<HTMLElement>;
  @ViewChild('attachMenu') attachMenu!: TemplateRef<any>;

  attachMenuOverlayRef!: OverlayRef;

  activeChannel!: PeChatChannelMenuItem;
  attachMenuItems = [
    PeChatAttachMenuItem.Product,
  ];

  channelMenuItems!: PeChatChannelMenuItem[];
  messageAppColor = '#1c1d1e';
  accentColor = this.peMessageIntegrationService.currSettings.settings?.accentColor || '';

  previousHeaderConfig!: PePlatformHeaderConfig;

  sender = this.peOverlayConfig.sender;
  theme = this.peOverlayConfig.theme;

  onCloseSubject$ = this.peOverlayConfig.onCloseSubject$;
  destroy$ = new Subject<void>();

  defaultSidebarActivity = {
    [EditorSidebarTypes.Navigator]: false,
    [EditorSidebarTypes.Inspector]: true,
    [EditorSidebarTypes.Layers]: false,
  };

  previousSidebarActivity!: { [key: string]: boolean };

  isDetail!: boolean;
  isOptionList!: boolean;
  detail: { back: string; title: string; } | null = null;
  optionList: { back: string; title: string } | null = null;
  tabs = [
    { title: 'Format', active: false },
    { title: 'Animate', active: false },
    { title: 'Page', active: true },
  ];

  formFieldActions: ChatFormFieldAction[] = [
    {
      title: 'Preview',
      onClick: () => {
        this.dialog.open(PebViewerPreviewDialog, {
          position: {
            top: '0',
            left: '0',
          },
          height: '100vh',
          maxWidth: '100vw',
          width: '100vw',
          panelClass: 'themes-preview-dialog',
          data: {
            themeSnapshot: { snapshot: this.editorStore.snapshot, pages: [this.editorStore.page] },
          },
        });
      },
    },
    {
      title: 'Themes',
      iconId: 'icon-apps-theme',
      iconSize: 16,
      iconColor: '#acacac',
      onClick: () => {
        const config: MatDialogConfig = {
          height: '82.3vh',
          maxWidth: '78.77vw',
          width: '78.77vw',
          data: {
            theme: this.theme,
          },
          hasBackdrop: true,
          panelClass: 'message-theme-overlay',
        };

        this.matDialog.open(PeMessageThemeComponent, config);
      },
    },
    {
      title: 'Save Draft',
      onClick: () => {
        const data = this.editorStore.page;
        data.stylesheets = { desktop: data.stylesheets?.desktop || {} };
        const message: PeChatMessage = {
          attachments: this.form.get('attachments')?.value || [],
          content: JSON.stringify(data),
          sentAt: new Date(),
        };

        this.messageBus.emit(MessageBusEvents.SaveDraft, message);
      },
    },
    {
      title: 'Attach',
      onClick: () => {
        this.attachMenuOverlayRef = this.overlay.create({
          positionStrategy: this.overlay
            .position()
            .flexibleConnectedTo(this.chatFooter)
            .withDefaultOffsetY(0)
            .withPositions([
              {
                originX: 'end',
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

        this.attachMenuOverlayRef.backdropClick().subscribe(() => this.attachMenuOverlayRef.dispose());
        this.attachMenuOverlayRef.attach(new TemplatePortal(this.attachMenu, this.viewContainerRef));
      },
    },
    {
      title: 'Schedule',
      onClick: () => {
        const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
          panelClass: 'message-confirm-dialog',
          hasBackdrop: true,
          backdropClass: 'confirm-dialog-backdrop',
          data: {
            title: 'Schedule Message',
            confirmButtonTitle: 'Schedule',
            confirmButtonColor: '#2482e7',
            cancelButtonTitle: 'Cancel',
            theme: this.theme,
            payeverIcon: true,
            showComponent: true,
            component: PeMessageScheduleComponent,
          },
        });

        dialogRef.afterClosed().pipe(
          tap((schedule: { date: string, time: string }) => {
            if (schedule?.date && schedule.time) {
              const scheduleDate = new Date(`${schedule.date} ${schedule.time}`);
              this.form.get('schedule')?.setValue({ date: scheduleDate, type: PeMessageSchedule.OnDate });
            }
          }),
        ).subscribe();
      },

    },
  ];

  data$ = new Subject<any>();
  isContactsLoaded!: boolean;
  fileAttachments: File[] = [];
  imageAttachments: File[] = [];
  recipients: string[] = [];
  subject: string | null = null;
  userList: any;
  form = this.formBuilder.group({
    mailConfig: new FormGroup({
      recipients: new FormControl(),
      subject: new FormControl(),
      sender: new FormControl(),
      testMailRecipient: new FormControl(),
    }),
    schedule: [{ type: PeMessageSchedule.Now }],
    channel: new FormControl(),
    attachments: [],
  });

  constructor(
    @Optional() private platformHeaderService: PePlatformHeaderService,
    private translateService: TranslateService,
    private peMessageService: PeMessageService,
    private peMessageIntegrationService: PeMessageIntegrationService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private matDialog: MatDialog,
    @Optional() @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    @Optional() @Inject(PE_OVERLAY_CONFIG) public peOverlayConfig: any,
    private editorState: PebEditorState,
    private editorApi: PebEditorApi,
    private editorStore: PebEditorStore,
    @Inject(MessageBus) private messageBus: CosMessageBus<MessageBusEvents>,
    private peMailBuilderService: PeMailBuilderService,
    private peMessageApiService: PeMessageApiService,
    public route: ActivatedRoute,
    private router: Router,
    private messageApi: PeMessageApiService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private apmService: ApmService,
    private editorWs: PebEditorWs,
  ) { }

  ngOnInit(): void {
    this.peMessageService.userList$.pipe(
      filter(userList => !!userList?.length),
      tap((userList) => {
        this.userList = userList?.filter((user => !!user.userAccount && !isEmpty(user.userAccount)));
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    // Stop editor from navigating routes
    this.router.events.pipe(
      tap((event) => {
        if (event instanceof NavigationStart && event.url === '/') {
          this.peMailBuilderService.blockRouteNavigation$.next(true);
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.getReplyMailConfig();

    this.messageBus.listen(MessageBusEvents.ToolbarChange).pipe(
      tap((mailConfig: PeMailConfig) => {
        this.form.get('mailConfig')?.setValue(mailConfig);
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.messageBus.listen(MessageBusEvents.SendTestMail).pipe(
      tap((mailConfig: PeMailConfig) => {
        this.messageBus.emit(MessageBusEvents.SendMail, { mail: this.form.value, isTestMail: true });
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    merge(
      this.messageBus.listen(MessageBusEvents.ThemeInstalled),
      this.messageBus.listen(MessageBusEvents.ThemeOpen).pipe(map(({ themeId }) => themeId)),
    ).pipe(
      switchMap((themeId: string) => {
        if (themeId) {
          return forkJoin({
            theme: this.editorApi.getShopThemeById(themeId),
            snapshot: this.editorApi.getThemeDetail(themeId),
          });
        }

        return this.editorApi.getShopActiveTheme().pipe(
          switchMap(theme =>
            forkJoin({
              theme: this.editorApi.getShopThemeById(theme.theme),
              snapshot: this.editorApi.getThemeDetail(theme.theme),
            })
          ),
        );
      }),
      tap((data) => {
        this.data$.next(data);
        this.matDialog.closeAll();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.editorState.sidebarsActivity$.pipe(
      filter(activity => activity?.navigator),
      tap(() => this.initSidebars()),
      takeUntil(this.destroy$),
    ).subscribe();

    this.getContacts();
    this.createHeader();
    this.initEditor();
  }

  initSidebars(): void {
    this.previousSidebarActivity = { ...this.editorState.sidebarsActivity } ?? this.defaultSidebarActivity;

    this.editorState.sidebarsActivity = {
      [EditorSidebarTypes.Navigator]: false,
      [EditorSidebarTypes.Inspector]: true,
      [EditorSidebarTypes.Layers]: false,
    };
  }


  getReplyMailConfig(): void {
    this.peMailBuilderService.replyConfig$.pipe(
      tap((channel) => {
        this.form.get('channel')?.setValue(channel);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  initEditor(): void {
    merge(
      this.peMailBuilderService.forwardConfig$.pipe(
        filter(config => !!config),
        switchMap((config) => {
          const content = pebCreateEmptyShop();
          const { context, stylesheets, template } = config?.mailTheme;
          content.pages[0] = {
            ...content.pages[0],
            context,
            template,
            stylesheets,
          };

          return this.editorApi.createTheme({
            name: config?.subject,
            content,
          });
        }),
      ),
      this.editorApi.getShopThemesList().pipe(
        switchMap((themes) => {
          return iif(
            () => !themes || !themes.length,
            this.editorApi.createTheme({ name: 'Blank Theme', content: pebCreateEmptyShop() }),
            // this.editorApi.getShopActiveTheme(),
            of(themes[0]),
          );
        }),
        catchError(err => {
          this.apmService.apm.captureError(err);

          return EMPTY;
        }),
      ),
    ).pipe(
      switchMap((theme) => {
        const themeId = theme.theme?.id ?? theme.theme;

        return forkJoin({
          theme: this.editorApi.getShopThemeById(themeId),
          snapshot: this.editorApi.getThemeDetail(themeId),
        });
      }),
      tap((data) => {
        this.data$.next(data);
        this.editorWs.preInstallFinish(data.snapshot.pages[0].id);

        setTimeout(() => {
          this.messageBus.emit(MessageBusEvents.ToolbarReply, {
            ...this.mailConfigState,
          });
          this.messageBus.emit(MessageBusEvents.ToolbarSetUsers, this.userList);
        }, 0);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  createHeader(): void {
    this.previousHeaderConfig = this.platformHeaderService.config;

    const headerConfig: PePlatformHeaderConfig = {
      mainItem: {
        title: 'New Message',
        class: 'message-header-title',
      },
      isShowMainItem: true,
      rightSectionItems: [
        {
          title: this.translateService.translate('Cancel'),
          class: 'message-close-button',
          onClick: () => {

            const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
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
                if (this.mailConfigState.recipients) {
                  this.router.navigateByUrl(this.router.url.replace('/message/editor', '')).then(() => {
                    this.peOverlayWidgetService.close();
                  });
                } else {
                  this.router.navigateByUrl(this.router.url.replace('/message/editor', '/message')).then(() => {
                    this.peOverlayWidgetService.close();
                  });
                }
              }),
              takeUntil(this.destroy$),
            ).subscribe();

          },
        },
      ],
    };

    this.platformHeaderService.setConfig(headerConfig);
  }

  getContacts(): void {
    this.messageApi.getContactList().pipe(
      tap((contactsList) => {
        this.messageBus.emit(MessageBusEvents.ContactsSet, contactsList);
        this.isContactsLoaded = true;
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  sendMessage(event: any): void {
    this.messageBus.emit(MessageBusEvents.SendMail, { mail: this.form.value, isTestMail: false });
  }

  // TODO: Add event handling for attachMenuItem
  // attachMenuItem(event): void {
  //   console.log('attachMenuItem', event);
  // }

  onChannelChange(channel: string): void {
    const dialog = channel === 'sms' ? 'chat' : channel;
    this.messageBus.emit(MessageBusEvents.OpenDialog, { dialog, mailConfig: this.form.get('mailConfig')?.value });
  }

  ngOnDestroy(): void {
    this.platformHeaderService.setConfig(this.previousHeaderConfig);
    this.destroy$.next();
    this.destroy$.complete();
    this.peMailBuilderService.resetToolbar();

    this.editorState.sidebarsActivity = this.previousSidebarActivity ?? this.defaultSidebarActivity;
  }

  onCloseMenu(menuRef: TemplateRef<any>): void {
    this.attachMenuOverlayRef.dispose();
  }

  onAttachFile(): void {
    this.attachFileInput.nativeElement.click();
    this.attachMenuOverlayRef.dispose();
  }

  onFileChange(event: any): void {
    const files = event.target.files as FileList;

    Object.values(files).forEach((file: File) => {
      this.fileAttachments.push(file);
    });

    if (this.attachFileInput && this.attachFileInput.nativeElement) {
      this.attachFileInput.nativeElement.value = '';
      this.form.get('attachments')?.setValue([...this.fileAttachments, ...this.imageAttachments]);
    }
  }

  onAttachImage(): void {
    this.attachImageInput.nativeElement.click();
    this.attachMenuOverlayRef.dispose();
  }

  onImageChange(event: any): void {
    const files = event.target.files as FileList;

    Object.values(files).forEach((file: File) => {
      this.imageAttachments.push(file);
    });

    if (this.attachImageInput && this.attachImageInput.nativeElement) {
      this.attachImageInput.nativeElement.value = '';
      this.form.get('attachments')?.setValue([...this.fileAttachments, ...this.imageAttachments]);
    }
  }

}
