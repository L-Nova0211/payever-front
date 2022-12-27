import {
  Component, ChangeDetectionStrategy, HostBinding, Inject,
  ViewEncapsulation, OnInit, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit,
} from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageChannelType, PeMessageChatSteep } from '@pe/shared/chat';

import { PeMessageChatType } from '../../../enums';
import { PeMessageCreatingChatData } from '../../../interfaces';

@Component({
  selector: 'pe-creating-chat-form',
  templateUrl: './creating-chat-form.component.html',
  styleUrls: ['./creating-chat-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeCreatingChatFormComponent implements OnInit, AfterViewInit {
  @HostBinding('class.pe-creating-chat-form') peMessageChatForm = true;
  @HostBinding('class') hostClass = this.peOverlayData.theme;

  @ViewChild('formContent', { static: true }) formContentRef: ElementRef;

  stepIndex = 0;
  loadingStyle = false;

  nextButton = this.translateService.translate('message-app.chat.overlay.next');
  code: '';
  invitationId: '';
  title: string;
  channelPublic = PeMessageChannelType.Public;
  step: PeMessageChatSteep;
  next = PeMessageChatSteep.Main;
  optionsItemWidth;

  animationTypeStepDoneTrigger = false;
  messageChatType = PeMessageChatType.Chat;

  constructor(
    private translateService: TranslateService,
    private destroyed$: PeDestroyService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: PeMessageCreatingChatData,
  ) {
    this.messageChatType = this.peOverlayData.type;
    this.setNextButtonText(null);
  }

  ngOnInit() {
    this.peOverlayData.isLoading$.pipe(
      tap(loading => {
        this.loadingStyle = loading;
        this.setNextButtonText(loading);
        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  ngAfterViewInit() {
    this.optionsItemWidth = this.formContentRef.nativeElement.scrollWidth - 2;
    this.changeDetectorRef.detectChanges();
  }

  changeStep(step: PeMessageChatSteep) {
    this.step = step;
    this.changeDetectorRef.detectChanges();
  }

  setNextButtonText(loading: boolean | null, suffix = 'create'): void {
    !loading && (this.title = this.translateService.translate(`message-app.${suffix === 'done'
      ? 'channel.settings.add-members' : `message-integration.new-${this.messageChatType}`}`));
    this.nextButton = this.translateService.translate(loading
      ? 'loading'
      : `message-app.sidebar.${suffix}`);
  }

  typeChat(data): void {
    this.stepIndex = this.stepIndex + 1;
    this.next = PeMessageChatSteep.Contacts;
    this.setNextButtonText(null, 'done');
    this.code = data.chatInvites?.code;
    this.invitationId = data.chatInvites?._id;
    this.changeDetectorRef.detectChanges();
  }

  cancel(): void {
    this.peOverlayData.onCloseSubject$.next(true);
  }

  nextStep(): void {
    this.step = this.next;
    if (this.step === PeMessageChatSteep.Main || this.step === PeMessageChatSteep.Contacts) {
      this.peOverlayData.isLoading$.next(true);
      this.changeDetectorRef.detectChanges();
    } else {
      this.peOverlayData.onCloseSubject$.next(true);
    }
  }

  animationDone() {
    if (this.step === PeMessageChatSteep.Main) {
      this.animationTypeStepDoneTrigger = true;
      this.changeDetectorRef.detectChanges();
    }
  }
}
