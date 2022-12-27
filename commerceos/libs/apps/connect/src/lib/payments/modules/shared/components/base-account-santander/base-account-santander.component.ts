import { EventEmitter, Output, Directive, ChangeDetectorRef } from '@angular/core';
/*
import { MatExpansionPanel } from '@angular/material/expansion';

import { AddressInterface, FormScheme } from '@pe/forms';
import { Observable } from 'rxjs';*/

import { IntegrationsStateService, UserBusinessInterface } from '../../../../../shared';
import { BasePaymentComponent } from '../base-payment.component';
/*
import { BasePaymentFormComponent } from '../base-payment-form.component';
import { CompanyFormFieldsInterface, CompanyHelperService } from './company';
import { AddressFormFieldsInterface, AddressHelperService } from './address';
import { BankFormFieldsInterface, BankHelperService} from './bank';
import { TaxesFormFieldsInterface, TaxesHelperService } from './taxes';
import { ContactFormFieldsInterface, ContactHelperService } from './contact';

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
  ContactHelperService
];*/

@Directive()
export abstract class BaseAccountSantanderComponent extends BasePaymentComponent {
// export abstract class BaseAccountSantanderComponent extends BasePaymentFormComponent<FormInterface> {

  abstract requiredFields: string[];
  abstract sendApplicationOnSave: boolean;

  @Output() onAdditionalInfoSaved: EventEmitter<void> = new EventEmitter();

  business: UserBusinessInterface = null;
  isReady = false;
  isLoading = false;

  private integrationsStateService: IntegrationsStateService = this.injector.get(IntegrationsStateService);
  private cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);

  ngOnInit() {
    this.integrationsStateService.getUserBusinessesOnce().subscribe((business) => {
      this.business = business;
      this.cdr.detectChanges();
    });
  }

  onSubmitSuccess(data: UserBusinessInterface): void {}

  onSubmitFailed(error: any): void {
    this.handleError(error, true);
  }

  onReady(isReady: boolean): void {
    this.isReady = isReady;
  }

  /*
  abstract panels: QueryList<MatExpansionPanel>;
  abstract requiredFields: string[] = [];
  abstract sendApplicationOnSave: boolean;

  protected submitButtonText: string = 'actions.send';
  address: AddressInterface = {};
  formScheme: FormScheme;

  accountList = [
    {
      name: 'companyDetails',
      title: this.translateService.translate('user_business_form.titles.companyDetails')
    },
    {
      name: 'companyAddress',
      title: this.translateService.translate('user_business_form.titles.companyAddress')
    },
    {
      name: 'bankAccount',
      title: this.translateService.translate('user_business_form.titles.bankAccount')
    },
    {
      name: 'taxes',
      title: this.translateService.translate('user_business_form.titles.taxes')
    },
    {
      name: 'contactDetails',
      title: this.translateService.translate('user_business_form.titles.contactDetails')
    }
  ];

  private integrationsStateService: IntegrationsStateService = this.injector.get(IntegrationsStateService);

  private companyHelperService: CompanyHelperService = this.injector.get(CompanyHelperService);
  private addressHelperService: AddressHelperService = this.injector.get(AddressHelperService);
  private bankHelperService: BankHelperService = this.injector.get(BankHelperService);
  private taxesHelperService: TaxesHelperService = this.injector.get(TaxesHelperService);
  private contactHelperService: ContactHelperService = this.injector.get(ContactHelperService);

  constructor(injector: Injector) {
    super(injector);
    // We are getting strange height/margin bug on submit when scroll allowed
    this.allowScrollToError = false;
  }

  get formStorageKey(): string {
    return 'payment-account-form-' + this.paymentMethod; // TODO Make more unique for business
  }

  createFormDeferred(initialData: FormInterface) {
    this.integrationsStateService.getUserBusinessesOnce().subscribe(data => {
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
        contactDetails: contactDetails.form
      });
      this.formScheme = {
        fieldsets: {
          companyDetails: companyDetails.formSchemeFields,
          companyAddress: companyAddress.formSchemeFields,
          bankAccount: bankAccount.formSchemeFields,
          taxes: taxes.formSchemeFields,
          contactDetails: contactDetails.formSchemeFields
        }
      };
      this.changeDetectorRef.detectChanges();
    });
  }

  onSubmit(): void {
    this.showPanelWithError();
    super.onSubmit();
  }

  onSuccess() {
    this.isLoading$.next(true);
    this.paymentsStateService.saveUserBusinesses(this.paymentMethod, this.form.value, this.sendApplicationOnSave).subscribe(data => {
      this.isLoading$.next(false);
      this.onAdditionalInfoSaved.emit();
    }, error => {
      this.handleError(error, true);
      // TODO Map errors
      this.showPanelWithError();
      this.isLoading$.next(false);
    });
  }

  protected onUpdateFormData(formsValues: FormInterface) {
    this.bankHelperService.onUpdateFormData((name: string, enable: boolean) => this.toggleControl(name, enable), formsValues);
    this.companyHelperService.onUpdateFormData((name: string, enable: boolean) => this.toggleControl(name, enable), formsValues);
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
  }*/
}
