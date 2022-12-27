import { HttpEvent, HttpResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { filter, switchMap, take, tap } from 'rxjs/operators';

import { PeStudioMedia } from '../../core';
import { StudioApiService } from '../../core/services/studio-api.service';
import { UploadMediaService } from '../../core/services/uploadMedia.service';

@Component({
  selector: 'pe-media-details-wrap',
  templateUrl: './media-details-wrap.component.html',
  styleUrls: ['./media-details-wrap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaDetailsWrapComponent implements OnInit {
  data;
  form: FormGroup;
  panelOpenState: boolean;
  private uploadingMedia: string;
  uploaded = false;
  imagePreview: string;
  @ViewChild('imagePreview') imageElement: ElementRef;

  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public detailImageData: PeStudioMedia,
    private studioApiService: StudioApiService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private uploadMediaService: UploadMediaService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      test: [],
      test1: [],
    });
    const mediaId = this.detailImageData._id ? this.detailImageData._id : this.activatedRoute.snapshot.params.mediaId;
    this.studioApiService.getUserSubscriptionMediaById(mediaId).subscribe();
  }

  uploadMedia(event: Event): void {
    const fileInput: HTMLInputElement = event.target as HTMLInputElement;
    const files: File[] = Array.from(fileInput.files);
    files.forEach((file: File, index: number) => {
      const reader: FileReader = new FileReader();
      reader.onloadend = (onLoadEvent: ProgressEvent<FileReader>) => {
        this.uploadingMedia = onLoadEvent.target.result as string;
        this.uploadMediaService
          .postMediaBlob(file)
          .pipe(filter((e: HttpEvent<any>): e is HttpResponse<any> => e instanceof HttpResponse))
          .pipe(
            take(1),
            switchMap(response => this.uploadMediaService.createUserMedia(response, file).pipe(
              tap((image: PeStudioMedia) => {
                this.imageElement.nativeElement.style.backgroundImage = `url(${image.url})`;
              }),
            )),
          )
          .subscribe();
      };
      reader.readAsDataURL(file);
      this.uploaded = true;
    });
  }
}
