import { HttpEventType } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Inject,
  SecurityContext,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV, PeDestroyService } from '@pe/common';
import { OverlayHeaderConfig, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { FileUploadTypes, PeMessageChat } from '@pe/shared/chat';

import { PeMessageImgTypes } from '../../../enums';
import { PeMessageApiService } from '../../../services';

@Component({
  selector: 'pe-message-edit-info',
  templateUrl: './message-edit-info.component.html',
  styleUrls: ['./message-edit-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeMessageEditInfoComponent {
  public channelInfoGroup = this.formBuilder.group({
    avatar: [],
    description: [],
    photo: [],
    title: [Validators.required],
  });

  @HostBinding('class') hostClass = this.peOverlayConfig.theme;

  constructor(
    private cdr: ChangeDetectorRef,
    private domSanitizer: DomSanitizer,
    private formBuilder: FormBuilder,

    @Inject(PE_ENV) public env: EnvironmentConfigInterface,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: PeMessageChat,
    @Inject(PE_OVERLAY_CONFIG) public peOverlayConfig: OverlayHeaderConfig,
    private readonly destroy$: PeDestroyService,

    private peMessageApiService: PeMessageApiService,
  ) {
    const { description, photo, title } = this.peOverlayData;
    const avatar =  photo ? this.getAvatar(photo) : null;
    this.channelInfoGroup.patchValue({ avatar, description, photo, title });
    this.channelInfoGroup.markAsPristine();
    this.peOverlayConfig.doneBtnCallback = () => {
      if (this.channelInfoGroup.dirty) {
        this.saveInfo();
      } else {
        this.peOverlayConfig.backBtnCallback();
      }
    };
  }

  private getAvatar(avatar: string): string {
    return this.domSanitizer
      .sanitize(SecurityContext.URL, `${this.env.custom.storage}/message/${avatar}`);
  }

  private saveInfo(): void {
    const channel = { ...this.peOverlayData, ...this.channelInfoGroup.value };
    const { _id, business, description, photo, signed, subType, title, type } = channel;
    this.peMessageApiService
      .patchConversation(_id, type, { description, photo, signed, subType, title }, business)
      .pipe(
        tap(() => {
          this.peOverlayConfig.onSaveSubject$.next(true);
        }),
        catchError((error) => {
          this.peOverlayConfig.onSaveSubject$.next(true);

          return of(error);
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public changeAvatar(files: FileList): void {
    const file = files[0];
    const imgDropTypes = [
      PeMessageImgTypes.png,
      PeMessageImgTypes.jpeg,
      PeMessageImgTypes.gif,
    ];

    if (file && imgDropTypes.includes(file.type as PeMessageImgTypes)) {
      this.peMessageApiService.postMedia(file, FileUploadTypes.Image)
        .pipe(
          tap((event) => {
            if (event.type === HttpEventType.Response) {
              this.channelInfoGroup.patchValue({
                avatar: this.getAvatar(event.body.blobName),
                photo: event.body.blobName,
              });
              this.channelInfoGroup.markAsDirty();
              this.cdr.markForCheck();
            }
          }),
          takeUntil(this.destroy$))
        .subscribe();
    }
  }

  public deleteLogo(): void {
    this.channelInfoGroup.patchValue({ photo: '', avatar: null });
    this.channelInfoGroup.markAsDirty();
    this.cdr.markForCheck();
  }
}
