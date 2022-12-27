import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { FormAbstractComponent, FormScheme, FormSchemeField, PeValidators } from '@pe/forms';
import { SnackbarService } from '@pe/snackbar';
import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { CheckoutInterface, CheckoutSettingsInterface } from '../../../interfaces';
import { StorageService } from '../../../services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'pm-edit-name',
  templateUrl: 'edit-settings.component.html',
  styleUrls: ['./edit-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class EditSettingsComponent extends FormAbstractComponent<CheckoutInterface> implements OnInit {

  title: string;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  checkoutUuid = this.overlayData.checkoutUuid;
  phoneNumbersSettings: string[] = [];

  editMode: string;
  isModal: boolean = this.overlayData.isModal;
  onSave$ = this.overlayData.onSave$.pipe(takeUntil(this.destroyed$));
  onClose$ = this.overlayData.onClose$.pipe(takeUntil(this.destroyed$));
  fieldset: FormSchemeField[];
  formStorageKey = 'checkout.edit';

  constructor(
    injector: Injector,
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    public storageServiceLocal: StorageService,
    public translateService: TranslateService,
    protected snackBarService: SnackbarService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.onSave$.pipe(filter(val => !!val))
      .subscribe(() => {
        if (this.fieldset) {
          this.onSubmit();
          this.overlayData.close();
        }
      }, (err) => {
        this.snackBarService.toggle(true, { content: 'Not possible to save settings' }); // TODO Translations
      });

    this.onClose$.subscribe(() => {
      if (this.fieldset) {
        this.overlayData.close();
      }
    });

    this.storageServiceLocal.phoneNumbers$.
      pipe(takeUntil(this.destroyed$))
      .subscribe((numbers) => {
        this.phoneNumbersSettings = numbers;
      });
    if (this.overlayData.editType === 'phone') {
      this.editMode = 'phoneNumber';
      this.title = this.translateService.translate('info_boxes.edit.phoneNumber.label');
    }
    if (this.overlayData.editType === 'message') {
      this.editMode = 'message';
      this.title = this.translateService.translate('info_boxes.edit.message.label');
    }
    this.fieldset = [
      {
        name: 'phoneNumber',
        type: 'select',
        fieldSettings: {
          required: true,
          classList: 'col-xs-12',
        },
      },
      {
        name: 'message',
        type: 'input',
        fieldSettings: {
          required: true,
          classList: 'col-xs-12',
        },
      },
    ];
  }

  close(): void {
    if (this.isModal) {
      this.backToModal();
    } else {
      this.router.navigate(['../../panel-settings'], { relativeTo: this.activatedRoute });
    }
  }

  selectFieldValue(value: string, field: string) {
    this.form.controls[field].patchValue(value);
  }

  protected createForm(initialData: CheckoutInterface): void {
    let fields: any = {};

    this.storageServiceLocal.getCheckoutByIdOnce(this.checkoutUuid).subscribe((checkoutData) => {
      const settings: CheckoutSettingsInterface = checkoutData.settings || {} as CheckoutSettingsInterface;
      switch (this.editMode) {
        case 'phoneNumber':
          fields = {
            phoneNumber: [settings.phoneNumber || '', PeValidators.notEmptyStringValidator()],
          };
          break;
        case 'message':
          fields = {
            message: [settings.message || '', PeValidators.notEmptyStringValidator()],
          };
          break;
        default:
          break;
      }

      this.form = this.formBuilder.group(fields);

      // TODO somewhy cannot set error via error bag therefor this code used
      this.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((val) => {
        const field: string = this.editMode;
        if (!this.form.get(field).value) {
          this.form.get(field).setErrors({ external: this.translateService.translate('errors.cannotBeEmpty') });
        }
      });

      this.changeDetectorRef.detectChanges();
    });
  }

  get formScheme(): FormScheme {
    return {
      fieldsets: {
        myfieldset: this.fieldset,
      },
    };
  }

  protected onSuccess(): void {
    this.isLoading$.next(true);
    this.storageServiceLocal.getCheckoutByIdOnce(this.checkoutUuid).subscribe((currentCheckout) => {
      const newSettings: CheckoutSettingsInterface = Object.assign(
      {}, currentCheckout.settings, this.form.getRawValue());
      this.storageServiceLocal.saveCheckoutSettings(currentCheckout._id, newSettings)
        .subscribe(() => {
            this.storageServiceLocal.emitUpdateCheckoutSubject();
        },
        (error) => {
          if (error.status === 400) {
            const formField = this.form.get('phoneNumber');
            formField.setErrors({ external: this.translateService.translate(
            'errors.phoneExists', { phoneNumber: formField.value }) });
            this.isLoading$.next(false);
          } else {
            this.storageServiceLocal.showError(error.message);
          }
        });
    });
  }

  protected onUpdateFormData(formValues: {}): void {
  }

  private backToModal(): void {
    // TODO pass payments,settings as param somehow
    this.router.navigate(['../../panel-settings'], { relativeTo: this.activatedRoute });
  }
}
