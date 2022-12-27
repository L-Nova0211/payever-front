import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { findIndex } from 'lodash-es';
import { DragulaService } from 'ng2-dragula';
import { finalize, takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { MediaService, MediaUrlPipe } from '@pe/media';
import { SnackbarService } from '@pe/snackbar';

import {
  ImagesUploaderService,
  UploadEvent,
  UploadEventTypeEnum,
  UploadProgressEvent,
  UploadResultEvent,
} from '../../../shared/services/images-uploader.service';
import { mimeTypes } from '../../interfaces';


const BUTTONS_MARGIN_SIZE = 2;
const MAX_IMAGES_COUNT = 15;
const DEFAULT_MAX_IMAGE_SIZE = 5242880; // 5mb

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'editor-images-pane',
  templateUrl: 'editor-images-pane.component.html',
  styleUrls: ['editor-images-pane.component.scss'],
  providers: [
    MediaUrlPipe,
    PeDestroyService,
  ],
})
export class EditorImagesPaneComponent implements OnInit, OnDestroy {
  @Input() set blobs(images: string[]) {
    this.pictures = images.slice();
  }

  @Input()
  dragulaBag: string;

  @Output()
  changePicture: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  loadingStateChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('pictureUploader')
  imageFileInput: ElementRef;

  @ViewChild('picturesScroll', { read: ElementRef })
  picturesScroll: ElementRef;

  @ViewChildren('imageContainer', { read: ElementRef })
  imageContainers: QueryList<ElementRef>;

  isDragging = false;
  isDraggingSort = false;
  pictures: string[] = [];
  loading = false;
  uploadProgress: number;
  displayImagesCount = 4;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dragulaService: DragulaService,
    private mediaService: MediaService,
    private snackBarService: SnackbarService,
    private translateService: TranslateService,
    private imagesUploaderService: ImagesUploaderService,
    private destroyed$: PeDestroyService
  ) {
  }

  get previewImageUrl(): string {
    return this.mediaService.getMediaUrl(this.pictures[0], 'products');
  }

  getImageURLFromBlob(picture: string) {
    return this.mediaService.getMediaUrl(picture, 'products');
  }

  ngOnInit(): void {
    this.dragulaService.createGroup(this.dragulaBag, {
      moves: (el: HTMLElement, container: HTMLElement, handle: HTMLElement) => {
        return handle.className === 'drag-handler';
      },
      removeOnSpill: true,
    });

    this.changePicture.emit(this.pictures[0]);

    this.dragulaService
      .remove(this.dragulaBag)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((group: { name: string; el: Element; container: Element; source: Element }) => {
        const blobName: string = group.el[1].dataset.image.split('/products/')[1];
        this.pictures.splice(findIndex(this.pictures, blobName), 1);
        this.updateProductPictures();
      });
  }

  ngOnDestroy(): void {
    this.dragulaService.destroy(this.dragulaBag);
  }

  onStartSortImg(): void {
    this.isDraggingSort = true;
  }

  onFileOver(isDragging: boolean): void {
    this.isDragging = isDragging;
  }

  onFileDrop(files: FileList): void {
    this.isDragging = false;
    this.addPicturesToProduct(Array.from(files));
  }

  onFileChange(evt: Event): void {
    const files: File[] = Array.from<File>((evt.target as HTMLInputElement).files);

    this.addPicturesToProduct(files && files.length ? [files[0]] : []);

    if (this.imageFileInput && this.imageFileInput.nativeElement) {
      this.imageFileInput.nativeElement.value = null;
    }
  }

  deleteImage(blobName: string): void {
    const blobIndex: number = this.pictures.indexOf(blobName);
    this.pictures.splice(blobIndex, 1);
    this.calculateImagesCount();
    this.updateProductPictures();
  }

  private addPicturesToProduct(files: File[]): void {
    const validFiles = this.getValidFiles(files);

    if (!validFiles.length) {
      return;
    }

    this.loading = true;

    this.loadingStateChanged.emit(true);

    this.imagesUploaderService
      .uploadImages(validFiles)
      .pipe(
        finalize(() => {
          this.loadingStateChanged.emit(false);
        }),
      )
      .subscribe((event: UploadEvent<UploadProgressEvent | UploadResultEvent>) => {
        switch (event.type) {
          case UploadEventTypeEnum.RESULT:
            const res: UploadResultEvent = event.data as UploadResultEvent;
            this.uploadProgress = 0;
            this.pictures = [res.lastUploadedImage.url];
            this.loading = false;
            this.updateProductPictures();
            this.calculateImagesCount();
            break;
          case UploadEventTypeEnum.PROGRESS:
            this.uploadProgress = (event.data as UploadProgressEvent).currentProgress;
            this.changeDetectorRef.detectChanges();
            break;
          default:
            break;
        }
      });
  }

  private getValidFiles(files: File[]): File[] {
    const matchRegExp = new RegExp(`^image\/(${mimeTypes})`);
    const availableImagesCount = MAX_IMAGES_COUNT - 1;
    const validFiles = [];

    for (let i = 0; i < files.length; i++) {
      if (validFiles.length === availableImagesCount) {
        this.showWarning(
          this.translateService.translate('pictures.errors.max_count', {
            maxCount: MAX_IMAGES_COUNT,
          }),
        );

        break;
      }

      const file = files[i];

      if (this.isFileSizeInvalid(file)) {
        this.showWarning(`${file.name}: ${this.translateService.translate('pictures.errors.image_size')}`);
      } else if (!file.type.match(matchRegExp)) {
        this.showWarning(`${file.name}: ${this.translateService.translate('pictures.errors.non_image_file')}`);
      } else {
        validFiles.push(file);
      }
    }

    return validFiles;
  }

  private isFileSizeInvalid(file: File): boolean {
    return file.size > DEFAULT_MAX_IMAGE_SIZE;
  }

  private showWarning(notification: string): void {
    this.snackBarService.toggle(
      true,
      {
      content: notification,
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }

  private updateProductPictures(): void {
    this.changePicture.emit(this.pictures[0]);
  }

  private calculateImagesCount() {
    if (this.imageContainers && this.imageContainers.length && this.picturesScroll) {
      const itemWidth = this.imageContainers.first.nativeElement.clientWidth;
      const containerWidth = this.picturesScroll.nativeElement.clientWidth;
      const imagesCount = Math.floor(containerWidth / itemWidth) - BUTTONS_MARGIN_SIZE;
      this.displayImagesCount = Math.max(1, imagesCount);
      this.changeDetectorRef.detectChanges();
    }
  }
}
