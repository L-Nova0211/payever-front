import { HttpEventType } from '@angular/common/http';
import {
  Component, ChangeDetectionStrategy, HostBinding, Inject, ChangeDetectorRef,
  SecurityContext, Input, Output, EventEmitter, SimpleChanges, OnChanges,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { EMPTY } from 'rxjs';
import { tap, takeUntil, catchError } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV, PeDestroyService } from '@pe/common';
import { PeGridSidenavService } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { FileUploadTypes, PeMessageChannelType, PeMessageChatSteep } from '@pe/shared/chat';

import { ChatFacadeClass } from '../../../../classes';
import { PeMessageChatType, PeMessageImgTypes, PeMessageSidenavsEnum } from '../../../../enums';
import { PeMessageCreatingChatData, PeMessageTypeChannel } from '../../../../interfaces';
import { PeMessageApiService } from '../../../../services';


@Component({
  selector: 'pe-creating-chat-steps-main',
  templateUrl: './creating-chat-steps-main.component.html',
  styleUrls: ['./creating-chat-steps-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeCreatingChatStepsMainComponent implements OnChanges {
  @HostBinding('class') hostClass = this.peOverlayData.theme;

  @Input() step: PeMessageChatSteep;
  @Input() chatClass: ChatFacadeClass;
  @Input() chatType = PeMessageChatType.Channel;

  @Output() goBack = new EventEmitter<void>();
  @Output() chatInfo = new EventEmitter<PeMessageTypeChannel>();

  imgDropTypes = [
    PeMessageImgTypes.png,
    PeMessageImgTypes.jpeg,
    PeMessageImgTypes.gif,
    PeMessageImgTypes.svg,
  ];

  mainInfoGroup = this.formBuilder.group({
    title: [null, Validators.required],
    description: [],
    photo: [],
  });

  avatar: SafeUrl | null = null;

  errors = {
    title: {
      hasError: false,
      errorMessage: '',
    },
  };

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private peMessageApiService: PeMessageApiService,
    private domSanitizer: DomSanitizer,
    private translateService: TranslateService,
    private destroyed$: PeDestroyService,
    private peGridSidenavService: PeGridSidenavService,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: PeMessageCreatingChatData,
    @Inject(PE_ENV) private environmentConfigInterface: EnvironmentConfigInterface,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.step?.previousValue !== PeMessageChatSteep.Contacts
        && changes.step?.currentValue === PeMessageChatSteep.Main
    ) {
      if (this.mainInfoGroup.valid) {
        this.chatClass.mainInfo({
          ...this.mainInfoGroup.value,
        });
        this.createChat();
      } else {
        this.checkErrors('title');
        this.goBack.emit();
        this.peOverlayData.isLoading$.next(false);
      }
    }
  }

  changeAvatar(files: FileList): void {
    const file = files[0];

    if (file && this.imgDropTypes.includes(file.type as PeMessageImgTypes)) {
      this.peMessageApiService.postMedia(file, FileUploadTypes.Image).pipe(
        tap(event => {
          if (event.type === HttpEventType.Response) {
            this.avatar = this.domSanitizer.sanitize(
              SecurityContext.URL,
              `${this.environmentConfigInterface.custom.storage}/message/${event.body.blobName}`
            );
            this.mainInfoGroup.patchValue({
              photo: event.body.blobName,
            });

            this.changeDetectorRef.detectChanges();
          }
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    }
  }
  
  deleteAvatar() {
    this.mainInfoGroup.controls['photo'].patchValue('');
    this.avatar = '';
  }

  getNameLabel() {
    return this.translateService.translate(`message-app.${this.chatType}.form.name`);
  }

  checkErrors(field) {
    const form = this.mainInfoGroup.get(field);
    if (form.invalid) {
      this.errors[field].hasError = true;
      if (form.errors.required) {
        this.errors[field].errorMessage = this.translateService.translate('forms.error.validator.required');
      }

      this.changeDetectorRef.detectChanges();
    }
  }

  resetErrors(field) {
    this.errors[field].hasError = false;
  }

  createChat(): void {
    this.chatClass.createByRole(PeMessageChannelType.Public)
      .next(this.peOverlayData, this.chatInfo)
      .pipe(
        tap(() => {
          window.innerWidth <= 720
          && this.peGridSidenavService.sidenavOpenStatus[PeMessageSidenavsEnum.ConversationList].next(false);
        }),
        catchError(() => {
          this.peOverlayData.onCloseSubject$.next(true);

          return EMPTY;
        }),
        takeUntil(this.destroyed$))
      .subscribe();
  }
}
