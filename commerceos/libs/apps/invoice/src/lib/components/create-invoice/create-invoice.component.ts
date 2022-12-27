import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject,
    ViewChild, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import moment from 'moment';
import { BehaviorSubject, merge, of, Subject } from 'rxjs';
import { filter, take, takeUntil, tap, debounceTime, startWith, switchMap, map } from 'rxjs/operators';

import { AppThemeEnum, EnvService, PeDestroyService, PE_ENV } from '@pe/common';
import { GridQueryParams, PeGridItem, PeGridQueryParamsService } from '@pe/grid';
import { MediaUrlPipe } from '@pe/media';
import {
  PeOverlayRef,
  PeOverlayWidgetService,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
} from '@pe/overlay-widget';
import { ContactsAppState, ContactsService } from '@pe/shared/contacts';
import { ProductsAppState, ProductsService } from '@pe/shared/products';
import { PaymentTerms, PriceFormats } from '@pe/text-editor';
import { PeDateTimePickerService } from '@pe/ui';

import { ProductData } from '../../interfaces/filter.interface';
import { PebInvoiceGridService } from '../../routes/grid/invoice-grid.service';
import { UpsertItem } from '../../routes/grid/store/folders.actions';
import { PeInvoiceApi } from '../../services/abstract.invoice.api';
import { InvoiceApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { ContactsDialogService } from '../../services/contacts-dialog.service';
import { InvoiceEnvService } from '../../services/invoice-env.service';
import { ProductsDialogService } from '../../services/products-dialog.service';
import { UploadMediaService } from '../../services/uploadMedia.service';

enum ThemesIcons {
  'datetime-picker' = 'datetime-picker-icon.svg',
}

@Component({
  selector: 'pe-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeCreateInvoiceComponent implements OnInit, AfterViewInit {
  @SelectSnapshot(ProductsAppState.products) selectedProducts: PeGridItem[];
  @SelectSnapshot(ContactsAppState.contacts) selectedContacts: PeGridItem[];
  @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>;
  defaultProductImg = `${this.env.custom.cdn}/icons/app-icon-products.svg`;
  defaultContactImage = './assets/icons/contact-grid.png';
  paymentTerms = PaymentTerms;
  currencies: any[] = [];
  data;
  @ViewChild('productPicker') productPicker: any;
  @ViewChild('contactPicker') contactPicker: any;
  labelCurrency: any = 'Your Currency'
  selectedCurrency;
  priceFormats = PriceFormats;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  invoiceForm: FormGroup;
  currencyList: any[] = [];
  languagesList: any[] = [];
  panelState: any = { customer: true };

  products: any[] = [];
  products$ = new BehaviorSubject<any[]>([]);
  productsFilter$ = new Subject<string>();

  contacts: any[] = [];
  contacts$ = new BehaviorSubject<any[]>([]);
  contactsFilter$ = new Subject<string>();

  initialFiles: any[] = [];
  productsData = [];
  contactsData = [];
  allowValidation: boolean;
  timer: any;

  errors = {
    customer: {
      name: 'Customer',
      hasError: false,
      errorMessage: '',
    },
    invoice_date: {
      name: 'Invoice date',
      hasError: false,
      errorMessage: '',
    },
    invoice_no: {
      name: 'Invoice No',
      hasError: false,
      errorMessage: '',
    },
    due_date: {
      name: 'Due date',
      hasError: false,
      errorMessage: '',
    },
    price_format: {
      name: 'Price format',
      hasError: false,
      errorMessage: '',
    },
    currency: {
      name: 'Currency',
      hasError: false,
      errorMessage: '',
    },
    products: {
      name: 'Products',
      hasError: false,
      errorMessage: '',
    },
    zipCode: {
      name: 'Zip Code',
      hasError: false,
      errorMessage: '',
    },
    streetNumber: {
      name: 'Street Number',
      hasError: false,
      errorMessage: '',
    },
    streetName: {
      name: 'Street Name',
      hasError: false,
      errorMessage: '',
    },
    stateProvinceCode: {
      name: 'State Province Code',
      hasError: false,
      errorMessage: '',
    },
    phone: {
      name: 'Phone',
      hasError: false,
      errorMessage: '',
    },
    countryCode: {
      name: 'Country Code',
      hasError: false,
      errorMessage: '',
    },
    city: {
      name: 'City',
      hasError: false,
      errorMessage: '',
    },
    taxExempt: {
      name: 'Tax Exempt',
      hasError: false,
      errorMessage: '',
    },
    taxId: {
      name: 'Tax Id',
      hasError: false,
      errorMessage: '',
    },
  }

  constructor(
    @Inject(PE_OVERLAY_DATA) public appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private readonly changeDetectorRef: ChangeDetectorRef,
    @Inject(EnvService) protected envService: InvoiceEnvService,
    private router: Router,
    @Inject(PE_ENV) private env,
    private peOverlayRef: PeOverlayRef,
    private commonService: CommonService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    private productsService:ProductsService,
    private contactsService:ContactsService,
    private fb: FormBuilder,
    private mediaUrlPipe: MediaUrlPipe,
    private destroyed$: PeDestroyService,
    private overlay: PeOverlayWidgetService,
    private dateTimePicker: PeDateTimePickerService,
    private invoiceService: PebInvoiceGridService,
    private productDialogService: ProductsDialogService,
    private contactDialogService: ContactsDialogService,
    private cdr: ChangeDetectorRef,
    private api: PeInvoiceApi,
    private uploaderService: UploadMediaService,
    private store: Store,
    public invoiceApiService: InvoiceApiService,
    public iconRegistry: MatIconRegistry,
    private gridQueryParamsService: PeGridQueryParamsService,
    public domSanitizer: DomSanitizer
  ) {
    Object.entries(ThemesIcons).forEach(([name, path]) => {
      iconRegistry.addSvgIcon(
        name,
        domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${path}`),
      );
    });

    config.doneBtnCallback = this.addInvoice;
    this.invoiceForm = this.fb.group({
      customer: [appData?.customer ? [appData?.customer] : [], Validators.required],
      invoice_date: [appData?.issueDate ? moment(appData?.issueDate).format('MM.DD.YYYY') : '', Validators.required],
      invoice_no: [appData?.reference || '', Validators.required],
      payment_terms: [appData?.paymentTerms || '7 days', Validators.required],
      due_date: [appData?.dueDate ? moment(appData?.dueDate).format('MM.DD.YYYY') : '', Validators.required],
      price_format: [appData?.invoiceOptions?.priceFormat || this.priceFormats.GROSS, Validators.required],
      discount: [appData?.invoiceOptions?.discount || ''],
      language: [appData?.invoiceOptions?.language || ''],
      currency: [appData.currency || '', Validators.required],
      exchange_rate: [appData?.invoiceOptions?.exchangeRate || ''],
      attachments: [[]],
      products: [appData?.invoiceItems || [], Validators.required],
      zipCode: [appData?.customer?.billingAddress?.zipCode || '', Validators.required],
      streetNumber: [appData?.customer?.billingAddress?.streetNumber || '', Validators.required],
      streetName: [appData?.customer?.billingAddress?.streetName || '', Validators.required],
      stateProvinceCode: [appData?.customer?.billingAddress?.stateProvinceCode || '', Validators.required],
      phone: [appData?.customer?.billingAddress?.phone || '', Validators.required],
      countryCode: [appData?.customer?.billingAddress?.countryCode || '', Validators.required],
      city: [appData?.customer?.billingAddress?.city || '', Validators.required],
      taxExempt: [appData?.customer?.taxExempt || '', Validators.required],
      taxId: [appData?.customer?.taxId || '', Validators.required],
    }, {
      validator: [
        this.fromToDate('invoice_date', 'due_date'),
      ],
    });

    if (appData?._id) {
      this.uploaderService.getAttachments(this.envService.businessId, appData._id).subscribe((files) => {
        this.initialFiles = files;
        this.invoiceForm.get('attachments').patchValue(files);
      });
    }
    this.invoiceApiService.getCurrencyList().subscribe((res: any[]) => {
      this.currencies = res.sort((pre, now) => pre.name > now.name ? 1 : -1).map((data) => {
        return { label: `${data.name}, ${data.code}`, value: data.code };
      });;

      if (this.appData.currency) {
        this.invoiceForm.get('currency').setValue(this.appData.currency);
        this.selectedCurrency = this.currencies.find(item => item.value === this.appData.currency);
        this.cdr.detectChanges();
      }
      this.invoiceForm.get('currency').valueChanges.subscribe((obj) => {
        if (obj !== this.appData.currency) {
          this.appData.currency = obj;
        }
      });

    });

    if (appData?.invoiceItems?.length) {
      this.commonService.getProducts(
        appData.invoiceItems.map((item: any) => {
          return item.productId;
        }),
      ).pipe(
        tap((res:ProductData[]) => {
          res.forEach((prod) =>{
            if (!prod.image){
              prod.image = this.defaultProductImg;
            }
          });
          this.appData.invoiceItems = res;
          this.invoiceForm.get('products').patchValue(this.appData.invoiceItems);
        })
      ).subscribe();
    }

    if (appData?.customer && appData.customer.contactId) {
      let contactId = appData.customer.contactId.split('|')[0];
      this.commonService.getContactById(contactId).subscribe((contact) =>{
        contact.contactId = contact.id;
        if (contact && !contact.image){
          contact.image = this.defaultContactImage;
        }
        this.appData.customer = contact;
        this.invoiceForm.get('customer').patchValue([this.appData.customer]);
      });
    }

    this.invoiceForm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((data) => {
      if (this.allowValidation) {
        this.validateForms();
      }
    });
  }

  ngOnInit(){

    merge(
      this.contactsFilter$.pipe(
        debounceTime(500),
        startWith(''),
        switchMap(filterText => this.filterContacts(filterText)),
        tap(contacts => this.contacts$.next(contacts)),
      ),

      this.productsFilter$.pipe(
        debounceTime(500),
        startWith(''),
        switchMap(filtertext  => this.filterProducts(filtertext)),
        tap(products => this.products$.next(products))
      ),
    ).pipe(takeUntil(this.destroyed$))
    .subscribe();
  }

  ngAfterViewInit() {
    if (this.productsData) {
      this.productsData.forEach((item) => {
        const image = this.getMediaUrlFromImage(item.images[0]);
        this.productsData.push({ image, id: item.id, name: item.title, sku: item.sku });
      });
      this.cdr.detectChanges();
    }
    if (this.productsData) {
      const products = [];
      this.productsData.forEach((product) => {
        product.image = product.imageUrl;
        products.push({
          productId: product.hasOwnProperty('productId') ? product.productId : product._id,
          name: product.name,
          sku: product.sku,
          image: product?.image,
          imageUrl: product?.image,
        });
      });

      this.invoiceForm.get('products').patchValue(products);

      this.productPicker.emitChanges();
      this.cdr.detectChanges();
    }
    if (this.contactsData) {
      this.contactsData.forEach((item) => {
        const image = this.getMediaUrlImage(item.images[0]);
        this.contactsData.push({ image, id: item.id, name: item.title });
      });
      this.cdr.detectChanges();
    }
    if (this.contactsData) {
      const contacts = [];
      this.contactsData.forEach((contact) => {
        contact.image = contact.imageUrl;
        contacts.push({
          contactId: contact.hasOwnProperty('customer') ? contact.customerId : contact._id,
          name: contact.title,
          image: contact?.image,
          imageUrl: contact?.image,
        });
      });
      this.contacts = this.getContactsData(contacts);
      this.invoiceForm.get('customer').patchValue(contacts);

      this.contactPicker.emitChanges();
      this.cdr.detectChanges();
    }
  }

  filterContacts(filtertext:string){
    if (!filtertext){
      return of([]);
    }

    return this.contactsService.filterContacts(filtertext).pipe(
      map((contacts) => {
        const contactsNew = contacts.map((contact) => {
          return {
            image: contact.imageUrl ?? this.defaultContactImage,
            contactId: contact.serviceEntityId,
            label: contact.title,
            id: contact.serviceEntityId,
            value: contact.serviceEntityId,
            name: contact.title,
            email: contact.email,
          };
        });

        return contactsNew;
      }),
    );
  }

  filterProducts(filterText:string){
    if (!filterText){
      return of([]);
    }

    return this.productsService.filterProductsByName(filterText).pipe(
        map((products) => {
          const productsWithImages = products.map((product) => {
            return {
              image: product.imagesUrl[0] ?? this.defaultProductImg,
              productId: product.id || product._id,
              label: product.title,
              id: product._id ?? product.id,
              name: product.title,
              value: product._id ?? product.id,
            };
          });

          return productsWithImages;
        }),
      );
  }

  getMediaUrlFromImage(image) {
    return this.mediaUrlPipe.transform(image, 'products', 'grid-thumbnail' as any);
  }

  getMediaUrlImage(image) {
    return this.mediaUrlPipe.transform(image, 'contacts', 'grid-thumbnail' as any);
  }

  getProductsData(products): any[] {
    return products.map((item) => {
      return { id: item.productId, name: item.name, image: item.image, sku: item.sku };
    });
  }

  productDialogListener() {
    this.productDialogService.currentStatus.pipe(
      filter((isSave: boolean | null) => {
        return isSave !== null;
      }),
      tap((isSave: boolean) => {
        if (isSave) {

          let selectedProds:any[] = this.invoiceForm.get('products').value || [];
          let existsIds = selectedProds.map(a => a.productId);

          let  newProducts = this.selectedProducts.filter(newPro => !existsIds.includes(newPro.id));
          newProducts = this.normalizeProductsData(newProducts);
          newProducts.forEach((prod) => {
              if (prod.image === './assets/icons/folder-grid.png'){
                prod.image = this.defaultProductImg;
              }
            });

          this.invoiceForm.patchValue({
            products: [...selectedProds,...newProducts],
          });

          this.cdr.detectChanges();
        }
      }),
      take(1),
    ).subscribe();
  }

  normalizeProductsData(products): any[] {
    return products.map((element) => {
      const image = element.image ? element.image
        : (element.images && element.images[0]
          ? this.mediaUrlPipe.transform(element.images[0], 'products')
          : null
        );

      return {
        image: image ?? this.defaultProductImg,
        label: element.title,
        id: element._id ?? element.id,
        name: element.title,
        productId: element._id ?? element.id,
      };
    });
  }

  getContactsData(contacts): any[] {
    return contacts.map((item) => {
      return { id: item.contactId, name: item.name, image: item.image, sku: item.sku };
    });
  }

  contactDialogListener() {
    this.contactDialogService.currentStatus.pipe(
      filter((isSave: boolean | null) => {
        return isSave !== null;
      }),
      tap((isSave: boolean) => {
        if (isSave) {
          const contacts = this.normalizeContactsData(this.selectedContacts);
          this.invoiceForm.patchValue({
            customer: [contacts[0]],
          });

          this.cdr.detectChanges();
        }
      }),
      take(1),
    ).subscribe();
  }

  normalizeContactsData(contacts): any[] {
    return contacts.map((element) => {
      const image = element.image ? element.image
        : (element.images && element.images[0]
          ? this.mediaUrlPipe.transform(element.images[0], 'contacts')
          : null
        );

      return {
        image: image ?? this.defaultProductImg,
        label: element.title,
        id: element.id,
        name: element.title,
        contactId: element.id,
        firstName: element.data.firstName,
        lastName: element.data.lastName,
        email: element.data.email,
      };
    });
  }

  openDatepicker(event, controlName: string): void {
    let name = '';
    if (controlName === 'dateTimeFrom') {
      name = 'Date From';
    } else {
      name = 'Choose Date';
    }

    const dialogRef = this.dateTimePicker.open(event, {
      theme: this.theme,
      config: { headerTitle: name, range: false, maxDate: null },
    });
    dialogRef.afterClosed.subscribe((date) => {
      if (date?.start) {
        const formatedDate = moment(date.start).format('MM.DD.YYYY');
        this.invoiceForm.get(controlName).patchValue(formatedDate);
      }
    });
  }

  fromToDate(fromDateField: string, toDateField: string, errorName: string = 'fromToDate'): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
      const fromDate = formGroup.get(fromDateField).value;
      const toDate = formGroup.get(toDateField).value;
      // Ausing the fromDate and toDate are numbers. In not convert them first after null check
      if ((fromDate !== null && toDate !== null) && moment(fromDate).isAfter(toDate)) {
        return { [errorName]: true };
      }

      return null;
    };
  }

  addInvoice = () => {
    this.allowValidation = true;
    this.validateForms();
    const formInfo = this.invoiceForm.value;
    if (this.invoiceForm.invalid) {
      return;
    } else {
      this.config.doneBtnTitle = 'Saving...';
      this.config.isLoading = true;
    }

    const payload = {
      issueDate: moment(formInfo.invoice_date).toDate(),
      reference: formInfo.invoice_no,
      dueDate: moment(formInfo.due_date).toDate(),
      business: this.envService.businessId,
      channelSet: [
        '99303f3b-ef8e-4f9d-ba5e-ba60bc786eb3',
      ],
      status: 'PAID',
      parentFolderId: this.gridQueryParamsService.getQueryParamByName(GridQueryParams.SelectedFolder),
      invoiceItems: [
        ...this.invoiceForm.get('products').value.map((item) => {
          return {
            ...item,
            productId: item.productId || item.id,
            title: item.name || item.title,
            description: 'string',
            quantity: 0,
            unit: 'EACH',
            price: 0,
            vatRate: 0,
            thumbnail: item.image,
          };
        }),
      ],
      businessId: this.envService.businessId,
      amountDue: 0,
      amountRemaining: 0,
      amountPaid: 0,
      previewImage: 'imagepath',
      deliveryFee: 0,
      currency: this.invoiceForm.value.currency,
      subtotal: 0,
      total: 0,
      customer: {
        ...this.invoiceForm.get('customer').value[0],
        billingAddress: {
          zipCode: this.invoiceForm.value.zipCode,
          streetNumber: this.invoiceForm.value.streetNumber,
          streetName: this.invoiceForm.value.streetName,
          stateProvinceCode: this.invoiceForm.value.stateProvinceCode,
          phone: this.invoiceForm.value.phone,
          firstName: this.invoiceForm.get('customer').value[0].firstName || '-',
          lastName: this.invoiceForm.get('customer').value[0].lastName || '-',
          countryCode: this.invoiceForm.value.countryCode,
          city: this.invoiceForm.get('city').value,
          isDefault: true,
        },
        email: this.invoiceForm.get('customer').value[0].email,
        businessId: this.envService.businessId,
        business: this.invoiceForm.get('customer').value[0].business
          || this.invoiceForm.get('customer').value[0].businessId,
        taxExempt: this.invoiceForm.value.taxExempt,
        taxId: this.invoiceForm.value.taxId,
        contactId:  this.invoiceForm.get('customer').value[0].serviceEntityId ||
        this.invoiceForm.get('customer').value[0]._id || this.invoiceForm.get('customer').value[0].id,


      },
      settings: {
        SignatureMessage: 'string',
        accounts: [
          'string',
        ],
        business: 'string',
        ownEmail: false,
        emailSubject: 'string',
      },
      theme: this.theme,
    };

    let request = this.api.createInvoice(payload);
    if (this.appData._id) {
      request = this.api.updateInvoice(this.appData._id, payload);
    }
    request.subscribe((data) => {
      this.store.dispatch(new UpsertItem(this.invoiceService.invoiceMapper(data)));
      if (!formInfo.attachments[0]?._id) {
        if (formInfo.attachments && formInfo.attachments.length) {
          this.uploaderService.sendAttachments(formInfo.attachments.item(0),
            this.envService.businessId, data._id).subscribe();
        }
        if (this.initialFiles && this.initialFiles.length) {
          this.uploaderService.deleteAttachment(this.envService.businessId,
            this.initialFiles[0].name).subscribe();
        }
      }

      this.overlay.close();
    });
  }

  openProductDialog = () => {
    this.router.navigate([`/business/${this.envService.businessId}/invoice/add-product`]);
    this.productDialogListener();
  }

  openContactDialog = () => {
    this.router.navigate([`/business/${this.envService.businessId}/invoice/add-contact`]);
    this.contactDialogListener();
  }

  panelStateTrigger(panel: string) {
    this.panelState = { [panel]: true };
    this.cdr.detectChanges();
  }

  validateForms() {
    if (this.invoiceForm.errors?.fromToDate) {
      this.errors['due_date'].errorMessage = `${this.errors['due_date'].name} must be after Invoice Date`;
    }
    for (let control in this.invoiceForm.controls) {

      if (this.invoiceForm.controls[control].invalid) {
        if (control === 'customer') {
          this.panelState.customer = true;
        }
        if (['zipCode', 'streetNumber', 'streetName',
          'stateProvinceCode', 'phone', 'countryCode', 'city', 'taxExempt', 'taxId'].includes(control)) {
          this.panelState.billing = true;
        }
        if (['invoice_date', 'invoice_no', 'due_date'].includes(control)) {
          this.panelState.details = true;
        }
        if (['outbox_userName', 'outbox_password',
          'outbox_server', 'outbox_port', 'outbox_protection'].includes(control)) {
          this.panelState.outbox = true;
        }
        if (control === 'products') {
          this.panelState.items = true;
        }
        if (control === 'currency') {
          this.panelState.options = true;
        }
        if (control === 'zipCode') {
          this.panelState.billing = true;
        }
        this.errors[control].hasError = true;
        if (this.invoiceForm.controls[control].errors.required) {
          this.errors[control].errorMessage = `${this.errors[control].name} is required`;
        }
      } else if (this.errors[control]) {
        this.errors[control].hasError = false;
      }
      if (this.invoiceForm.errors?.fromToDate) {
        this.errors['due_date'].hasError = true;
        this.panelState.details = true;
      }
    }
    this.cdr.detectChanges();
  }

  private normalizeData<T = any>(items): T[] {
    return items.map((element) => {
      return {
        ...element,
        image: element.image,
        label: element.title,
        id: element._id ?? element.id,
        name: element.title,
        value: element._id ?? element.id,
      };
    });
  }

}
