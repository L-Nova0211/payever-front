import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { PebMediaService } from '@pe/builder-core';

@Component({
  selector: 'peb-video-form',
  templateUrl: './video.form.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './video.form.scss',
  ],
})
export class PebVideoForm {
  @Input() formGroup: FormGroup;

  @Output() fileChanged = new EventEmitter<Event>();

  @ViewChild('fileInput') fileInput: ElementRef;

  videoDuration: string;
  uploadProgress: number;
  previewError = false;

  public get isLoading() : boolean {
    return this.isLoading$.value;
  }

  isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private mediaService: PebMediaService,
    public cdr: ChangeDetectorRef,
  ) {
  }

  get videoSource(): string {
    return this.formGroup.get('source').value;
  }

  get videoPreview(): string {
    return this.formGroup.get('preview').value;
  }

  get fileName(): string {
    return this.videoSource.substring(this.videoSource.lastIndexOf('/') + 1);
  }

  onMetadata(event: Event, video: any) {
    this.videoDuration = `${Math.round(video.duration / 60)}m ${Math.round(video.duration % 60)}sec`;
  }

  clickOnFileInput(): void {
    this.fileInput?.nativeElement?.click();
  }
}
