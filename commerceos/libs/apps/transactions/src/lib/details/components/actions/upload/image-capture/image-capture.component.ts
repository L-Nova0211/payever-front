import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';

import { PebDeviceService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

export interface ImageCaptureInterface {
  fileName: string;
  fileData: string;
  extension: string;
  size: number;
}

@Component({
  selector: 'pe-image-capture',
  templateUrl: './image-capture.component.html',
  styleUrls: ['./image-capture.component.scss'],
})
export class ImageCaptureComponent {
  @Output() filePicked = new EventEmitter<File[]>();
  @Output() imageCapture = new EventEmitter<ImageCaptureInterface>();

  @ViewChild('modalContent') modalContent: TemplateRef<any>;

  forceHideDesktopTakePhoto = false;
  translationsScope = 'transactions.form.upload'

  private trigger: Subject<void> = new Subject<void>();
  private dialogRef: MatDialogRef<any> = null;

  constructor(
    private matDialog: MatDialog,
    private deviceService: PebDeviceService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(['close-16', 'retro-camera', 'photo-or-video-16']);
  }

  get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  onPickFile(event: Event): void {
    const targetElement = event.target as HTMLInputElement;
    const files: File[] = Array.from<File>(targetElement.files);
    this.filePicked.emit(files);
  }

  closeModal(): void {
    this.dialogRef?.close();
    this.dialogRef = null;
  }

  triggerSnapshot(): void {
    this.trigger.next();
  }

  handleWebcamImage(webcamImage: WebcamImage): void {
    this.imageCapture.emit({
      fileName: `snapshot-${new Date().getTime()}.jpeg`,
      fileData: webcamImage.imageAsDataUrl,
      extension: 'jpeg',
      size: this.fileSize(webcamImage.imageAsDataUrl),
    });
    this.closeModal();
  }

  handleInitError(error: WebcamInitError): void {
    if (error.mediaStreamError && error.mediaStreamError.name === 'NotAllowedError') {
      this.snackbarService.toggle(true, {
        content: this.translateService.translate(`${this.translationsScope}.errors.noCameraAccess`),
      });
      this.forceHideDesktopTakePhoto = true;
      this.closeModal();
    }
  }

  isMobile(): boolean {
    return this.deviceService.isMobile || this.deviceService.isTablet;
  }

  isDesktop(): boolean {
    return this.deviceService.isDesktop;
  }

  onTakePhotoDesktop(): void {
    this.dialogRef = this.matDialog.open(this.modalContent, {
      autoFocus: false,
      disableClose: false,
      panelClass: ['dialog-overlay-panel', 'pe-checkout-bootstrap', 'pe-capture-image-modal-panel'],
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
    });
  }

  private fileSize(dataUrl: string): number {
    const len = dataUrl.replace(/^data:image\/\w+;base64,/, '').length;

    return (len - 814) / 1.37;
  }
}
