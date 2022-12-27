import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { EventEmitter, Injector, Output, Directive } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import { EnvironmentConfigInterface as EnvInterface, PE_ENV } from '@pe/common';
import { BlobCreateResponse, MediaService, MediaUrlPipe, MediaContainerType } from '@pe/media';

import {
  STEP_UPLOAD_TYPES, STEP_DOWNLOAD_TYPE_TO_BUSINESS_KEY,
  StepInterface, PaymentWithVariantInterface, PaymentPayloadInterface,
} from '../../../../shared';

import { BasePaymentComponent } from './base-payment.component';

const MAX_FILE_SIZE = 5242880;
const MAX_FILE_SIZE_TEXT = '5mb';

@Directive()
export abstract class BasePaymentDocumentsComponent extends BasePaymentComponent {

  @Output() onUploadSuccess: EventEmitter<void> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  paymentPayload$: Observable<PaymentPayloadInterface> = null;

  steps: StepInterface[];

  readonly hardcodedDocuments = {
    'upload-sepa-contract-file': 'K013_HVE_Maestro_180718_dyn.pdf',
    'upload-onboarding-contract-file': 'Vereinbarung_Gemeinsame_Verantwortlichkeit_Waren_dyn_190326.pdf',
  };

  private progress: { [key: string]: BehaviorSubject<number> } = {};

  private envConfig: EnvInterface = this.injector.get(PE_ENV);
  private mediaService: MediaService = this.injector.get(MediaService);
  protected mediaUrlPipe: MediaUrlPipe = this.injector.get(MediaUrlPipe);

  constructor(
    public injector: Injector
  ) {
    super(injector);
    this.payment$.pipe(takeUntil(this.destroyed$),
    filter(d => !!d)).subscribe((payment: PaymentWithVariantInterface) => {
      if (!this.steps) {
        this.steps = payment.missing_steps.missing_steps.filter(step => STEP_UPLOAD_TYPES.indexOf(step.type) >= 0);
      } else if (payment.missing_steps.missing_steps) {
        payment.missing_steps.missing_steps.filter(step =>
          STEP_UPLOAD_TYPES.indexOf(step.type) >= 0).forEach((stepData) => {
          const existStep = this.steps.find(step => step.type === stepData.type);
          if (existStep) {
            existStep.filled = stepData.filled;
            existStep.message = stepData.message;
            existStep.url = stepData.url;
            existStep.open_dialog = stepData.open_dialog;
          }
        });
      }
      this.paymentPayload$ = this.paymentsStateService.getConnectPaymentPayload(
      this.paymentMethod).pipe(filter(d => !!d));
    });
  }

  getStepTilte(step: StepInterface): string {
    return this.translateService.translate(`categories.payments.documents.${step.type}`);
  }

  getStepDownload(step: StepInterface): string {
    let result: string = null;
    if (this.hardcodedDocuments[step.type]) {
      result = `${this.envConfig.custom.cdn}/${this.hardcodedDocuments[step.type]}`;
    }

    return result;
  }

  runStepDownload(step: StepInterface): void {
    if (this.getStepDownload(step)) {
      const win: any = window.open(this.getStepDownload(step), '_blank');
      if (win) {
        win.focus();
      }
    }
  }

  getStepUploadProgress(step: StepInterface): BehaviorSubject<number> {
    if (!this.progress[step.type]) {
      this.progress[step.type] = new BehaviorSubject<number>(-1);
    }

    return this.progress[step.type];
  }

  downloadUploaded(step: StepInterface): void {
    this.paymentPayload$.pipe(take(1)).subscribe((paymentPayload) => {
      const doc = STEP_DOWNLOAD_TYPE_TO_BUSINESS_KEY[step.type] || step.type;
      const url: string =
      this.mediaUrlPipe.transform(paymentPayload.documents.find(a => a.type === doc).blobName, 'images');
      if (url) {
        const win = window.open(url, '_blank');
        win.focus();
      } else {
        console.error('Cant find url for uploaded file', step);
      }
    });
  }

  runStepUpload(step: StepInterface, event: Event): void {

    const fileInput: HTMLInputElement = event.target as HTMLInputElement;
    const file: File = fileInput.files[0];

    if (!file.type.startsWith(`image/`) && file.type !== `application/pdf`) {
      this.snackBarService.show(this.translateService.translate('ng_kit.forms.error.image_picker.wrong_type'));

      return;
    }
    if (!this.isFileSizeValid(file)) {
      this.snackBarService.show(this.translateService.translate(
      'ng_kit.forms.error.image_picker.max_size', { size: MAX_FILE_SIZE_TEXT }));

      return;
    }

    this.getStepUploadProgress(step).next(0);
    this.mediaService.createBlobByBusiness(
      this.paymentsStateService.getBusinessUuid(), MediaContainerType.Images, file).subscribe(
      (event: HttpEvent<BlobCreateResponse>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress: {
            const uploadProgress = Number(((event.total * 100) / event.loaded).toFixed(0));
            this.getStepUploadProgress(step).next(uploadProgress);
            break;
          }

          case HttpEventType.Response: {
            if (!event.body.blobName) {
              this.showStepError(this.translateService.translate('shopsystem.cant_extract_blobname'));
              this.getStepUploadProgress(step).next(-1);
            }
            this.paymentsStateService.saveDocument(
              this.payment, this.paymentMethod,
              step.type, event.body.blobName, file.name
            ).subscribe(() => {
              this.getStepUploadProgress(step).next(100);
            }, (error) => {
              error.message = error.message || this.translateService.translate('shopsystem.cant_save_uploaded_file');
              this.handleError(error, true);
              this.getStepUploadProgress(step).next(-1);
            });
            break;
          }
          default:
            break;
        }
      },
      (error: HttpErrorResponse) => {
        this.handleError(error, true);
        this.getStepUploadProgress(step).next(-1);
      }
    );
  }

  onSubmit(): void {
    this.isLoading$.next(true);
    this.paymentsStateService.saveConnectPaymentPayload(this.paymentMethod,{ application_sent: true }).subscribe(() => {
      this.isLoading$.next(false);
      this.onUploadSuccess.emit();
    }, (error) => {
      this.isLoading$.next(false);
      this.snackBarService.show(error.message || this.translateService.translate('errors.unknown_error'));
    });
  }

  get submitDisabled(): boolean { // TODO Should be Observable based on paymentPayload$
    let paymentPayload: PaymentPayloadInterface = null;
    this.paymentPayload$.pipe(take(1)).subscribe((data) => {
      paymentPayload = data;
    });

    return (this.steps && this.steps.some(x => !x.filled)) || (paymentPayload && paymentPayload.application_sent);
  }

  private isFileSizeValid(file: File): boolean {
    return file.size <= MAX_FILE_SIZE;
  }
}
