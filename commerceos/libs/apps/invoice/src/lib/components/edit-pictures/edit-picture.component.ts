import { HttpEventType } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { finalize } from 'rxjs/operators';

import { UploadMediaService } from '../../services/uploadMedia.service';

@Component({
  selector: 'pe-edit-picture',
  templateUrl: './edit-picture.component.html',
  styleUrls: ['./edit-picture.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class EditPictureComponent {

  @Input() set blob(image: string) {
    this.picture = image;
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
  }

  @Input() dragulaBag: string;
  @Input() businessId: string;
  @Output()
  changePictures: EventEmitter<any> = new EventEmitter<any>();

  @Output() loadingStateChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('pictureUploader')
  imageFileInput: ElementRef;

  @ViewChild('picturesScroll', { read: ElementRef })
  picturesScroll: ElementRef;

  @ViewChildren('imageContainer', { read: ElementRef })
  imageContainers: QueryList<ElementRef>;

  isDragging = false;
  isDraggingSort = false;
  picture: string = null;
  type: string = null;
  loading = false;

  uploadProgress: number;
  imagesStartIndex = 0;
  displayImagesCount = 4;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private uploaderService: UploadMediaService,
  ) {
  }

  private updatePictures(): void {
    this.changePictures.emit({ image: this.picture, type: this.type });
  }

  onFileOver(isDragging: boolean): void {
    this.isDragging = isDragging;
  }

  onFileDrop(files: FileList): void {
    this.isDragging = false;
    this.addPictures(Array.from(files));
  }

  onFileChange(evt: Event): void {
    this.addPictures(Array.from<File>((evt.target as HTMLInputElement).files));

    if (this.imageFileInput && this.imageFileInput.nativeElement) {
      this.imageFileInput.nativeElement.value = null;
    }
  }

  private addPictures(files: File[]): void {
    this.loading = true;

    this.loadingStateChanged.emit(true);
    this.uploaderService.postMediaBlob(files[0], this.businessId).pipe(
      finalize(() => {
        this.loadingStateChanged.emit(false);
      }),
    )
      .subscribe((event) => {
        switch (event.type) {
          case HttpEventType.Response:
            const res = event.body as any;
            const type = files[0] && files[0].type.split('/')[0] === 'image' ? 'image' : 'video';

            this.uploadProgress = 0;
            const img = res.blobName;
            this.picture = img;
            this.type = type;
            this.loading = false;
            this.changeDetectorRef.detectChanges();
            this.updatePictures();
            break;
          case HttpEventType.UploadProgress:
            this.uploadProgress = event.loaded;
            this.changeDetectorRef.detectChanges();
            break;
          default:
            break;
        }
      });
  }
}
