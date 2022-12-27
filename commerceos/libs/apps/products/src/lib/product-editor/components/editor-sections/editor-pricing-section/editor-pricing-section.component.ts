import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Inject,
  Injector,
  Input,
  OnInit,
} from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BehaviorSubject, forkJoin, merge, of, Subject } from 'rxjs';
import { debounceTime, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeAlertDialogService } from '@pe/alert-dialog';
import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';
import { ErrorBag, FormAbstractComponent, FormScheme } from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { MediaUrlPipe } from '@pe/media';

import {
  PeProductCustomerFieldInterface,
  PeProductCustomerGroupInterface,
  PeProductCustomerInterface, PeProductCustomersInterface,
  PeProductOptionInterface,
} from '../../../../collection-editor';
import {
  PeProductArrayNamesEnum, PeProductTypeCustomerEligibilityEnum,
} from '../../../../products-list/enums/customer.enum';
import { ProductEditorSections } from '../../../../shared/enums/product.enum';
import { PricingSection } from '../../../../shared/interfaces/section.interface';
import { ProductsApiService } from '../../../../shared/services/api.service';
import { CurrencyService } from '../../../../shared/services/currency.service';
import { SectionsService } from '../../../services';
import { ContactsDialogService } from '../../../services/contacts-dialog.service';
import { LanguageService } from '../../../services/language.service';
import { greaterPriceThanSalePriceValidator } from '../editor-main-section/editor-main-section.component';

function priceEqualMainPriceInAllValidator(mainPrice) {
  return (form: FormGroup) => {
    const price = form.get('price').value;
    const customerEligibility = form.get('customerEligibility').value;
  
    return  customerEligibility ==  PeProductTypeCustomerEligibilityEnum.Everyone && 
      price != mainPrice ? { priceAndMainPriceNotEqual: true } : null;
  };
}

@Component({
  selector: 'pricing-section',
  templateUrl: 'editor-pricing-section.component.html',
  styleUrls: ['editor-pricing-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})

export class ProductsPricingSectionComponent
  extends FormAbstractComponent<PricingSection>
  implements OnInit, AfterViewInit
{
  readonly section: ProductEditorSections = ProductEditorSections.Content

  @Input() theme: string;

  public customerEligibility = this.sectionsService.customerEligibility;

  public customers: PeProductOptionInterface[] = [];
  public filterResultCustomer$ = new BehaviorSubject<PeProductOptionInterface[]>([])
  public onFilterCustomers$ = new Subject<string>()
  public customersIgnoreId:{id,formIndex}[]  = [];
  public customersGroupsIgnoreId:{id,formIndex}[]  = [];
  public groupsOfCustomers: PeProductOptionInterface[] = [];
  public filterResultGroupsOfCustomers$ = new BehaviorSubject<PeProductOptionInterface[]>([]);
  public onFilterGroupOfCustomers$ = new Subject<string>()
  public arrayNames = PeProductArrayNamesEnum;
  public customersSource: PeProductCustomerInterface[] = [];
  public groupsOfCustomersSource: PeProductCustomerGroupInterface[] = [];

  defaultProductImg = `${this.env.custom.cdn}/icons/app-icon-products.svg`;

  currency: string;
  isSubmitted = false;

  pricingSection: PricingSection[] = this.sectionsService.pricingSection;
  formScheme: FormScheme;
  formTranslationsScope = 'pricingSection.form';
  blobs: string[] = [];
  contacts:any;
  formIndex = 0;
  contactsData = [];
  editPrice = null;

  description: string;

  protected formStorageKey = 'pricingSection.form';

  constructor(
    injector: Injector,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    protected errorBag: ErrorBag,
    private sectionsService: SectionsService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private store: Store,
    private mediaUrlPipe: MediaUrlPipe,
    private activatedRoute: ActivatedRoute,
    private contactDialogService: ContactsDialogService,
    private currencyService: CurrencyService,
    private productApiService: ProductsApiService,
    private envService: EnvService,
    public sanitizer: DomSanitizer,
    private alertService:PeAlertDialogService,
    private translateService:TranslateService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.currency = this.currencyService.currency;

    merge(
      this.sectionsService.contacts$.pipe(
        filter(pricing => !!pricing && this.sectionsService.isEdit),
        tap((pricing) => {
          this.editPrice = pricing;
        }), 
        take(2) , 
        switchMap(() => forkJoin([this.getContactsByIds() , this.getGroupsByIds()]) ),
        tap(()=>{
          if (this.editPrice && this.form) {
            this.editPrice.forEach((price) => {
              this.addPrice(price);
            })
            this.changeDetectorRef.detectChanges();
          }
        })
      ),
      this.sectionsService.saveClicked$.pipe(
        tap(() => this.doSubmit())
      ),
      this.languageService.updatedLanguage$.pipe(
        tap(() => {
          const pricing = this.sectionsService.pricingSection;
          this.pricing.clear();

          pricing.forEach((price) => {
            this.addPrice(price);
          });

          this.changeDetectorRef.detectChanges();
        })
      ),
      this.onFilterCustomers$.pipe(
        debounceTime(500),
        map(res => this.filterCustomers(res))
      ),
      this.onFilterGroupOfCustomers$.pipe(
        debounceTime(500),
        map(res => this.filterGroupsOfCustomer(res))
      ),
    ).pipe(
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  private getContactsByIds(){

    let pricing:any[] = this.editPrice;

    if(!pricing  || pricing.length == 0){
      return of([]);
    }

    let custumerIds = (pricing.map(p => p?.customerEligibilitySpecificCustomers?.map( customer => customer.id)) as any)
      .flat()
      .filter(contactId => !!contactId)

    return this.sectionsService.getCustomerByIds(custumerIds).pipe(
      tap((res) =>{
        this.customersSource = this.getCustomersSource(res);
        this.customers = this.getCustomers(res);
      })
    )
  }


  private getGroupsByIds(){

    let pricing:any[] = this.editPrice;

    if(!pricing  || pricing.length == 0){
      return of([]);
    }

    let groupsIs = (pricing.map(p => p?.customerEligibilityCustomerGroups?.map( group => group.id)) as any)
      .flat()
      .filter(groupId => !!groupId)

    return this.sectionsService.getGroupsCustomerByIds(groupsIs).pipe(
      tap((res) =>{
        this.groupsOfCustomersSource = this.getGroupsOfCustomersSource(res);
        this.groupsOfCustomers = res;
      })
    )
  }

  protected createForm(initialData): void {

    this.form = this.formBuilder.group({
      pricing: this.formBuilder.array([]),
    });

    this.changeDetectorRef.detectChanges();
  }

  public addPrice(price?): void {
    this.isSubmitted = false;
    price = price || {
      customerEligibility: null,
      customerEligibilityCustomerGroups: [],
      customerEligibilitySpecificCustomers: [],
      price: '',
      salePrice: '',
    };

    this.pricing.push(
      this.formBuilder.group({
        customerEligibility: [price.customerEligibility],
        customerEligibilityCustomerGroups: [this.getGroupsObj(price.customerEligibilityCustomerGroups)],
        customerEligibilitySpecificCustomers: [this.getCustomersObj(price.customerEligibilitySpecificCustomers)],
        price: [price.price, Validators.required],
        salePrice: [price.salePrice],
      },{ validators: [
        greaterPriceThanSalePriceValidator,
        priceEqualMainPriceInAllValidator(this.sectionsService.mainSection.price),
      ] }),
    );

    if(!this.customersIgnoreId)
      {this.customersIgnoreId = [];}

    if(!this.customersGroupsIgnoreId){
      this.customersGroupsIgnoreId = []
    }

    price.customerEligibilityCustomerGroups?.forEach(customerGroup => 
          this.customersGroupsIgnoreId.push({ id:customerGroup.id, formIndex:this.pricing.length -1 }));

    price.customerEligibilitySpecificCustomers?.forEach(customer => 
        this.customersIgnoreId.push({ id:customer.id, formIndex:this.pricing.length -1 }))
  }

  getGroupsObj(groups) {
    return groups?.length > 0
      ? groups.map(group => this.groupsOfCustomersSource?.find(source => source.id === group.id))
      : groups;
  }

  getCustomersObj(customer) {
    return customer?.length > 0
      ? customer.map(group => this.customersSource?.find(source => source.id === group.id))
      : customer;
  }

  get pricing(): FormArray {
    return this.form.get('pricing') as FormArray;
  }

  protected onUpdateFormData(formValues): void {
    this.sectionsService.onChangePricingSection(formValues.pricing);
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }

  public filterCustomers(value:string){
    this.sectionsService.filterContacts(value).pipe(
      map((res) => {

        const customerSource = this.getCustomersSource(res);
        customerSource.forEach((newItem) =>{
          if(!this.customersSource.some(customer => customer.id == newItem.id)){
              this.customersSource.push(newItem)
          }
        })

        let customers = this.getCustomers(res)
        customers.forEach((newItem) => {
          if(!this.customers.some(customer => customer.value == newItem.id )){
              this.customers.push(newItem)
          }
        })

        this.filterResultCustomer$.next(customers);
      })
    ).subscribe();
}

public filterGroupsOfCustomer(value:string){
   this.sectionsService.filterGroups(value).pipe(
    map((filterResult) => {
      const groupSource =  this.getGroupsOfCustomersSource(filterResult);
      groupSource.forEach((newItem) =>{
        if(!this.groupsOfCustomersSource.some(group => group.id == newItem.id)){
          this.groupsOfCustomersSource.push(newItem)
        }
      })

      filterResult.forEach((newItem) =>{
        if(!this.groupsOfCustomers.some(group => group.id == newItem.id)){
          this.groupsOfCustomers.push(newItem)
        }
      })
      this.filterResultGroupsOfCustomers$.next(filterResult)
    })
  ).subscribe()
}

  removeGroup(index) {
    const grp  = (this.pricing.at(index) as FormGroup)?.getRawValue();
    const deletedGroups = grp?.customerEligibilityCustomerGroups?.map(group => group.id); 
    const deletedCustumers :any[] = grp?.customerEligibilitySpecificCustomers?.map(customer => customer.id); 
    this.customersIgnoreId = this.customersIgnoreId
      .filter(customerIgnoreItem => deletedCustumers?.indexOf(customerIgnoreItem.id) < 0);
    this.customersGroupsIgnoreId = this.customersGroupsIgnoreId
      .filter(groupIgnoreItem => deletedGroups?.indexOf(groupIgnoreItem.id) < 0);

    this.pricing.removeAt(index);
  }

  addNewGroup() {
    this.isSubmitted = false;
    const box = this.pricing as FormArray;
    box.push(
      this.formBuilder.group({
        price: ['', Validators.required],
        salePrice: [''],
        customerEligibility: [],
        customerEligibilityCustomerGroups: [[]],
        customerEligibilitySpecificCustomers: [[]],
        group: [],
      }, { validators: greaterPriceThanSalePriceValidator }),
    );
  }

  onPriceChange(value: number, formControlName: string, i: number): void {
    if (value < 0) {
      this.pricing[i].get(formControlName).patchValue(0);
    }
  }

  setIndex(i) {
    this.formIndex = i;
  }

  public onClickCustomerEligibility(formIndex){
      const group = this.pricing.controls[formIndex];
      group.get('customerEligibilityCustomerGroups').updateValueAndValidity();
      group.get('customerEligibilitySpecificCustomers').updateValueAndValidity();
  }

  public addToArray(element: any, array: any, formIndex: number, arrayName?: string): void {
    const elementId = element?.id ?? element?._id;

    if (arrayName === PeProductArrayNamesEnum.GroupsOfCustomers) {
      element = this.groupsOfCustomersSource?.find(el => el.id === elementId);
    }

    if (arrayName === PeProductArrayNamesEnum.Customers) {
      element = this.customersSource?.find(el => el.id === elementId);
    }

    if (!array.some(element => (element?.id === elementId || element?._id === elementId)) 
      && this.checkIgnoreArray(arrayName as any,elementId)) {
      array.push(element);
    }
    
    const mainControls = this.pricing.controls[formIndex];

    switch (arrayName) {
      case PeProductArrayNamesEnum.GroupsOfCustomers:
        if (!this.customersGroupsIgnoreId?.find(groupIgnored => groupIgnored.id === elementId)) {
          this.customersGroupsIgnoreId.push({ id:elementId,formIndex });
          mainControls.get('customerEligibilityCustomerGroups').updateValueAndValidity();
        }
        //display error when choose duplicate in differnt form or group price
        else if(this.customersGroupsIgnoreId?.
            find(groupIgnored => groupIgnored.id === elementId).formIndex !== formIndex){ 
          (mainControls as FormGroup).get('customerEligibilityCustomerGroups')
            .setErrors({ duplicate:true })
        }
        break;
      case PeProductArrayNamesEnum.Customers:
        if (!this.customersIgnoreId?.find(customerIgnore => customerIgnore.id === elementId)) {
          this.customersIgnoreId.push({ id:elementId,formIndex });
          mainControls.get('customerEligibilitySpecificCustomers').updateValueAndValidity();
        }
        //display error when choose duplicate in differnt form or group price
        else if(this.customersIgnoreId?.
            find(customerIgnore => customerIgnore.id === elementId).formIndex !== formIndex){ 
          mainControls.get('customerEligibilitySpecificCustomers')
          .setErrors({ duplicate:true })
        }
        
        break;
    }

    this.cdr.markForCheck();
  }

  checkIgnoreArray(arrayName:PeProductArrayNamesEnum , id) {
    if(arrayName  == PeProductArrayNamesEnum.Customers){
      return !this.customersIgnoreId?.find(customer => customer.id === id);
    }
    else if(arrayName == PeProductArrayNamesEnum.GroupsOfCustomers){
      return !this.customersGroupsIgnoreId?.find(group => group.id === id)
    }
    else{
        return false;
    }
    
  }

  public getFromArray(array: Array<{  _id?: string; id?: string; [key: string]: any }>, id: string) {
    return array?.find(element => element.id === id || element._id === id);
  }

  public trackItem(index: number, item: any) {
    return item?.id || item?._id;
  }

  public removeFromArray(
    array: PeProductCustomerInterface[]
      | PeProductCustomerGroupInterface[],
    index: number,
    formIndex: number,
    arrayName?: string
  ): void {
    const elementId = array[index].id || array[index]['_id'];
    array.splice(index, 1);

    const mainControls = this.pricing.controls[formIndex];

    switch (arrayName) {
      case PeProductArrayNamesEnum.GroupsOfCustomers:
        this.customersGroupsIgnoreId
          .splice(this.customersGroupsIgnoreId.findIndex(groupIgnore => groupIgnore.id === elementId), 1);
        mainControls.get('customerEligibilityCustomerGroups').updateValueAndValidity();
        break;
      case PeProductArrayNamesEnum.Customers:
        this.customersIgnoreId
          .splice(this.customersIgnoreId.findIndex(customerIgnore => customerIgnore.id === elementId), 1);
        mainControls.get('customerEligibilitySpecificCustomers').updateValueAndValidity();
        break;
    }
  }

  getGroupsOfCustomersSource(groups: any[]): any[] {
    return groups.map(group => ({
      businessId: this.envService.businessId,
      id: group.id,
      isDefault: false,
      name: group.title,
    }));
  }

  getCustomers(contacts: any[]): any[] {
    return contacts.map((contact) => {
      const customer: PeProductCustomersInterface = { };
      contact.fields.forEach((node) => { customer[node.field.name] = node.value });

      return {
        id: contact._id,
        city: customer?.city ?? '',
        companyName: '',
        country: customer?.country ?? '',
        email: customer?.email ?? '',
        image: customer?.imageUrl ?? 'assets/icons/folder-grid.png',
        name: `${customer?.firstName} ${customer?.lastName}`,
        title: `${customer?.firstName} ${customer?.lastName}`,
      };
    });
  }

  public getCustomersSource(contacts: any[]): PeProductCustomerInterface[] {
    return contacts.map((contact: any) => {
      const contactFields = {
        nodes: contact.fields.map((field) => {
          const node: PeProductCustomerFieldInterface = {
            fieldId: field._id,
            id: field._id,
            value: field.value,
            contactId: contact._id,
            field: {
              businessId: this.envService.businessId,
              id: field.field._id,
              name: field.field.name,
              type: '',
              groupId: null,
            },
          };

          return node;
        }),
      }
      const customer: PeProductCustomerInterface = {
        businessId: this.envService.businessId,
        id: contact._id,
        type: '',
        contactFields: contactFields,
      };

      return customer;
    });
  }

}
