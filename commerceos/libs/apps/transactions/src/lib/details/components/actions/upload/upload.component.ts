import { Component, ChangeDetectionStrategy, OnInit, Injector, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { compressAccurately } from 'image-conversion';
import { forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, PeDestroyService, PE_ENV } from '@pe/common';

import { AbstractAction, ActionTypeEnum } from '../../../../shared';

import { ImageCaptureInterface } from './image-capture/image-capture.component';

enum DocumentType {
  EARNING_SHEET = 'EARNING_SHEET',
  IDENTIFICATION = 'IDENTIFICATION',
  FREELANCER_SHEET = 'FREELANCER_SHEET',
  OTHERS = 'OTHERS'
}

const PREVIEW_EXTENSIONS = ['jpg', 'jpeg', 'png'];
const MAX_FILE_SIZE_MB = 5;
const MAX_TOTAL_FILE_SIZE_MB = 25;
const UPLOAD_FILE_SIZE_MB = 1;

@Component({
  selector: 'pe-upload-action',
  styleUrls: ['./upload.component.scss', '../actions.scss'],
  templateUrl: 'upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class ActionUploadComponent extends AbstractAction implements OnInit {
  isDragging = false;
  form: FormGroup;

  documentTypes: {
    value: string;
    label: string;
  }[] = [];

  errorMessage = '';

  translationsScope = 'transactions.form.upload';
  isSubmitted = false;

  constructor(
    public injector: Injector,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    @Inject(PE_ENV) public env: EnvironmentConfigInterface
  ) {
    super(injector);
    this.matIconRegistry.addSvgIcon(
      `remove-icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons-transactions/remove.svg`),
    );

    this.matIconRegistry.addSvgIcon(
      `files-placeholder`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons/files-placeholder.svg`),
    );

    this.matIconRegistry.addSvgIcon(
      `image-placeholder`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons-transactions/image-placeholder.svg`),
    );
  }

  get documentsControl(): FormArray {
    return (this.form.controls.documents as FormArray);
  }

  ngOnInit(): void {
    this.getData();
    this.prepareTypeOptions();
  }

  onSubmit(): void {
    this.isSubmitted = true;
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      return;
    }

    this.errorMessage = '';

    this.sendActionOrder(this.orderId, this.documentsControl.controls, ActionTypeEnum.Upload, 'documents');
  }

  isPreview(extension: string): boolean {
    return PREVIEW_EXTENSIONS.includes(extension);
  }

  createForm(): void {
    this.form = new FormGroup({
      documents: new FormArray([], Validators.required),
    });
  }

  onFileOver(isDragging: boolean): void {
    this.isDragging = isDragging;
  }

  onFileDrop(files: FileList): void {
    this.isDragging = false;
    this.checkFileSize([files.item(0)]);
  }

  onFileChange(files: File[]): void {
    this.checkFileSize(files);
  }

  onImageCapture(imageCapture: ImageCaptureInterface) {
    const { fileName, fileData, extension, size } = imageCapture;
    this.addControl(fileName, fileData, extension, size);
  }

  onDeleteFile(index: number): void {
    this.documentsControl.removeAt(index);
  }

  getFileExtension(fileName: string): string {
    return fileName.split('.').pop();
  }

  sanitizeData(data: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(data);
  }

  private checkFileSize(files: File[]) {
    this.errorMessage = '';

    files.forEach(file => {
      const tooBig = file && file.size > MAX_FILE_SIZE_MB * 1024 * 1024;
      if (tooBig) {
        this.errorMessage = this.translateService.translate(
          `${this.translationsScope}.errors.tooBigFile`, { fileName: file.name, fileSize: MAX_FILE_SIZE_MB }
        );

        return;
      } else {
        const totalSize = this.documentsControl.value.reduce((acc, item) => acc + item.size, 0)
        if (totalSize + file.size > MAX_TOTAL_FILE_SIZE_MB * 1024 * 1024) {
          this.errorMessage = this.translateService.translate(
            `${this.translationsScope}.errors.tooBigFiles`, { fileSize: MAX_TOTAL_FILE_SIZE_MB }
          );

          return;
        }

        this.addFiles([file]);
      }
    })
  }

  private prepareTypeOptions(): void {
    this.documentTypes = Object.values(DocumentType).map(item => ({
      value: item,
      label: this.translateService.translate(`${this.translationsScope}.labels.${item}`),
    }))
  }

  private sendActionOrder(orderId: string, controls: AbstractControl[], action: ActionTypeEnum, dataKey: string): void {
    if (controls.length) {
      const requests = [];
      this.isLoading$.next(true);

      controls.forEach((control: FormGroup) => {
        const { file, documentType, filename } = control.value;
        const data: any = [{ documentType, filename, file: file.split(';base64,')[1] }];
        requests.push(
          this.detailService.actionOrder(orderId, data, action, dataKey, false).pipe(
            tap(() => {
              control.get('_hasError').setValue(false);
            }),
            catchError(err => {
              control.get('_hasError').setValue(true);

              return of(err);
            })
          )
        );
      });

      forkJoin(requests).subscribe(
        () => {
          if (this.documentsControl.value.some((item: any) => item._hasError)) {
            this.showError(this.translateService.translate('transactions.action-errors.upload'))
          } else {
            this.close();
            this.getData(true);
            this.refreshList();
          }
          this.isLoading$.next(false);
          this.cdr.detectChanges();
        }
      );
    }
  }

  private addFiles(files: File[]): void {
    files.filter(file => [...PREVIEW_EXTENSIONS, 'pdf'].includes(this.getFileExtension(file.name))).map(file => {
      let resizeK: number = (UPLOAD_FILE_SIZE_MB * 1024 * 1024) / file.size;
      if (resizeK < 1.0 && this.getFileExtension(file.name) !== 'pdf') {
        // We don't have src image resolution so have to use very simple and not accurate solution
        compressAccurately(file, { size: 0.9 * UPLOAD_FILE_SIZE_MB * 1024, scale: resizeK }).then(blob => {
          this.addFileAsBase64(new File([blob], file.name));
        });
      } else {
        this.addFileAsBase64(file);
      }
    });
  }

  private addControl(fileName: string, fileData: string, extension: string, size: number): void {
    this.documentsControl.push(new FormGroup({
      documentType: new FormControl('', Validators.required),
      filename: new FormControl(fileName),
      file: new FormControl(fileData),
      size: new FormControl(size),
      extension: new FormControl(extension),
      _hasError: new FormControl(false),
    }));

    this.isSubmitted = false;
    this.cdr.detectChanges();
  }

  private addFileAsBase64(file: File): void {
    this.getBase64(file).then((fileBase64: string) => {
      this.addControl(file.name, fileBase64, this.getFileExtension(file.name), file.size);
    });
  }

  private getBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader: FileReader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = error => {
        reject(error);
      };
    });
  }
}
