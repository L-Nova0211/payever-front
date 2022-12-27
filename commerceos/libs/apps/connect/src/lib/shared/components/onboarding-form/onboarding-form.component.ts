import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injector, Output, QueryList, ViewChildren,Input, Component, Inject } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';
import { AddressInterface, ErrorBag, ErrorBagDeepData, FormAbstractComponent, FormScheme } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

// import { IntegrationsStateService, PaymentMethodEnum } from '../../../../../shared';
import { UserBusinessInterface, PaymentMethodEnum } from '../../interfaces';

import { AddressFormFieldsInterface, AddressHelperService } from './address';
import { BankFormFieldsInterface, BankHelperService } from './bank';
import { CompanyFormFieldsInterface, CompanyHelperService } from './company';
import { ContactFormFieldsInterface, ContactHelperService } from './contact';
import { TaxesFormFieldsInterface, TaxesHelperService } from './taxes';

interface FormInterface {
  companyDetails: CompanyFormFieldsInterface;
  companyAddress: AddressFormFieldsInterface;
  bankAccount: BankFormFieldsInterface;
  taxes: TaxesFormFieldsInterface;
  contactDetails: ContactFormFieldsInterface;
}

export const ACCOUNT_PROVIDERS = [
  CompanyHelperService,
  AddressHelperService,
  BankHelperService,
  TaxesHelperService,
  ContactHelperService,
];

@Component({
  selector: 'onboarding-form',
  templateUrl: './onboarding-form.component.html',
  styleUrls: ['./onboarding-form.component.scss'],
})
export class OnboardingFormComponent extends FormAbstractComponent<FormInterface> {

  @Input() isLoading: boolean;
  @Input() paymentMethod: PaymentMethodEnum;
  @Input() requiredFields: string[] = [];
  @Input() business: UserBusinessInterface;
  @Output() submitSuccess: EventEmitter<UserBusinessInterface> = new EventEmitter();
  @Output() submitFailed: EventEmitter<any> = new EventEmitter();
  @Output() ready: EventEmitter<boolean> = new EventEmitter();
/*
  abstract panels: QueryList<MatExpansionPanel>;
  abstract requiredFields: string[] = [];
  abstract sendApplicationOnSave: boolean;
*/
  @ViewChildren('panel') panels: QueryList<MatExpansionPanel>;

  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  errorBag: ErrorBag = this.injector.get(ErrorBag);
  errorsNonFlat$: Observable<ErrorBagDeepData> = this.errorBag.errors$;
  address: AddressInterface = {};
  formScheme: FormScheme;

  accountList = [
    {
      name: 'companyDetails',
      title: this.translateService.translate('user_business_form.titles.companyDetails'),
    },
    {
      name: 'companyAddress',
      title: this.translateService.translate('user_business_form.titles.companyAddress'),
    },
    {
      name: 'bankAccount',
      title: this.translateService.translate('user_business_form.titles.bankAccount'),
    },
    {
      name: 'taxes',
      title: this.translateService.translate('user_business_form.titles.taxes'),
    },
    {
      name: 'contactDetails',
      title: this.translateService.translate('user_business_form.titles.contactDetails'),
    },
  ];

  protected submitButtonText = 'actions.send';
  // private integrationsStateService: IntegrationsStateService = this.injector.get(IntegrationsStateService);

  private companyHelperService: CompanyHelperService = this.injector.get(CompanyHelperService);
  private addressHelperService: AddressHelperService = this.injector.get(AddressHelperService);
  private bankHelperService: BankHelperService = this.injector.get(BankHelperService);
  private taxesHelperService: TaxesHelperService = this.injector.get(TaxesHelperService);
  private contactHelperService: ContactHelperService = this.injector.get(ContactHelperService);

  get paymentMethodValue() {
    return this.paymentMethod;
  }

  formStorageKey = 'payment-onboarding-form-' + this.paymentMethodValue;

  constructor(injector: Injector,
              @Inject(PE_ENV) private envConfig: EnvInterface,
              private http: HttpClient,
              private translateService: TranslateService) {
    super(injector);
    // We are getting strange height/margin bug on submit when scroll allowed
    this.allowScrollToError = false;
  }

  createForm(initialData: FormInterface) {
    // Has do add timer() to avoid `ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked.`
    // It happens when we open whis page second time
    timer(0).pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.createFormDeferred(initialData);
    });
  }

  createFormDeferred(initialData: FormInterface) {
    const data = this.business;
    const companyDetails = this.companyHelperService.createForm(data.companyDetails || {}, this.requiredFields);
    const companyAddress = this.addressHelperService.createForm(data.companyAddress || {}, this.requiredFields);
    const bankAccount = this.bankHelperService.createForm(data.bankAccount || {}, this.requiredFields);
    const taxes = this.taxesHelperService.createForm(data.taxes || {}, this.requiredFields);
    const contactDetails = this.contactHelperService.createForm(data.contactDetails || {}, this.requiredFields);

    this.form = this.formBuilder.group({
      companyDetails: companyDetails.form,
      companyAddress: companyAddress.form,
      bankAccount: bankAccount.form,
      taxes: taxes.form,
      contactDetails: contactDetails.form,
    });
    this.formScheme = {
      fieldsets: {
        companyDetails: companyDetails.formSchemeFields,
        companyAddress: companyAddress.formSchemeFields,
        bankAccount: bankAccount.formSchemeFields,
        taxes: taxes.formSchemeFields,
        contactDetails: contactDetails.formSchemeFields,
      },
    };
    this.changeDetectorRef.detectChanges();
    this.ready.emit(true);
  }

  onSubmit(): void {
    this.showPanelWithError();
    super.onSubmit();
  }

  onSuccess() {
    this.isSaving$.next(true);
    this.saveUserBusinesses(this.form.value).subscribe((data) => {
      this.isSaving$.next(false);
      // this.onAdditionalInfoSaved.emit();
      this.submitSuccess.emit(this.form.value);
    }, (error) => {
      // this.handleError(error, true);
      this.submitFailed.emit(error);
      // TODO Map errors
      this.showPanelWithError();
      this.isSaving$.next(false);
    });
  }

  protected onUpdateFormData(formsValues: FormInterface) {
    this.bankHelperService.onUpdateFormData((name: string, enable: boolean) =>
    this.toggleControl(name, enable), formsValues);
    this.companyHelperService.onUpdateFormData((name: string, enable: boolean) =>
    this.toggleControl(name, enable), formsValues);
  }

  protected showPanelWithError(): void {
    setTimeout(() => {
      const panels: MatExpansionPanel[] = this.panels['_results'] || [];
      for (let i = 0; i < this.accountList.length; i++) {
        if (this.form.get(this.accountList[i].name).invalid && panels[i]) {
          panels[i].expanded = true;
          break;
        }
      }
    });
  }

  protected saveUserBusinesses(data: UserBusinessInterface): Observable<void> {
    const config = this.envConfig.backend;

    return this.http.patch<void>(`${config.users}/api/business/${this.business._id}`, data);
  }
}
