import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { takeUntil, take, tap, finalize, debounceTime, skip } from 'rxjs/operators';

import {
  FormAbstractComponent,
  ErrorBag,
  PeValidators,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { CheckoutFormInterface, CheckoutInterface } from '../../../interfaces';
import { EnvService, StorageService, UploaderService } from '../../../services';
import { TimestampEvent } from '../../timestamp-event';

@Component({
  selector: 'old-checkout-create-form',
  templateUrl: './create-checkout-form.component.html',
  styleUrls: ['./create-checkout-form.component.scss'],
  providers: [ErrorBag],
})
export class OldCreateCheckoutFormComponent extends FormAbstractComponent<CheckoutFormInterface> implements OnInit {

  @Input() createMode: boolean;
  @Input() isModal: boolean;

  @Input('submit') set setSubmit(event: TimestampEvent) {
    if (event) {
      this.onSubmit();
      if (!this.form.valid) {
        timer(200).pipe(takeUntil(this.destroyed$)).subscribe(() => {
          this.onLoading.emit(false); // To reset loading in stepper
        });
      }
    }
  }

  @Output() onSaved: EventEmitter<CheckoutInterface> = new EventEmitter();
  @Output() onLoading: EventEmitter<boolean> = new EventEmitter();
  @Output() onValid: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('logo') logoEl: ElementRef;
  @ViewChild('logoWrapper') logoWrapperEl: ElementRef;

  currentCheckout$: Observable<CheckoutInterface> = this.stService.getCheckoutById(this.checkoutUuid).pipe(
    takeUntil(this.destroyed$),
    tap((checkout: CheckoutInterface) => this.currentCheckout = checkout)
  );

  formChanges: Subject<any> = new Subject();

  private readonly isPictureLoadingSubject = new BehaviorSubject(false);
  readonly isPictureLoading$ = this.isPictureLoadingSubject.asObservable();

  isLargeThenParent = false;
  uploadProgress = 0;

  currentCheckout: CheckoutInterface;
  businessUuid: FormControl = new FormControl();
  submitting: boolean;
  formStorageKey = 'checkout.new_checkout';

  inputLabel = this.translateService.translate('create_checkout.name.placeholder');

  private readonly nameMaxLength: number = 40;

  constructor(
    injector: Injector,
    private activatedRoute: ActivatedRoute,
    private envService: EnvService,
    private stService: StorageService,
    private router: Router,
    protected formBuilder: FormBuilder,
    protected uploaderService: UploaderService,
    private translateService: TranslateService) {
    super(injector);
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid']
    || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  ngOnInit() {
    this.formChanges.asObservable()
      .pipe(
        takeUntil(this.destroyed$),
        debounceTime(500),
        skip(1)
      )
      .subscribe(() => {
        if (!this.createMode) {
          this.onSubmit();
        }
      });
  }

  get formScheme(): any {
    return {};
  }

  onLogoUpload($event: any) {
    const files = $event.target.files as FileList;
    if (files.length > 0) {
      this.isLargeThenParent = false;
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      this.fileInput.nativeElement.value = '';

      reader.onload = () => {
        this.isPictureLoadingSubject.next(true);
        this.uploaderService.uploadImageWithProgress('images', file, false).pipe(
          finalize(() => this.isPictureLoadingSubject.next(false)),
          takeUntil(this.destroyed$),
          tap((event) => {
            switch (event.type) {
              case HttpEventType.UploadProgress: {
                this.uploadProgress = event.loaded;
                break;
              }
              case HttpEventType.Response: {
                this.form.get('logo').patchValue(event?.body?.blobName || reader.result as string);
                this.uploadProgress = 0;
                break;
              }
              default:
                break;
            }
          }),
        ).subscribe();
      };
    }
  }

  onLoad() {
    const logo: HTMLImageElement = this.logoEl.nativeElement;
    const logoWrapper: HTMLImageElement = this.logoWrapperEl.nativeElement;
    this.isLargeThenParent = logo.width >= logoWrapper.clientWidth || logo.height >= logoWrapper.clientHeight;
  }

  protected onUpdateFormData(formsValues) {
    this.formChanges.next();
    this.onValid.emit(this.form.valid);
  }

  protected onSuccess() {
    if (this.submitting) {
      this.onLoading.emit(false);

      return;
    }
    this.submitting = true;
    this.onLoading.emit(true);

    const createCheckout: CheckoutInterface = {
      name: this.form.controls['name'].value,
      logo: this.form.controls['logo'].value || null,
      _id: null,
    };
    if (!this.createMode) {
      this.stService.saveCheckout(this.checkoutUuid, createCheckout)
        .subscribe(
          (checkout) => {
            this.onSaved.emit(checkout);
            this.onLoading.emit(false);
            this.submitting = false;
          },
          (err: HttpErrorResponse) => {
            this.handleHttpError(err);
            this.submitting = false;
            this.onLoading.emit(false);
          }
        );
    } else {
      delete createCheckout._id;
      this.stService.addNewCheckout(createCheckout as CheckoutInterface).subscribe((newCheckout: CheckoutInterface) => {
          this.onSaved.emit(newCheckout);
          this.onLoading.emit(false);
          this.submitting = false;
        },
        (error: HttpErrorResponse) => {
          this.handleHttpError(error);
          this.submitting = false;
          this.onLoading.emit(false);
        });
    }

  }

  protected createForm(initialData: CheckoutFormInterface): void {
    setTimeout(() => {
      this.createFormDeffered(initialData);
    });
  }

  protected createFormDeffered(initialData: CheckoutFormInterface): void {
    let checkout: CheckoutInterface;
    if (!this.createMode) {
      this.currentCheckout$.pipe(take(1)).subscribe((currentCheckout: CheckoutInterface) => checkout = currentCheckout);
    }

    this.form = this.formBuilder.group({
      logo: { ...checkout }.logo,
      name: [{ ...checkout }.name, [PeValidators.notEmptyStringValidator(), Validators.maxLength(this.nameMaxLength)]],
    });

    this.changeDetectorRef.detectChanges();
  }

  private handleHttpError(error: HttpErrorResponse): void {
    if (error.status === 409) {
      this.form.get('name')
        .setErrors({ external: this.translateService.translate('create_checkout.checkoutNameExist') });
    }
    if (error.status === 403) {
      this.stService.showError(error.message);
    }
  }

}
