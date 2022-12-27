import { Clipboard } from '@angular/cdk/clipboard';
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { EMPTY, timer } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { OverlayHeaderConfig, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageChannelType } from '@pe/shared/chat';

import { PeMessageChatType } from '../../../enums';
import { PeMessageApiService, PeMessageChatRoomService } from '../../../services';

@Component({
  selector: 'pe-message-invite-link',
  templateUrl: './message-invite-link.component.html',
  styleUrls: ['./message-invite-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeMessageInviteLinkComponent implements OnInit, AfterViewInit {

  @ViewChild('inputLink', { static: true }) inputLinkRef: ElementRef;

  inviteLink = '';
  rootInvitationLink = `${this.env.frontend.commerceos}/message/`;
  linkTextButton = this.translateService.translate('message-app.channel.settings.copy-invite-link');
  copied = false;
  timeoutHandle;

  errors = {
    invitationCode: {
      hasError: false,
      message: this.translateService.translate('message-app.channel.form.errors.link_occupied'),
    },
  };

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private clipboard: Clipboard,

    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    @Inject(PE_OVERLAY_CONFIG) public peOverlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    private translateService: TranslateService,

    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomService: PeMessageChatRoomService,
  ) { }

  ngOnInit(): void {
    this.peOverlayConfig.doneBtnCallback = () => {
      this.peOverlayConfig.onSaveSubject$.next(true);
    };
    this.rootInvitationLink = `${this.env.frontend.commerceos}/message/invite/`;
    this.inviteLink = this.peOverlayData.slug ? `${this.rootInvitationLink}${this.peOverlayData.slug}` : '';
  }

  ngAfterViewInit(): void {
    this.inputLinkRef.nativeElement.focus();
  }

  copyLink(): void {
    if (!this.copied) {
      const link = this.inviteLink;
      this.clipboard.copy(link);
      this.linkTextButton = this.translateService.translate('message-app.channel.settings.copied-invite-link');
      this.copied = true;

      timer(500).pipe(
        tap(() => {
          this.linkTextButton = this.translateService.translate('message-app.channel.settings.copy-invite-link');
          this.copied = false;
          this.changeDetectorRef.detectChanges();
        }),
      ).subscribe();
    }
  }

  saveSlug(): void {
    if (this.inviteLink === '') {
      this.errors.invitationCode.hasError = true;
      this.errors.invitationCode.message = this.translateService.translate('message-app.channel.form.errors.not_empty');
      this.changeDetectorRef.detectChanges();
    }

    if (this.errors.invitationCode.hasError) {
      return;
    }

    const { _id, business, description, photo, title } = this.peOverlayData.channel;
    const channelInfo = { description, photo, slug: `${this.inviteLink}`, title };

    this.peMessageApiService.patchChannel(_id, channelInfo, business)
      .pipe(
        tap(() => {
          this.peOverlayConfig.onSaveSubject$.next(true);
        }))
      .subscribe();
  }

  keyUpSlugTyping(event): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }

    this.timeoutHandle = setTimeout(() => {
      if (event !== '') {
        this.checkSlug(this.inviteLink);
      }

      this.changeDetectorRef.detectChanges();
    }, 500);
  }

  checkSlug(slug): void {
    this.peMessageApiService.getPublicChannelsBySlug(slug).pipe(
      tap(() => {
        this.errors.invitationCode.hasError = true;
        this.errors.invitationCode.message = this.translateService
          .translate('message-app.channel.form.errors.link_occupied');
        this.changeDetectorRef.detectChanges();
      }),
      catchError((err) => {
        this.errors.invitationCode.hasError = false;
        this.changeDetectorRef.detectChanges();

        return EMPTY;
      }),
    ).subscribe();
  }

  resetError(field): void {
    this.errors[field].hasError = false;
  }

  isPrivate(): boolean {
    return this.peOverlayData.channel.subType === PeMessageChannelType.Private;
  }

  isGroup(): boolean {
    return this.peOverlayData.channel.type === PeMessageChatType.Group;
  }
}
