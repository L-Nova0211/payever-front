// tslint:disable:max-file-line-count
import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { assign, cloneDeep, find as _find, findIndex, get, isEqual, omit } from 'lodash-es';
import { BehaviorSubject, Observable, of, Subject, timer } from 'rxjs';
import { filter, finalize, map, mergeMap, skip, switchMap, take, tap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { EnvService } from '@pe/common';
import { PeGridSortingDirectionEnum, PeGridSortingOrderByEnum } from '@pe/grid';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import {
  PeProductCustomerFieldInterface,
  PeProductCustomerInterface,
} from '../../collection-editor';
import { PeCustomerFieldEnum, PeProductTypeCustomerEligibilityEnum } from '../../products-list/enums/customer.enum';
import { DataGridService } from '../../products-list/services/data-grid/data-grid.service';
import { ProductEditorSections, ProductTypes } from '../../shared/enums/product.enum';
import { RecurringBillingFormInterface, RecurringBillingInterface } from '../../shared/interfaces/billing.interface';
import { PeChannelGroup } from '../../shared/interfaces/channel-group.interface';
import { ChannelSetInterface } from '../../shared/interfaces/channel-set.interface';
import { ProductModel } from '../../shared/interfaces/product.interface';
import { RecommendationsInterface } from '../../shared/interfaces/recommendations.interface';
import {
  AttributesSection,
  Category,
  CategorySection,
  ChannelsSection,
  ContentSection,
  InventorySection,
  MainSection,
  NotFullCategory,
  PricingSection,
  RecommendationsSection, SeoSection,
  ShippingSection,
  TaxesSection,
  VariantsSection,
  VisibilitySection,
} from '../../shared/interfaces/section.interface';
import { ProductsApiService } from '../../shared/services/api.service';
import { CurrencyService } from '../../shared/services/currency.service';

import { ApiBuilderService } from './api-builder.service';
import { CountryService } from './country.service';
import { LanguageService } from './language.service';


@Injectable()
export class SectionsService {
  resetState$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  contacts$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  isUpdating$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  saveClicked$: Subject<ProductEditorSections | string> = new Subject<ProductEditorSections | string>();
  saveClickedSuccess$: Subject<boolean> = new Subject<boolean>();
  variantsChange$: Subject<VariantsSection[]> = new BehaviorSubject<VariantsSection[]>(null);
  mainSectionChange$: Subject<MainSection> = new BehaviorSubject<MainSection>(null);
  recommendations$: Subject<RecommendationsInterface> = new BehaviorSubject<RecommendationsInterface>(null);
  recurringBillingChange$: Subject<RecurringBillingFormInterface> = new BehaviorSubject<RecurringBillingFormInterface>(
    null,
  );

  currentVariant: VariantsSection;
  isSaved$ = new BehaviorSubject<boolean>(false);


  isSubmitted = false;
  isEdit: boolean;
  channelsGroups: PeChannelGroup[] = [];

  sectionKeys: ProductEditorSections[] = Object.keys(ProductEditorSections).map(
    (key: string) => ProductEditorSections[key],
  );

  activeSection: ProductEditorSections = ProductEditorSections.Main;
  activeSection$: Subject<ProductEditorSections> = new Subject<ProductEditorSections>();
  sectionsWithErrors: string[] = [];
  allCategories: Category[];
  allRecommendations: RecommendationsInterface[] = [];
  model: ProductModel = cloneDeep(ProductsApiService.model);
  recurringBillingLoading$ = new BehaviorSubject(false);
  recurringBillingInitial: RecurringBillingInterface = {};
  recurringBilling: RecurringBillingInterface = {};


  public readonly getGroupOfCustomers$ = this.productApiService.getContactsGroups();

  public readonly getCustomers$ = this.productApiService.getContacts();

  public customerEligibility = [
    { label: 'all', value: PeProductTypeCustomerEligibilityEnum.Everyone },
    { label: 'specific_customers', value: PeProductTypeCustomerEligibilityEnum.SpecificCustomers },
    { label: 'specific_groups_of_customers', value: PeProductTypeCustomerEligibilityEnum.SpecificGroupsOfCustomers },
  ];

  private productTypeBackingField$: BehaviorSubject<ProductTypes> = new BehaviorSubject<ProductTypes>(null);

  constructor(
    private api: ProductsApiService,
    private apiBuilder: ApiBuilderService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBarService: SnackbarService,
    private translateService: TranslateService,
    private envService: EnvService,
    private currencyService: CurrencyService,
    private dataGridService: DataGridService,
    private countryService: CountryService,
    private languageService: LanguageService,
    private productApiService: ProductsApiService
  ) {
    this.resetState$.pipe(skip(1), filter(Boolean)).subscribe(() => {
      this.resetState();
    });
  }

  get productType(): ProductTypes {
    return get(this.model, 'type', ProductTypes.Physical);
  }

  get productType$(): Subject<ProductTypes> {
    return this.productTypeBackingField$;
  }

  get mainSection(): MainSection {
    return {
      images: get(this.model, 'images', ProductsApiService.model.images),
      title: get(this.model, 'title', ProductsApiService.model.title),
      price: get(this.model, 'price', ProductsApiService.model.price),
      available: get(this.model, 'available', ProductsApiService.model.available),
      onSales: get(this.model, 'sale.onSales', ProductsApiService.model.sale.onSales),
      salePrice: get(this.model, 'sale.salePrice', ProductsApiService.model.sale.salePrice),
      saleEndDate: get(this.model, 'sale.saleEndDate', ProductsApiService.model.sale.saleEndDate),
      saleStartDate: get(this.model, 'sale.saleStartDate', ProductsApiService.model.sale.saleStartDate),
      productType: this.productType,
    };
  }

  get contentSection(): ContentSection {
    return {
      description: get(this.model, 'description', ProductsApiService.model.description),
    };
  }

  get pricingSection(): PricingSection[] {
    return get(this.model, 'pricing', []);
  }

  get inventorySection(): InventorySection {
    return {
      sku: get(this.model, 'sku', ProductsApiService.model.sku),
      barcode: get(this.model, 'barcode', ProductsApiService.model.barcode),
      inventory: get(this.model, 'inventory', ProductsApiService.model.inventory),
      lowInventory: get(this.model, 'lowInventory', ProductsApiService.model.lowInventory),
      emailLowStock: get(this.model, 'emailLowStock', ProductsApiService.model.emailLowStock),
      inventoryTrackingEnabled: get(
        this.model,
        'inventoryTrackingEnabled',
        ProductsApiService.model.inventoryTrackingEnabled,
      ),
    };
  }

  get categorySection(): CategorySection {
    return {
      categories:
        get(this.model, 'categories', ProductsApiService.model.categories) || ProductsApiService.model.categories,
    };
  }

  get channelsSection(): ChannelsSection[] {
    return get(this.model, 'channelSets', []);
  }

  get recommendationsSection(): RecommendationsSection {
    return {
      allowRecommendations: get(this.model, 'recommendations.tag', false) ? true : false,
      recommendationTag: get(this.model, 'recommendations.tag'),
      currentRecommendations: get(this.model, 'recommendations.recommendations', []),
    };
  }

  get taxesSection(): TaxesSection {
    return {
      vatRate: get(this.model, 'vatRate', null),
    };
  }

  get visibilitySection(): { active: boolean } {
    const channelSetId: string = this.route.snapshot.queryParams.channelSet;
    let active: boolean;
    if (channelSetId) {
      active = get(
        _find(get(this.model, 'channelSets', []), (channelSet: ChannelSetInterface) => channelSet.id === channelSetId),
        'active',
        true,
      );
      active = active === null ? true : active; // not migrated product
    } else {
      active = get(this.model, 'active', true);
      active = active === null ? true : active; // not migrated product
    }

    return {
      active,
    };
  }

  isRecurringBillingAvailable(): boolean {
    return this.recurringBilling.installed;
  }

  get variantsSection(): VariantsSection[] {
    return get(this.model, 'variants', []);
  }

  get attributesSection(): AttributesSection[] {
    return get(this.model, 'attributes', []);
  }

  get shippingSection(): ShippingSection {
    return {
      weight: this.model.shipping?.weight ?? '0.00',
      width: this.model.shipping?.width ?? '0.00',
      length: this.model.shipping?.length ?? '0.00',
      height: this.model.shipping?.height ?? '0.00',
    };
  }

  get seoSection(): SeoSection {
    return {
      title: this.model.seo?.title ?? '',
      description: this.model.seo?.description ?? '',
    };
  }

  onChangeProductType(type: ProductTypes): void {
    if (type !== ProductTypes.Physical) {
      this.resetSectionErrors(ProductEditorSections.Shipping);
    }
    this.productTypeBackingField$.next(type);
    this.model.productType = type;
  }

  onChangeMainSection(mainSection: MainSection): void {
    this.model.images = mainSection.images;
    this.model.title = mainSection.title;
    this.model.price = mainSection.price;
    this.model.sale = {
      salePrice: mainSection.salePrice,
      saleEndDate: mainSection.saleEndDate,
      saleStartDate:mainSection.saleStartDate,
      onSales: mainSection.onSales,
    };

    this.onChangeProductType(mainSection.productType);
    this.mainSectionChange$.next(mainSection);
  }

  onChangeContentSection(contentSection: ContentSection): void {
    this.model.description = contentSection.description;
  }

  public getCustomerByIds(ids:string[]){
    return this.productApiService.getContactsByIds(ids);
  }

  public getGroupsCustomerByIds(ids:string[]){
    return this.productApiService.getContactsGroupsByIds(ids);
  }

  public filterContacts = (filter) =>{

    if (!filter){
      return of([]);
    }

    return this.productApiService.searchContacts({ page:0,perPage:10 } ,{
      orderBy: PeGridSortingOrderByEnum.FirstName,
      direction: PeGridSortingDirectionEnum.Ascending,
    } , filter);
  }

  public filterGroups = (filter:string) =>{
    return this.productApiService.searchGroupContacts({ page:0,perPage:10 } ,{
      orderBy: PeGridSortingOrderByEnum.FirstName,
      direction: PeGridSortingDirectionEnum.Ascending,
    } , filter);
  }

  onChangePricingSection(pricingSection: PricingSection[]): void {
    this.model.priceTable = pricingSection?.length > 0 ? pricingSection
    .filter(a => a.customerEligibility != PeProductTypeCustomerEligibilityEnum.Everyone)
    .map((res) => {
      const isCustomer = res.customerEligibility === PeProductTypeCustomerEligibilityEnum.SpecificCustomers;

      return {
        price: res.price,
        vatRate: res.salePrice || 0,
        currency: this.currencyService.currency,
        condition: {
          field: `${isCustomer ? PeCustomerFieldEnum.Customer : PeCustomerFieldEnum.Group}`,
          fieldCondition: 'in',
          fieldType: 'object',
          value: this.getCustomerIds(isCustomer, res),
        },
      };
    }) : [];
  }

  getCustomerIds(isCustomer, data) {
    return isCustomer && data.customerEligibilitySpecificCustomers?.length > 0
      ? data.customerEligibilitySpecificCustomers.map(customer => customer?.id)
      : (data.customerEligibilityCustomerGroups?.length > 0
        ? data.customerEligibilityCustomerGroups.map(group => group?.id)
        : []);
  }

  onChangeInventorySection(inventorySection: InventorySection): void {
    this.model.sku = inventorySection.sku;
    this.model.barcode = inventorySection.barcode;
    this.model.inventory = inventorySection.inventory || 0;
    this.model.lowInventory = inventorySection.lowInventory || 0;
    this.model.emailLowStock = inventorySection.emailLowStock || false;
    this.model.inventoryTrackingEnabled = inventorySection.inventoryTrackingEnabled || false;
  }

  onChangeCategorySection(categorySection: { categories: NotFullCategory[] }): void {
    this.model.categories = categorySection.categories;
  }

  prepareCategories(): void {
    this.model.categories = (this.model.categories.reduce((acc, notFullCategory: NotFullCategory) => {
      const category = this.allCategories.find((fullCategory: Category) => {
        return notFullCategory.title === fullCategory.title;
      });

      if (category) {
        acc.push(category);
      }

      return acc;
    }, []) as Category[]);
  }

  onChangeChannelsSection(marketplacesSection: ChannelsSection, isChecked: boolean): void {
    if (isChecked) {
      if (!this.model.channelSets.find(item => item.id == marketplacesSection.id)) {
        this.model.channelSets.push(marketplacesSection);
      }
    } else {
      this.model.channelSets = this.model.channelSets.filter(
        (marketplace: ChannelsSection) => marketplace.id !== marketplacesSection.id,
      );
    }
  }

  onChangeTaxesSection(taxes: TaxesSection): void {
    this.model.vatRate = taxes.vatRate;
  }

  onChangeVisibilitySection(visibility: VisibilitySection): void {
    this.model.active = visibility.active;
  }

  onChangeRecurringBillingSection(data: RecurringBillingInterface): void {
    assign(this.recurringBilling, data);
    this.recurringBillingChange$.next(data);
  }

  onChangeRecommendationsSection(data: RecommendationsSection): void {
    if (!data.allowRecommendations) {
      this.model.recommendations = null;

      return;
    }

    this.model.recommendations = {
      tag: data.recommendationTag,
      recommendations: data.currentRecommendations,
    } as RecommendationsInterface;
  }

  onChangeShippingSection(shipping: ShippingSection): void {
    this.model.shipping = shipping;
  }

  onChangeSeoSection(seo: SeoSection): void {
    this.model.seo = seo;
  }

  getVariantAsync(variantId: string, isCreate: boolean): Observable<VariantsSection> {
    if (isCreate || !variantId) {
      return of(this.getVariantData({ id: uuid() }));
    }

    const index = this.model.variants.findIndex((item: VariantsSection) => item.id === variantId);

    if (index > -1) {
      const variantModel = this.model.variants[index];
      // If data not get from inventory DB
      if (typeof variantModel.inventory === 'undefined') {
        return this.api.getInventoryBySKU(variantModel.sku, this.envService.businessId).pipe(
          map(inv => this.getVariantData({
              ...variantModel,
              ...omit(inv, ['id']),
              // in case if inventory not exists yet
              inventory: inv.sku ? inv.stock : variantModel.inventory,
              // in case if inventory not exists yet
              inventoryTrackingEnabled: inv.sku ? inv.isTrackable : variantModel.inventoryTrackingEnabled,
            })
          ),
        );
      } else {
        return of(
          this.getVariantData({
            ...variantModel,
          })
        );
      }
    } else {
      return of(this.getVariantData({ id: uuid() }));
    }
  }

  setVariantAsync(variant: VariantsSection, isCreate: boolean, number?: number): void {
    const modelVariant: any = cloneDeep(variant);
    const businessUuid: string = this.envService.businessId;

    modelVariant.inventory = parseInt(modelVariant.inventory, 10);

    if (isCreate) {
      modelVariant.price = this.model.price || 0;
      let variantNumber = number || this.model.variants.length + 1;

      if (this.model.sku) {
        let sku: string;

        do {
          sku = `${this.model.sku}-${variantNumber}`;
          variantNumber++;
        } while (
          this.model.variants.some(variantModel => variantModel.sku === sku)
        );
        modelVariant.sku = sku;

        const index = findIndex(this.model.variants, (item: VariantsSection) => item.id === modelVariant.id);
        if (index === -1) {
          this.model.variants.push(modelVariant);
        } else {
          this.model.variants[index] = modelVariant;
        }

        this.api.isSkuUsed(modelVariant.sku, businessUuid, modelVariant.id).pipe(
          take(1),
          tap((result) => {
            if (!result) {
              this.currentVariant = modelVariant;
              this.variantsChange$.next(this.model.variants);
            } else {
              this.setVariantAsync(variant, isCreate, variantNumber);
            }
          })
        ).subscribe();
      } else {
        this.model.variants.push(modelVariant);
        this.variantsChange$.next(this.model.variants);
      }
    } else {
      const index: number = findIndex(this.model.variants, (item: VariantsSection) => item.id === variant.id);
      this.model.variants[index] = modelVariant;
    }
    this.currentVariant = modelVariant;
  }

  onChangeAttributesSection(attributes: AttributesSection[]): void {
    this.model.attributes = attributes;
  }

  removeVariant(id: string): void {
    this.model.variants = this.model.variants.filter((variant: VariantsSection) => variant.id !== id);
    this.currentVariant = undefined;
    this.variantsChange$.next(this.model.variants);
  }

  onNextStepMove(): void {
    this.activeSection = this.sectionKeys[this.sectionKeys.indexOf(this.activeSection) + 1];
  }

  checkValidation() {
    this.countryService.checkValidation();
    this.languageService.checkValidation();

    if (this.recurringBillingLoading$.getValue()) {
      this.snackBarService.toggle(
        true,
        {
          content: this.translateService.translate('errors.billingSubscriptionsNotLoadedBeforeSave'),
          duration: 5000,
          iconId: 'icon-alert-24',
          iconSize: 24,
        }
      );

      return of(false);
    }

    this.saveClicked$.next(this.activeSection);
    const id: string = get(this.model, 'id', null);
    this.isSubmitted = true;
    if (id === null) {
      this.saveClicked$.next(this.activeSection);
    }
  }

  // create product
  save(updateModel = false): Observable<boolean> {
    const businessUuid: string = this.envService.businessId;
    const id: string = get(this.model, 'id', null);

    this.checkValidation();
    if (this.sectionsWithErrors.length === 0) {
      this.saveClickedSuccess$.next(true);

      if (!this.countryService.country || !this.languageService.language) {
        return of(false);
      }

      this.isSaved$.next(true);

      return this.api
        .createProduct(
          {
            id,
            images: this.model.images,
            title: this.model.title,
            company: this.envService.businessData.name,
            country: this.countryService.country.code,
            language: this.languageService.language.code,
            description: this.getNormalizedDescription(),
            price: this.model.price,
            priceTable: this.model.priceTable,
            recommendations: this.model.recommendations,
            onSales: this.model.sale.onSales,
            salePrice: this.model.sale.salePrice,
            saleEndDate: this.model.sale.saleEndDate,
            saleStartDate: this.model.sale.saleStartDate,
            vatRate: this.model.vatRate,
            collections: this.model.collections,
            sku: this.model.sku,
            inventory: this.model.inventory,
            lowInventory: this.model.lowInventory,
            emailLowStock: this.model.emailLowStock,
            inventoryTrackingEnabled: this.model.inventoryTrackingEnabled,
            barcode: this.model.barcode,
            categories: this.model.categories,
            type: this.model.productType,
            channelSets: this.getChannelSets(),
            active: this.model.active,
            variants: this.model.variants,
            attributes: this.model.attributes,
            shipping: this.model.shipping,
            seo: this.model.seo,
          } as any,
          businessUuid,
        )
        .pipe(
          switchMap((product) => {
            // Processing Recurring Billing
            const productId: string = id || get(product, 'data.createProduct.id');
            const folderId = this.dataGridService.selectedFolder;

            if (updateModel) {
              this.model = { ...this.model, ...product.data.createProduct };
            }

            if (!this.isEdit && folderId) {
              this.api.moveToFolder(folderId, productId)
                .pipe(take(1)).subscribe();
            }

            let request: Observable<any> = of(null);
            if (this.recurringBilling.url && !isEqual(this.recurringBillingInitial, this.recurringBilling)) {
              if (this.recurringBillingInitial.enabled && !this.recurringBilling.enabled) {
                request = this.api.removeBillingIntegrationProduct(this.recurringBilling.url, businessUuid, productId);
              } else if (this.recurringBilling.enabled && !this.recurringBillingInitial.enabled) {
                request = this.api.addBillingIntegrationProduct(this.recurringBilling.url, businessUuid, {
                  _id: productId,
                  title: this.model.title,
                  price: this.model.price,
                  interval: this.recurringBilling.interval,
                  billingPeriod: Number(this.recurringBilling.billingPeriod),
                });
              } else if (this.recurringBilling.enabled) {
                request = this.api.editBillingIntegrationProduct(this.recurringBilling.url, businessUuid, productId, {
                  interval: this.recurringBilling.interval,
                  billingPeriod: Number(this.recurringBilling.billingPeriod),
                });
              }
            }

            return request.pipe(
              map(() => {
                this.setRecurringBilling(this.recurringBilling);
                this.dataGridService.updateGrid(
                  product.data[this.isEdit ? 'updateProduct' : 'createProduct'],
                  this.isEdit
                );

                return of(product);
              }),
            );
          }),
          mergeMap((createdProduct) => {
            const isNewProductForWidget: boolean =
              this.route.snapshot.queryParams.widgetId && this.router.url.indexOf('products-editor') !== -1;
            if (isNewProductForWidget) {
              const productId: string = get(createdProduct, 'data.createProduct.id');

              return this.apiBuilder.patchWidgetProducts(productId, businessUuid);
            } else {
              return of(createdProduct);
            }
          }),
          finalize(() => this.isSaved$.next(false))
        );
    } else {
      return of(false);
    }
  }

  hasErrors(section: ProductEditorSections): boolean {
    return this.sectionsWithErrors.indexOf(section) !== -1;
  }

  onFindError(hasErrors: boolean, section: ProductEditorSections): void {
    if (hasErrors) {
      if (!this.hasErrors(section)) {
        this.sectionsWithErrors.push(section);
      }
    } else {
      if (this.hasErrors(section)) {
        this.sectionsWithErrors.splice(this.sectionsWithErrors.indexOf(section), 1);
      }
    }
  }

  setProduct(product: ProductModel): void {
    this.model = Object.assign({}, this.model, product);
    this.currentVariant = undefined;
    this.variantsChange$.next(this.model.variants);
  }

  setRecurringBilling(recurringBilling: RecurringBillingInterface): void {
    this.recurringBilling = Object.assign({}, this.recurringBilling, recurringBilling);
    this.recurringBillingInitial = cloneDeep(this.recurringBilling);
  }

  setRecurringBillingLoading(loading: boolean): void {
    this.recurringBillingLoading$.next(loading);
  }

  isSkuUniqAsync(currentSKU?: string): AsyncValidatorFn {
    const businessUuid: string = this.envService.businessId;
    const id: string = get(this.model, 'id', null);
    const CHECK_TIMEOUT = 1000;

    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return timer(CHECK_TIMEOUT).pipe(
        switchMap(() => {
          if (currentSKU === control.value) {
            return of(null);
          } else {
            const error = {
              external: this.translateService.translate('mainSection.form.errors.sku'),
            };

            if (this.model.variants.some(variant => variant.sku === control.value)) {
              return of(error);
            } else {
              return this.api.isSkuUsed(control.value, businessUuid, id).pipe(
                map((result) => {
                  if (result) {
                    return error;
                  }
                }),
              );
            }
          }
        }),
      );
    };
  }

  private getNormalizedDescription(): string {
    return this.model.description.replace(/(\n)/g, '\\n').replace(/"/g, '\"');
  }

  private getChannelSets(): ChannelSetInterface[] {
    const channelSetId: string = this.route.snapshot.queryParams.channelSet;
    const isProductForChannel: boolean = this.route.snapshot.queryParams.prevProductsPath === 'list';
    const currentChannelSet: ChannelSetInterface[] =
      channelSetId && isProductForChannel
        ? [
          {
            id: channelSetId,
            type: this.route.snapshot.queryParams.app, // TODO: Channel
            name: '1',
          },
        ]
        : null;

    const isChecked: boolean =
      this.model.channelSets &&
      this.model.channelSets.length &&
      currentChannelSet &&
      currentChannelSet.length &&
      this.model.channelSets.some((marketplace: ChannelSetInterface) => marketplace.id !== currentChannelSet[0].id);

    if (isChecked) {
      if (this.isEdit) {
        return this.model.channelSets;
      } else {
        return [...this.model.channelSets, ...currentChannelSet];
      }
    } else {
      return currentChannelSet || this.model.channelSets;
    }
  }

  private resetFields(): void {
    this.model = cloneDeep(ProductsApiService.model);
  }

  private resetActiveSection(): void {
    this.activeSection = ProductEditorSections.Main;
  }

  private resetErrors(): void {
    this.sectionsWithErrors = [];
  }

  private resetVariants(): void {
    this.currentVariant = undefined;
    this.variantsChange$.next([]);
  }

  private resetPricing(): void {
    this.model.priceTable = [];
  }

  private resetState(): void {
    this.resetFields();
    this.resetActiveSection();
    this.resetErrors();
    this.resetVariants();
    this.resetPricing();
  }

  private resetSectionErrors(resetSection: ProductEditorSections): void {
    this.sectionsWithErrors = this.sectionsWithErrors.filter(
      (section: ProductEditorSections) => section !== resetSection,
    );
  }

  private getVariantData(patch: Partial<VariantsSection>) {
    const model = {
      ...cloneDeep(ProductsApiService.model),
      ...patch,
    };

    return {
      id: model.id,
      images: model.images,
      options: model.options || [],
      description: model.description,
      price: model.price,
      available: model.available,
      onSales: model.sale?.onSales || null,
      salePrice: model.sale?.salePrice || null,
      saleEndDate: model.sale?.saleEndDate || null,
      saleStartDate: model.sale?.saleStartDate || null,
      productType: model.productType,
      sku: model.sku,
      inventory: model.inventory,
      inventoryTrackingEnabled: model.inventoryTrackingEnabled,
      barcode: model.barcode,
    };
  }

  getUrl(url: any, activatedRoute, id = null) {
    const baseUrl = ['business', this.envService.businessId, 'products', 'list'];
    const productId = activatedRoute.snapshot.parent.params.productId || id;
    const editor = ['products-editor', productId ? 'edit' : 'add'];

    if (productId) { editor.push(productId); }

    editor.push(url);

    return [...baseUrl, { outlets: { editor } }];
  }

  getGroupsOfCustomersSource(groups: any[]): any[] {
    return groups.map((group) => {
      return {
        businessId: this.envService.businessId,
        id: group.id,
        isDefault: false,
        name: group.title,
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
      };
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
