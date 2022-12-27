import {
  ChangeDetectionStrategy,
  Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnDestroy, Output, ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { EnvironmentConfigInterface, PE_ENV, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeChatAttachMenuItem, PeChatThumbs } from '@pe/shared/chat';

import { UploadAcceptTypes } from './upload-accept-types.constants';

@Component({
  selector: 'pe-file-upload',
  styleUrls: ['./file-upload.component.scss'],
  templateUrl: './file-upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeFileUploadComponent implements OnDestroy {
  uploadAcceptTypes = UploadAcceptTypes;
  images: SafeUrl[] = [];
  dragAreaClass: string;

  attachFields = this.formBuilder.group({
    files: [[], Validators.required],
    text: [''],
    url: [''],
    compressed: [false],
  });

  @Input() type: PeChatAttachMenuItem;
  @Input() messageAppColor: string;
  @Input() secondLevelMenuTrigger: boolean;
  @Input() addPhotoVideoWidth: string;
  @Input() set droppedFiles(files: DragEvent) {
    files && this.uploadMedia(files);
  }

  @Input() set draftMessage(value: string) {
    this.attachFields.patchValue({ text: value });
  }

  @Input() set compression(value: boolean) {
    this.attachFields.controls['compressed'].setValue(value);
  }

  @Output() draftMessageChange = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<any>();
  @Output() send = new EventEmitter<any>();

  @ViewChild('fileSelector') fileSelector: ElementRef;
  @HostListener('document:keydown.enter', ['$event'])
  onEnter($event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.sendFiles();
  };

  get isMedia() {
    return this.type === PeChatAttachMenuItem.PhotoOrVideo;
  }

  get title() {
    return this.translateService.translate(`message-app.chat.attach_menu.${this.type}`);
  }

  constructor(
    private domSanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    @Inject(PE_ENV) public env: EnvironmentConfigInterface,
  ) { }



  onDrag($event) {
    $event.preventDefault();
    this.dragAreaClass = 'droparea';
  }

  onDragLeave($event) {
    $event.preventDefault();
    this.dragAreaClass = '';
  }

  onDrop(event: any): void {
    this.dragAreaClass = '';
    event.preventDefault();
    if (event.dataTransfer.files) {
      this.uploadMedia(event);
    }
  }

  cancelPhotoVideo(): void {
    this.draftMessageChange.emit(this.attachFields.value.text);
    this.cancel.emit();
  }

  sendFiles(): void {
    const message = this.attachFields.valid ? this.attachFields.value : null;
    this.draftMessageChange.emit('');

    this.send.emit(message);
  }

  addMore() {
    this.fileSelector?.nativeElement?.click();
  }

  uploadMedia(event: Event | DragEvent) {
    const files = ((event as Event)?.target as HTMLInputElement)?.files || (event as DragEvent)?.dataTransfer?.files;
    if (files) {
      const arrFiles = Array.from(files);
      arrFiles.forEach((file) => {
        this.images.push(this.domSanitizer.bypassSecurityTrustUrl(PeChatThumbs.Files));
      });
      const arrPrevFiles = this.attachFields.controls['files'].value;
      this.attachFields.controls['files'].setValue([...arrFiles, ...arrPrevFiles]);
      this.fileSelector?.nativeElement?.value && (this.fileSelector.nativeElement.value = '');
    }
  }

  ngOnDestroy() {
    this.draftMessageChange.emit(this.attachFields.value.text);
  }
}
