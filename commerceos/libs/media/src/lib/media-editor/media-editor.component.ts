import { HttpEventType } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, defer, forkJoin, of } from 'rxjs';
import { catchError, delay, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';

import { PeMediaFileTypeEnum } from '../enums';
import { PeMediaInterface } from '../interfaces';
import { ICONS, MAXIMUM_FILE_SIZE, ONE_HUNDRED_PERCENTS } from '../media.constants';
import { PeMediaService } from '../services';
import { PE_MEDIA_CONTAINER } from '../tokens';

@Component({
  selector: 'pe-media-editor',
  templateUrl: './media-editor.component.html',
  styleUrls: ['./media-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeMediaEditorComponent {
  @Input() isFolderEditor = false;
  @Input() incorrectMedia: number[] = [];
  @Input() businessId: string;
  @Input() set blobs(media: PeMediaInterface[]) {
    this.media = media;
    this.counterVideoFiles = 0;
    this.counterImageFiles = 0;
    this.media.forEach((file) => {
      this.countMedia(file.mediaMimeType, false);
    });
  }

  @Input() postLoading = false;
  @Input() theme: AppThemeEnum = AppThemeEnum.default;

  @Output() changeMedia: EventEmitter<PeMediaInterface[]> = new EventEmitter<PeMediaInterface[]>();
  @Output() warning: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('videoPlayer') videoPlayer: ElementRef;

  public isDragging = false;
  public loading = false;
  public showProgress = false;
  public media: PeMediaInterface[] = [];
  public showIndex$ = new BehaviorSubject<number>(1);

  private counterVideoFiles = 0;
  private counterImageFiles = 0;
  public currentUploadingFile = 0;
  public totalUploadFiles = 0;
  public uploadProgress = 0;

  constructor(
    // Angular
    private changeDetectorRef: ChangeDetectorRef,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    // Pe services
    @Inject(PE_MEDIA_CONTAINER) private peMediaContainer: string,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
    // Social services
    private peMediaService: PeMediaService,
  ) {
    this.initIcons();
  }

  private initIcons(): void {
    Object.entries(ICONS).forEach(([icon, path]) => {
      const url = this.domSanitizer.bypassSecurityTrustResourceUrl(path);
      this.matIconRegistry.addSvgIcon(icon, url);
    });
  }

  public checkIncorrect(index: number): boolean {
    return this.incorrectMedia.some(i => i === index);
  }

  public onFileOver(isDragging: boolean): void {
    this.isDragging = isDragging;
  }

  public onFileDrop(files: FileList): void {
    this.isDragging = false;
    this.addMedia(Array.from(files));
  }

  public onFileChange(evt: Event): void {
    this.addMedia(Array.from<File>((evt.target as HTMLInputElement).files));
  }

  private countMedia(type: PeMediaFileTypeEnum, subtract: boolean): void {
    type === PeMediaFileTypeEnum.Image
      ? this.counterImageFiles += subtract ? -1 : +1
      : this.counterVideoFiles += subtract ? -1 : +1;
  }

  private async addMedia(files: File[]): Promise<void> {
    this.loading = true;
    this.totalUploadFiles = files.length;
    this.currentUploadingFile = 0;

    for (const file of files) {
      this.currentUploadingFile++;
      const fileSize = file.size;
      const validFileSize = fileSize < MAXIMUM_FILE_SIZE;
      
      const mimeType = file.type.split('/')[0];
      const isFileImage = mimeType === PeMediaFileTypeEnum.Image;
      const isFileVideo = mimeType === PeMediaFileTypeEnum.Video;
      const fileType = isFileImage
        ? PeMediaFileTypeEnum.Image
        : isFileVideo
          ? PeMediaFileTypeEnum.Video
          : null;

      const numberOfFiles = this.counterVideoFiles !== 0 || (this.counterImageFiles !== 0 && isFileVideo)
        ? false
        : true;

      const denyVideoForFolder = isFileVideo && this.isFolderEditor;
      if (validFileSize && fileType && numberOfFiles && !denyVideoForFolder) {
        this.countMedia(fileType, false);
        await this.uploadMediaFile(file, fileType, fileSize);
      } else {
        let notify = '';
        if (denyVideoForFolder) {
          notify = this.translateService.translate('media.notify.only_image_allowed'); }
        else if (!validFileSize) {
          notify = this.translateService.translate('media.notify.file_size_part_1')
          + `${file.name}`
          + this.translateService.translate('media.notify.file_size_part_2')
          + ` ${Math.round(fileSize / (1000 * 1000) * 10) / 10}`
          + this.translateService.translate('media.notify.file_size_part_3'); }
        else if (!fileType || denyVideoForFolder) {
          notify = this.translateService.translate('media.notify.invalid_file_type'); }
        else if (this.counterVideoFiles > 0 && isFileVideo) {
          notify = this.translateService.translate('media.notify.one_video_per_post'); }
        else if (this.counterVideoFiles > 0 && isFileImage
          || this.counterImageFiles > 0 && isFileVideo) {
          notify = this.translateService.translate('media.notify.defferent_types'); }
        this.warning.emit(notify);
      }
    }
    this.loading = false;
    this.changeDetectorRef.detectChanges();
  }

  private uploadMediaFile(
    file: File,
    fileType: PeMediaFileTypeEnum,
    fileSize: number,
  ) {
    this.showProgress = true;
    this.uploadProgress = 0;

    return new Promise((resolve) => {
      const uploadFile$ = this.peMediaService
        .postMediaBlob(file, fileType, this.businessId, this.peMediaContainer)
        .pipe(
          map((event) => {
            switch (event.type) {
              case HttpEventType.Response:
                const file = event.body as any;

                return file.blobName as string;
              case HttpEventType.UploadProgress:
                this.uploadProgress = Math.floor(event.loaded / fileSize * ONE_HUNDRED_PERCENTS) - 1;
                break;
            }
            this.changeDetectorRef.detectChanges();
          }));

      of(this.postLoading)
        .pipe(
          switchMap((postLoading) => {
            return forkJoin([
              !postLoading
                ? uploadFile$
                : of(file.name),
            ]);
          }),
          switchMap(([fileName]) => {
            return defer(async () => {
              const localUrl = this.domSanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
              const mediaUrl = this.peMediaService.getMediaUrl(fileName, this.peMediaContainer);
              
              return await this.peMediaService.getMediaMetadata(file, fileType)
                .then((metadata): PeMediaInterface => ({
                  file: file,
                  localUrl: localUrl,
                  mediaUrl: mediaUrl,
                  mediaMimeType: fileType,
                  metadata: metadata,
                }));
            });
          }),
          delay(500),
          tap((media) => {
            this.media = this.isFolderEditor ? [media] : [...this.media, media];
            this.showSelectedFile(this.media.length - 1);
            this.changeMedia.emit(this.media);
          }),
          catchError((error) => {
            this.warning.emit(error.message);
            this.countMedia(fileType, true);

            return of(error);
          }),
          finalize(() => {
            this.showProgress = false;
            resolve(true);
            this.destroy$.next();
          }),
          takeUntil(this.destroy$))
        .subscribe();
    });
  }

  public removeFromMedia(index: number): void {
    const type = this.media[index].mediaMimeType;
    this.media.splice(index, 1);
    this.countMedia(type, true);
    if (this.showIndex$.value - 1 === this.media.length) { this.showSelectedFile(this.media.length - 1); }
    this.changeMedia.emit(this.media);
  }

  public showSelectedFile(index: number): void {
    if (index >= 0) {
      this.showIndex$.next(index + 1);
      this.changeDetectorRef.detectChanges();
    }
  }
}
