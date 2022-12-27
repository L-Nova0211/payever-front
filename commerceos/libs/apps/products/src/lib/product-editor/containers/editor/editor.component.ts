import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef, Inject,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { get, isEqual, cloneDeep } from 'lodash-es';
import { combineLatest, EMPTY, merge, Observable, of, Subject } from 'rxjs';
import { catchError, filter, skip, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, PeDestroyService, PebDeviceService, EnvService, PE_ENV, EnvironmentConfigInterface } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { CountryArrayInterface } from '@pe/forms-core';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';
import { PeStepperService, PeWelcomeStepperAction } from '@pe/stepper';

import { PeProductTypeCustomerEligibilityEnum } from '../../../products-list/enums/customer.enum';
import { DialogService } from '../../../products-list/services/dialog-data.service';
import { DEFAULT_SNACK_BAR_DURATION, STATUS_FORBIDDEN } from '../../../shared/constants';
import { NavbarControlPosition, NavbarControlType } from '../../../shared/enums/editor.enum';
import { ProductEditorSections, ProductTypes } from '../../../shared/enums/product.enum';
import { Business } from '../../../shared/interfaces/business.interface';
import {
  LanguageInterface,
  LinkControlInterface,
  TextControlInterface,
} from '../../../shared/interfaces/editor.interface';
import { ProductModel } from '../../../shared/interfaces/product.interface';
import { ExternalError, VariantsSection } from '../../../shared/interfaces/section.interface';
import { ProductsApiService } from '../../../shared/services/api.service';
import { CurrencyService } from '../../../shared/services/currency.service';
import { SectionsService } from '../../services';
import { CountryService } from '../../services/country.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'pf-products-editor',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
    PebDeviceService
  ],
})
export class EditorComponent implements OnInit {
  @ViewChildren(MatExpansionPanel) pannels: QueryList<MatExpansionPanel>;
  @ViewChild('overlayBody', { static: true }) overlayBodyRef: ElementRef<HTMLElement>;

  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  isEdit: boolean;
  business: Business;
  channelSetId: number;
  externalError$: Subject<ExternalError> = new Subject<ExternalError>();
  ratesList: any[];

  defaultProductImg = `${this.env.custom.cdn}/icons/app-icon-products.svg`;
  defaultContactImg = `${this.env.custom.cdn}/icons/app-icon-contacts.svg`;

  titleControlConfig: TextControlInterface = {
    position: NavbarControlPosition.Center,
    type: NavbarControlType.Text,
    text: this.translateService.translate('title'),
  };

  linkControlConfig: LinkControlInterface = {
    position: NavbarControlPosition.Right,
    type: NavbarControlType.Link,
    text: this.translateService.translate('save'),
    classes: 'mat-button-fit-content',
    queryParams: this.route.snapshot.queryParams, // to prevent removing of get params
    onClick: () => {
      this.sectionsService.save().pipe(filter((valid: boolean) => !!valid), takeUntil(this.destroyed$)).subscribe(
        () => this.handleSave(),
        (error: any) => this.handleError(error),
      );
    },
  };

  modalHeaderControls: Array<TextControlInterface | LinkControlInterface> = [
    this.titleControlConfig,
    this.linkControlConfig,
  ];

  private model: ProductModel;

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private currencyService: CurrencyService,
    private route: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private envService: EnvService,
    private snackBarService: SnackbarService,
    public sectionsService: SectionsService,
    private peStepperService: PeStepperService,
    private cdr: ChangeDetectorRef,
    public confirmDialog: DialogService,
    public countryService: CountryService,
    public languageService: LanguageService,
    public deviceService: PebDeviceService,
    private destroyed$: PeDestroyService,
    private matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private api: ProductsApiService,
    private confirmScreenService: ConfirmScreenService
  ) {
    merge(
      this.countryService.saved$.pipe(
        switchMap((selected) => {
          if (isEqual(this.model, this.sectionsService.model)) {
            return this.countrySetProduct(selected);
          }

          return this.showPreUpdateConfirm(this.countryService.confirmHeadings, selected, false);
        }),
      ),
      this.languageService.saved$.pipe(
        switchMap((selected) => {
          if (isEqual(this.model, this.sectionsService.model)) {
            return this.languageSetProduct(selected);
          }

          return this.showPreUpdateConfirm(this.languageService.confirmHeadings, selected, true);
        }),
      )
    ).pipe(
      tap(() => {
        this.isEdit = true;
        this.sectionsService.isEdit = true;
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    this.registerIcons([
      'drag-icon',
      'remove-icon',
      'edit-variant-icon',
      'img-placeholder',
    ]);
  }

  get activeSection(): ProductEditorSections {
    return this.sectionsService.activeSection;
  }

  showPreUpdateConfirm(
    confirmHeadings: Headings,
    selected: LanguageInterface | CountryArrayInterface,
    isLang: boolean
  ): Observable<boolean> {
    return this.confirmScreenService.show(confirmHeadings, true).pipe(
      switchMap((confirm) => {
        if (!confirm) {
          return EMPTY
        }

        return this.sectionsService.save(true).pipe(
          take(1),
          switchMap(() => {
            return isLang ? this.languageSetProduct(selected) : this.countrySetProduct(selected);
          })
        );
      }),
    );
  }

  languageSetProduct(selected: LanguageInterface): Observable<any> {
    this.languageService.checkValidation();
    this.languageService.language = selected;
    this.sectionsService.model.language = selected.code;

    return this.api.getProductTranslation(this.sectionsService.model.id, selected.code).pipe(
      tap((resp) => {
        this.sectionsService.model = {
          ...this.sectionsService.model,
          ...resp.data.getProductTranslation,
        };
        this.model = cloneDeep(this.sectionsService.model);

        setTimeout(() => {
          this.languageService.updatedLanguage$.next(this.sectionsService.model);
        });
      }),
      catchError(error => of(error))
    );
  }

  countrySetProduct(selected: CountryArrayInterface): Observable<any> {
    this.countryService.country = selected;
    this.sectionsService.model.country = selected.code;

    return this.api.getProductCountrySetting(this.sectionsService.model.id, selected.code).pipe(
      tap((resp) => {
        this.sectionsService.model = {
          ...this.sectionsService.model,
          ...resp.data.getProductCountrySetting,
        }

        this.model = cloneDeep(this.sectionsService.model);

        setTimeout(() => {
          this.countryService.updatedCountry$.next(this.sectionsService.model);
        });
      }),
      catchError(error => of(error))
    );
  }

  ngOnInit(): void {
    this.channelSetId = this.route.snapshot.params.channelId;
    this.ratesList = this.route.snapshot.data.vatRates;
    this.model = JSON.parse(this.route.snapshot.queryParamMap.get('products'));

    if (this.model) {
      this.sectionsService.setProduct(this.model);
    }

    const isEdit: boolean = this.route.snapshot.data.isProductEdit;
    this.isEdit = isEdit;
    this.sectionsService.isEdit = isEdit;
    const needToSetLoadedProduct: boolean = isEdit && this.sectionsService.resetState$.value;

    if (needToSetLoadedProduct) {
      this.sectionsService.setProduct(get(this.route.snapshot, ['data', 'product', 'data', 'product'], null));
      this.currencyService.currency =
        get(this.route.snapshot, ['data', 'product', 'data', 'product', 'currency'], null);
    }

    this.countryService.setCountryByCode(this.sectionsService.model?.country);
    this.languageService.setLanguageByCode(this.sectionsService.model?.language);

    this.sectionsService.sectionKeys = this.filterSectionKeys(
      this.sectionsService.variantsSection, this.sectionsService.model.onSales,
    );

    combineLatest([
      this.sectionsService.variantsChange$,
      this.sectionsService.mainSectionChange$,
      this.sectionsService.productType$,
    ]).pipe(
      filter(d => !!d && !!d[1]),
      takeUntil(this.destroyed$),
    ).subscribe(([variantsData, mainSectionData, productType]) => {
      this.sectionsService.sectionKeys = this.filterSectionKeys(
        variantsData,
        mainSectionData && mainSectionData.onSales,
        productType,
      );
      this.cdr.markForCheck();
    });

    this.sectionsService.isUpdating$.subscribe((isUpdating) => {
      this.modalHeaderControls = [
        this.titleControlConfig,
        {
          ...this.linkControlConfig,
          loading: isUpdating,
        },
      ];
      this.cdr.markForCheck();
    });

    this.peStepperService.dispatch(PeWelcomeStepperAction.ShowGoBack, true);

    if (isEdit) {
      this.model = get(this.route.snapshot, ['data', 'product', 'data', 'product'], null);
      this.model.available = this.sectionsService.model.available ?? false;
      this.model.inventoryTrackingEnabled = this.model.inventoryTrackingEnabled ?? false;
      this.model.inventory = this.model.inventory ?? 0;
      this.model.lowInventory = this.model.lowInventory ?? 0;
      this.model.emailLowStock = this.model.emailLowStock ?? false;
      this.model.productType = this.model.type;
      this.model.categories = this.model.categories.map((category) => {
        return { title: category.title };
      });

      if (this.model.priceTable?.length) {
        this.model.pricing = [];
        this.model.priceTable?.forEach((price) => {
          const priceItem = {
            price: price.price,
            salePrice: price.vatRate,
            customerEligibility: null,
            customerEligibilitySpecificCustomers: [],
            customerEligibilityCustomerGroups: [],
          }
          if(price?.condition?.field === 'customerUserId') {
            priceItem.customerEligibility = PeProductTypeCustomerEligibilityEnum.SpecificCustomers;
            priceItem.customerEligibilitySpecificCustomers = price?.condition?.value.map((id) => {
              return { id };
            })
          } else if(price?.condition?.field === 'customerGroupId') {
            priceItem.customerEligibility = PeProductTypeCustomerEligibilityEnum.SpecificGroupsOfCustomers;
            priceItem.customerEligibilityCustomerGroups = price?.condition?.value.map((id) => {
              return { id };
            })
          }
          this.model.pricing.push(priceItem);
        });

        this.sectionsService.contacts$.next(this.model.pricing);
      }

      this.sectionsService.recommendations$.pipe(
        skip(1),
        tap((recommendations) => {
          if (recommendations) {
            this.model.recommendations = recommendations;
          }
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    }
  }

  openPicker(name: string) {
    this.sectionsService.checkValidation();
    if (this.sectionsService.sectionsWithErrors.length === 0) {
      this.router.navigate([{ outlets: { auxiliary: [name] } }], {
        skipLocationChange: true,
        relativeTo: this.route,
        queryParamsHandling: 'merge',
      });
    } else {
      this.overlayBodyRef.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onCountryPick() {
    this.openPicker('country');
  }

  onLanguagePick() {
    this.openPicker('language');
  }

  close() {
    if (isEqual(this.model, this.sectionsService.model)) {
      this.navigateToList();
    } else {
      this.confirmDialog.open({
        title: this.isEdit
          ? this.translateService.translate('dialog_leave.heading_editing')
          : this.translateService.translate('dialog_leave.heading_adding'),
        subtitle: this.isEdit
          ? this.translateService.translate('dialog_leave.description_editing')
          : this.translateService.translate('dialog_leave.description_adding'),
        confirmBtnText: this.translateService.translate('dialog_leave.yes'),
        declineBtnText: this.translateService.translate('dialog_leave.no'),
      });

      this.confirmDialog.confirmation$.pipe(
        skip(1),
        take(2),
        takeUntil(this.destroyed$)
      ).subscribe(() => {
        this.navigateToList();
      });
    }
  }

  navigateToList() {
    this.sectionsService.resetState$.next(true);
    const prevPath: string = this.route.snapshot.queryParams.prevProductsPath || 'list';
    const url = ['business', this.envService.businessId, 'products', prevPath, { outlets: { editor: null } }];
    this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
  }

  togglePanels(valid: boolean) {
    if (!valid) {
      this.pannels.forEach((panel: any, index: number) => {
        if (this.hasErrors(this.sectionsService.sectionKeys[index])) {
          panel.open();
        } else {
          panel.close();
        }
      });
    }
  }

  done() {
    this.sectionsService.save().pipe(
      tap((valid: boolean) => {
        this.togglePanels(valid);
      }),
      filter((valid: boolean) => !!valid),
      takeUntil(this.destroyed$),
    ).subscribe({
      next: () => {
        this.handleSave()
      },
      error: (error: any) => this.handleError(error),
    }
    );
  }

  hasErrors(section: ProductEditorSections): boolean {
    return this.sectionsService.hasErrors(section);
  }

  setStep(step: ProductEditorSections): void {
    this.sectionsService.activeSection = step;
    this.sectionsService.activeSection$.next(step);
  }

  removeStep(section: ProductEditorSections): void {
    if (this.sectionsService.activeSection === section) {
      this.sectionsService.activeSection = null;
      this.sectionsService.activeSection$.next(null);
    }
  }

  handleError(err: any): void {
    if (!err.graphQLErrors) {
      return;
    }
    const error = err.graphQLErrors[0];
    if (!error) {
      return;
    }
    const message: string = error.message || String(error);
    if (message === 'This value is already used' || message === 'Product with sku already exists') {
      // TODO Rework to automatic get section from error
      this.externalError$.next({
        section: ProductEditorSections.Inventory,
        field: 'sku',
        errorText: message,
      });
    } else {
      this.snackBarService.toggle(
        true,
        {
          content: error?.statusCode === STATUS_FORBIDDEN ?
            this.translateService.translate('errors.forbidden') : message,
          duration: DEFAULT_SNACK_BAR_DURATION,
          iconId: 'icon-x-rounded-16',
          iconSize: 20,
        },
      );
    }
  }

  handleSave(): void {
    this.peStepperService.dispatch(PeWelcomeStepperAction.ShowGoBack, false);
    this.snackBarService.toggle(
      true,
      {
        content: this.sectionsService.model.id ?
          this.translateService.translate('products.edited') :
          this.translateService.translate('products.saved'),
        duration: DEFAULT_SNACK_BAR_DURATION,
        iconId: 'icon-check-rounded-16',
        iconSize: 20,
      });
    const isProductNotForChannel: boolean = this.route.snapshot.queryParams.prevProductsPath === 'select-products';
    this.sectionsService.resetState$.next(true);
    if (isProductNotForChannel) {
      const url: string[] = ['business', this.envService.businessId, 'products', 'select-products'];
      this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
    } else {
      const url = ['business', this.envService.businessId, 'products', 'list', { outlets: { editor: null } }];
      this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
    }
  }

  private filterSectionKeys(currentVariants: VariantsSection[], onSales: boolean, type?: ProductTypes)
    : ProductEditorSections[] {
    return Object.values(ProductEditorSections)
      .filter((section) => {
        if (section === ProductEditorSections.Inventory) {
          // Inventory section disappears when we have variants
          return !(currentVariants && currentVariants.length);
        } else if (section === ProductEditorSections.Shipping) {
          // Hide shipping section if item is not physical
          return type ? type === ProductTypes.Physical : true;
        }

        return true;
      });
  }

  private registerIcons(icons: string[]) {
    icons.forEach((icon) => {
      this.matIconRegistry.addSvgIcon(
        icon,
        this.sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icon}.svg`),
      );
    })
  }
}

