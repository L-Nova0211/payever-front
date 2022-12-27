import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import moment from 'moment';
import { of, merge, forkJoin, Observable, BehaviorSubject, OperatorFunction, concat, Subject } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { EnvService, IdToDataMapper, PeDestroyService } from '@pe/common';
import { Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n';
import { OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeCustomValidators } from '@pe/shared/custom-validators';
import {
  PebTimePickerService,
  PebTimePickerOverlayConfig,
  PeListSectionIntegrationInterface,
  PeListSectionTypesEnum,
  PeListSectionCategoriesEnum,
  PeListSectionButtonTypesEnum,
} from '@pe/ui';

import {
  PeCouponExpandOption,
  PeCouponsArrayNamesEnum,
  PeCouponsStatusEnum,
  PeCouponTypeAppliedToEnum,
  PeCouponTypeBuyXGetYBuyRequirementsTypeEnum,
  PeCouponTypeBuyXGetYGetDiscountTypesEnum,
  PeCouponTypeBuyXGetYItemTypeEnum,
  PeCouponTypeCustomerEligibilityEnum,
  PeCouponTypeEnum,
  PeCouponTypeFreeShippingTypeEnum,
  PeCouponTypeMinimumRequirementsEnum,
} from '../../enums';
import {
  PeCouponInterface,
  PeCouponTypeInterface,
} from '../../interfaces';
import {
  PeCouponsApiService,
  PeCouponsEnvService,
  PeCouponsGridService,
} from '../../services';
import { PeCouponsDatepickerComponent } from '../coupons-datepicker';

import {
  APPLIES_TO,
  AT_A_DISCOUNTED_VALUE,
  BUY_OR_GET_TYPE,
  BUY_REQUIREMENT_TYPE,
  COUPON_TYPES,
  CUSTOMERS_ELIGIBILITY,
  FREE_SHIPPING_TYPE,
  MINIMUM_REQUIREMENTS,
} from './selection-fields.constants';

@Component({
  selector: 'pe-coupon-editor',
  templateUrl: './coupon-editor.component.html',
  styleUrls: ['./coupon-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeCouponEditorComponent implements OnInit {

  private readonly cancelBtn = this.translateService.translate('coupons-app.actions.cancel');
  private readonly closeBtn = this.translateService.translate('coupons-app.actions.close');
  private readonly loadingBtn = this.translateService.translate('coupons-app.actions.loading');
  private readonly saveBtn = this.translateService.translate('coupons-app.actions.save');
  private readonly unknownError = this.translateService.translate('coupons-app.coupon_editor.errors.unknown_error');
  private readonly notFoundError = this.translateService.translate('coupons-app.coupon_editor.errors.not_found');

  public readonly arrayNames = PeCouponsArrayNamesEnum;
  public readonly appliesTo = APPLIES_TO;
  public readonly atADiscountedValue = AT_A_DISCOUNTED_VALUE;
  public readonly buyOrGetType = BUY_OR_GET_TYPE;
  public readonly buyRequirementType = BUY_REQUIREMENT_TYPE;
  public readonly customerEligibility = CUSTOMERS_ELIGIBILITY;
  public readonly freeShippingType = FREE_SHIPPING_TYPE;
  public readonly minimumRequirements = MINIMUM_REQUIREMENTS;
  public readonly types = COUPON_TYPES;
  public readonly integrationList = PeListSectionTypesEnum.Integrations;
  public readonly paymentsCategory = PeListSectionCategoriesEnum.Shopsystems;
  public readonly toggleButtonType = PeListSectionButtonTypesEnum.Toggle;
  public isDiscountOpen = true;
  public isDateOpen = true;
  public loading = false;
  public channelSets$ = new BehaviorSubject<PeListSectionIntegrationInterface[]>([]);

  public couponForm: FormGroup = this.formBuilder.group({
    _id: [null],
    channelSets: [[]],
    code: [],
    customerEligibility: [PeCouponTypeCustomerEligibilityEnum.Everyone],
    customerEligibilityCustomerGroups: [[]],
    customerEligibilitySpecificCustomers: [[]],
    description: [],
    endDate: [],
    endDateDate: [],
    endDateTime: [],
    errorMsg: [],
    setEndDate: [false],
    startDate: [],
    startDateDate: [],
    startDateTime: [],
    status: [PeCouponsStatusEnum.Inactive],
    limits: this.formBuilder.group({
      limitOneUsePerCustomer: [false],
      limitUsage: [false],
      limitUsageAmount: [],
    }),
    name: ['name'],
    type: this.formBuilder.group({
      appliesTo: [PeCouponTypeAppliedToEnum.AllPpoducts],
      appliesToProducts: [[]],
      appliesToCategories: [[]],
      buyRequirementType: [PeCouponTypeBuyXGetYBuyRequirementsTypeEnum.MinimumQuantityOfItems],
      buyQuantity: [],
      buyType: [PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories],
      buyProducts: [[]],
      buyCategories: [[]],
      discountValue: [],
      excludeShippingRatesOverCertainAmount: [false],
      excludeShippingRatesOverCertainAmountValue: [],
      freeShippingType: [PeCouponTypeFreeShippingTypeEnum.AllCountries],
      freeShippingToCountries: [[]],
      getType: [PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories],
      getQuantity: [],
      getProducts: [[]],
      getCategories: [[]],
      getDiscountType: [PeCouponTypeBuyXGetYGetDiscountTypesEnum.Percentage],
      getDiscountValue: [],
      maxUsesPerOrder: [false],
      maxUsesPerOrderValue: [],
      minimumRequirements: [PeCouponTypeMinimumRequirementsEnum.None],
      minimumRequirementsPurchaseAmount: [],
      minimumRequirementsQuantityOfItems: [],
      type: [PeCouponTypeEnum.Percentage],
    }),
  });

  public dateMask = [/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/];
  public timeMask = [/\d/, /\d/, ':', /\d/, /\d/, ' ', /[aApP]/, /[mM]/];
  public readonly theme = this.peOverlayConfig.theme;

  public readonly loading$ = new BehaviorSubject<boolean>(false);
  private readonly filterItems$ = new BehaviorSubject<any[]>([]);
  private readonly setFilter$ = new Subject<{ arrayName: string, filter: string }>();
  private readonly getFilteredData$ = this.setFilter$
    .pipe(
      filter(({ filter }) => {
        const filterValid = filter && typeof filter === 'string' && filter !== '' && filter[0] !== ' ';
        !filterValid && this.filterItems$.next([]);
        this.loading$.next(filterValid);

        return filterValid;
      }),
      debounceTime(400),
      switchMap(({ arrayName, filter }) => {
        switch (arrayName) {
          case PeCouponsArrayNamesEnum.Categories:
            return this.getCategories(filter);
          case PeCouponsArrayNamesEnum.Products:
            return this.getProducts(filter);
          case PeCouponsArrayNamesEnum.Customers:
            return this.getCustomers(filter);
          case PeCouponsArrayNamesEnum.GroupsOfCustomers:
            return this.getGroupsOfCustomers(filter);
          case PeCouponsArrayNamesEnum.Countries:
            return this.getCountries(filter);
          default:
            return of([]);
        }
      }),
      tap(arrayToFilter => {
        this.loading$.value && this.filterItems$.next(arrayToFilter);
        this.loading$.next(false);
      }));

  private readonly getChannels$ = this.peCouponsApiService
    .getChannels()
    .pipe(
      tap((channels: PeListSectionIntegrationInterface[]) => {
        const channelsControl = this.couponForm.controls.channelSets;
        const enabledChannels = channels
          .filter(channel => {
            if (channel.enabled) {
              const channelToAdd = channel._id;
              channelsControl.patchValue([...channelsControl.value, channelToAdd]);
            }

            return channel.enabled;
          });
        this.channelSets$.next(enabledChannels);
      }),
      this.errorHandler());

  private readonly initControlsValidation$ = new Subject<void>();
  private readonly controlsValidationHandler$ = this.initControlsValidation$
    .pipe(
      switchMap(() => {
        const { controls } = this.couponForm;
        const limitsControls = (controls.limits as FormGroup).controls;
        const typeControls = (controls.type as FormGroup).controls;

        return merge(
          controls.customerEligibility.valueChanges,
          controls.setEndDate.valueChanges,
          limitsControls.limitUsage.valueChanges,
          typeControls.appliesTo.valueChanges,
          typeControls.buyRequirementType.valueChanges,
          typeControls.buyType.valueChanges,
          typeControls.excludeShippingRatesOverCertainAmount.valueChanges,
          typeControls.freeShippingType.valueChanges,
          typeControls.getDiscountType.valueChanges,
          typeControls.getType.valueChanges,
          typeControls.maxUsesPerOrder.valueChanges,
          typeControls.minimumRequirements.valueChanges,
          typeControls.type.valueChanges,
          of(null),
        );
      }),
      tap(() => {
        const { controls } = this.couponForm;
        const limitsControls = (controls.limits as FormGroup).controls;
        const typeControls = (controls.type as FormGroup).controls;

        switch (typeControls.type.value) {
          case PeCouponTypeEnum.FixedAmount:
          case PeCouponTypeEnum.Percentage:
            typeControls.discountValue.enable();

            switch (typeControls.appliesTo.value) {
              case PeCouponTypeAppliedToEnum.SpecificCategories:
                typeControls.appliesToProducts.disable();
                typeControls.appliesToCategories.enable();
                break;
              case PeCouponTypeAppliedToEnum.SpecificProducts:
                typeControls.appliesToCategories.disable();
                typeControls.appliesToProducts.enable();
                break;
              default:
                typeControls.appliesToCategories.disable();
                typeControls.appliesToProducts.disable();
                break;
            }
            break;
          default:
            typeControls.appliesToCategories.disable();
            typeControls.appliesToProducts.disable();
            typeControls.discountValue.disable();
            break;
        }

        switch (typeControls.type.value) {
          case PeCouponTypeEnum.FreeShipping:
            switch (typeControls.freeShippingType.value) {
              case PeCouponTypeFreeShippingTypeEnum.SelectedCountries:
                typeControls.freeShippingToCountries.enable();
                break;
              default:
                typeControls.freeShippingToCountries.disable();
                break;
            }

            if (typeControls.excludeShippingRatesOverCertainAmount.value) {
              typeControls.excludeShippingRatesOverCertainAmountValue.enable();
            } else {
              typeControls.excludeShippingRatesOverCertainAmountValue.disable();
            }
            break;
          default:
            typeControls.freeShippingToCountries.disable();
            typeControls.excludeShippingRatesOverCertainAmountValue.disable();
            break;
        }

        switch (typeControls.type.value) {
          case PeCouponTypeEnum.BuyXGetY:
            typeControls.buyQuantity.enable();
            typeControls.getQuantity.enable();
            typeControls.minimumRequirementsPurchaseAmount.disable();
            typeControls.minimumRequirementsQuantityOfItems.disable();

            switch (typeControls.buyType.value) {
              case PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories:
                typeControls.buyProducts.disable();
                typeControls.buyCategories.enable();
                break;
              case PeCouponTypeBuyXGetYItemTypeEnum.SpecificProducts:
                typeControls.buyCategories.disable();
                typeControls.buyProducts.enable();
                break;
            }

            switch (typeControls.getType.value) {
              case PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories:
                typeControls.getProducts.disable();
                typeControls.getCategories.enable();
                break;
              case PeCouponTypeBuyXGetYItemTypeEnum.SpecificProducts:
                typeControls.getCategories.disable();
                typeControls.getProducts.enable();
                break;
            }

            switch (typeControls.getDiscountType.value) {
              case PeCouponTypeBuyXGetYGetDiscountTypesEnum.Percentage:
                typeControls.getDiscountValue.enable();
                break;
              default:
                typeControls.getDiscountValue.disable();
                break;
            }

            if (typeControls.maxUsesPerOrder.value) {
              typeControls.maxUsesPerOrderValue.enable();
            } else {
              typeControls.maxUsesPerOrderValue.disable();
            }
            break;
          default:
            typeControls.buyCategories.disable();
            typeControls.buyProducts.disable();
            typeControls.buyQuantity.disable();
            typeControls.getCategories.disable();
            typeControls.getProducts.disable();
            typeControls.getQuantity.disable();
            typeControls.getDiscountValue.disable();
            typeControls.maxUsesPerOrderValue.disable();

            switch (typeControls.minimumRequirements.value) {
              case PeCouponTypeMinimumRequirementsEnum.MinimumPurchaseAmount:
                typeControls.minimumRequirementsQuantityOfItems.disable();
                typeControls.minimumRequirementsPurchaseAmount.enable();
                break;
              case PeCouponTypeMinimumRequirementsEnum.MinimumQuantityOfItems:
                typeControls.minimumRequirementsPurchaseAmount.disable();
                typeControls.minimumRequirementsQuantityOfItems.enable();
                break;
              default:
                typeControls.minimumRequirementsPurchaseAmount.disable();
                typeControls.minimumRequirementsQuantityOfItems.disable();
                break;
            }
            break;
        }

        switch (controls.customerEligibility.value) {
          case PeCouponTypeCustomerEligibilityEnum.SpecificCustomers:
            controls.customerEligibilityCustomerGroups.disable();
            controls.customerEligibilitySpecificCustomers.enable();
            break;
          case PeCouponTypeCustomerEligibilityEnum.SpecificGroupsOfCustomers:
            controls.customerEligibilitySpecificCustomers.disable();
            controls.customerEligibilityCustomerGroups.enable();
            break;
          default:
            controls.customerEligibilitySpecificCustomers.disable();
            controls.customerEligibilityCustomerGroups.disable();
            break;
        }

        if (limitsControls.limitUsage.value) {
          limitsControls.limitUsageAmount.enable();
        } else {
          limitsControls.limitUsageAmount.disable();
        }

        if (controls.setEndDate.value) {
          controls.endDateDate.enable();
          controls.endDateTime.enable();
        } else {
          controls.endDateDate.disable();
          controls.endDateTime.disable();
        }

        controls.customerEligibilityCustomerGroups.setValidators([PeCustomValidators.MinArrayLength(1)]);
        controls.customerEligibilityCustomerGroups.updateValueAndValidity();
        controls.customerEligibilitySpecificCustomers.setValidators([PeCustomValidators.MinArrayLength(1)]);
        controls.customerEligibilitySpecificCustomers.updateValueAndValidity();

        controls.endDateDate.updateValueAndValidity();
        controls.endDateTime.updateValueAndValidity();

        limitsControls.limitUsageAmount.setValidators([PeCustomValidators.PositiveInteger(1), Validators.required]);
        limitsControls.limitUsageAmount.updateValueAndValidity();

        typeControls.appliesToCategories.setValidators([PeCustomValidators.MinArrayLength(1)]);
        typeControls.appliesToCategories.updateValueAndValidity();
        typeControls.appliesToProducts.setValidators([PeCustomValidators.MinArrayLength(1)]);
        typeControls.appliesToProducts.updateValueAndValidity();
        const maxDiscountValue = typeControls.type.value === PeCouponTypeEnum.Percentage
          ? 100
          : null;
        typeControls.discountValue.setValidators([
          PeCustomValidators.PositiveNumber(0, true),
          Validators.max(maxDiscountValue),
          Validators.required,
        ]);
        typeControls.discountValue.updateValueAndValidity();

        typeControls.excludeShippingRatesOverCertainAmountValue.setValidators([
          PeCustomValidators.PositiveNumber(0, true),
          Validators.required,
        ]);
        typeControls.excludeShippingRatesOverCertainAmountValue.updateValueAndValidity();
        typeControls.freeShippingToCountries.setValidators([PeCustomValidators.MinArrayLength(1)]);
        typeControls.freeShippingToCountries.updateValueAndValidity();

        typeControls.getDiscountValue.setValidators([
          PeCustomValidators.PositiveNumber(0, true),
          Validators.max(100),
          Validators.required,
        ]);
        typeControls.getDiscountValue.updateValueAndValidity();

        typeControls.buyCategories.setValidators([PeCustomValidators.MinArrayLength(1)]);
        typeControls.buyCategories.updateValueAndValidity();
        typeControls.buyProducts.setValidators([PeCustomValidators.MinArrayLength(1)]);
        typeControls.buyProducts.updateValueAndValidity();
        const buyQuantityValidator = typeControls.buyRequirementType.value
          === PeCouponTypeBuyXGetYBuyRequirementsTypeEnum.MinimumPurchaseAmount
            ? PeCustomValidators.PositiveNumber(0, true)
            : PeCustomValidators.PositiveInteger(1);
        typeControls.buyQuantity.setValidators([
          buyQuantityValidator,
          Validators.required,
        ]);
        typeControls.buyQuantity.updateValueAndValidity();

        typeControls.getCategories.setValidators([PeCustomValidators.MinArrayLength(1)]);
        typeControls.getCategories.updateValueAndValidity();
        typeControls.getProducts.setValidators([PeCustomValidators.MinArrayLength(1)]);
        typeControls.getProducts.updateValueAndValidity();
        typeControls.getQuantity.setValidators([PeCustomValidators.PositiveInteger(1), Validators.required]);
        typeControls.getQuantity.updateValueAndValidity();
        typeControls.maxUsesPerOrderValue.setValidators([PeCustomValidators.PositiveInteger(1), Validators.required]);
        typeControls.maxUsesPerOrderValue.updateValueAndValidity();

        typeControls.minimumRequirementsPurchaseAmount.setValidators([
          PeCustomValidators.PositiveNumber(0, true),
          Validators.required,
        ]);
        typeControls.minimumRequirementsPurchaseAmount.updateValueAndValidity();
        typeControls.minimumRequirementsQuantityOfItems.setValidators([
          PeCustomValidators.PositiveInteger(1),
          Validators.required,
        ]);
        typeControls.minimumRequirementsQuantityOfItems.updateValueAndValidity();
      }));

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private matDialog: MatDialog,

    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    private envService: EnvService,
    private pebTimePickerService: PebTimePickerService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private peCouponsApiService: PeCouponsApiService,
    private peCouponsEnvService: PeCouponsEnvService,
    private peCouponsGridService: PeCouponsGridService,
  ) {
    this.loading = true;
    this.peCouponsGridService.backdropClick = this.closeEditor;
    this.peOverlayConfig.backBtnCallback = this.closeEditor;
    this.peOverlayConfig.doneBtnCallback = () => {
      !this.loading && this.onSave();
    };
    this.peOverlayConfig.doneBtnTitle = this.loadingBtn;
    this.peOverlayConfig.isLoading = true;
  }

  public get isStartDateValid(): boolean {
    const controls = this.couponForm.controls;
    const startDate = controls.startDateDate.value;
    const startTime = controls.startDateTime.value;
    const isStartDateValid = moment(startDate, 'DD.MM.YYYY').isValid();
    const isStartTimeValid = moment(startTime, 'HH:mm').isValid();

    return isStartDateValid && isStartTimeValid;
  }

  public get type(): FormGroup {
    return this.couponForm.controls.type as FormGroup;
  }

  ngOnInit(): void {
    const couponId = this.peOverlayData?.id;
    const getCoupon$ = couponId
      ? this.getCoupon(couponId)
      : of(null);
    const initCouponForm$ = forkJoin([
      concat(
        this.getChannels$,
        getCoupon$,
      ),
    ]).pipe(
      tap(() => {
        this.loading = false;
        this.peOverlayConfig.doneBtnTitle = this.saveBtn;
        this.peOverlayConfig.isLoading = false;
        this.cdr.markForCheck();
        this.couponForm.markAsPristine();
      }));

    merge(
      initCouponForm$,
      this.controlsValidationHandler$,
      this.getFilteredData$,
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  public maskRule(currentMask: any[]): any {
    return {
      guide: false,
      mask: currentMask,
      showMask: false,
    };
  }

  private readonly closeEditor = () => {
    if (this.couponForm.dirty) {
      this.peCouponsGridService.confirmation$
        .pipe(
          take(1),
          filter(Boolean),
          tap(() => {
            this.peOverlayWidgetService.close();
          }),
          takeUntil(this.destroy$))
        .subscribe();

      const couponId = this.peOverlayData?._id;
      const headingTitle = couponId
        ? 'coupons-app.confirm_dialog.cancel.coupon_editor.editing.title'
        : 'coupons-app.confirm_dialog.cancel.coupon_editor.creating.title';
      const headingSubtitle = couponId
        ? 'coupons-app.confirm_dialog.cancel.coupon_editor.editing.subtitle'
        : 'coupons-app.confirm_dialog.cancel.coupon_editor.creating.subtitle';
      const config: Headings = {
        title: this.translateService.translate(headingTitle),
        subtitle: this.translateService.translate(headingSubtitle),
        confirmBtnText: this.closeBtn,
        declineBtnText: this.cancelBtn,
      };

      this.peCouponsGridService.openConfirmDialog(config);
    } else {
      this.peOverlayWidgetService.close();
    }
  }

  private errorHandler(): OperatorFunction<any, any> {
    return catchError(() => of([]));
  }

  public filteredItems(control: AbstractControl) {
    return this.filterItems$
      .pipe(
        map(arrayToFilter => arrayToFilter
          .filter(item => {
            const itemId = item?._id ?? item?.id;

            return !control.value
              .some(controlItem => controlItem?._id === itemId || controlItem?.id === itemId);
          })));
  }

  private getCategories(filter: string = ''): Observable<any> {
    return this.peCouponsApiService
      .getCategories(filter)
      .pipe(this.errorHandler());
  }

  private getProducts(filter: string = ''): Observable<any> {
    return this.peCouponsApiService
      .getProducts(filter)
      .pipe(this.errorHandler());
  }

  private getGroupsOfCustomers(filter: string = ''): Observable<any> {
    return this.peCouponsApiService
      .getContactsGroups(filter)
      .pipe(this.errorHandler());
  }

  private getCustomers(filter: string = ''): Observable<any> {
    return this.peCouponsApiService
      .getContacts(filter)
      .pipe(this.errorHandler());
  }

  private getCountries(filter: string = ''): Observable<any> {
    return this.peCouponsEnvService
      .getCountries()
      .pipe(
        map(countries => countries
          .filter(country => country.title
            .toLowerCase()
            .includes(filter.toLowerCase()))));
  }

  private getCoupon(couponId: string): Observable<any> {
    return this.peCouponsApiService
      .getCoupon(couponId)
      .pipe(
        switchMap((coupon: PeCouponInterface) => {
          const type = coupon.type;
          const categories = type.appliesToCategories || type.buyCategories || type.getCategories;
          const products = type.appliesToProducts || type.buyProducts || type.getProducts;
          const countries = type.freeShippingToCountries;
          const groups = coupon.customerEligibilityCustomerGroups;
          const customers = coupon.customerEligibilitySpecificCustomers;

          return forkJoin([
            of(coupon),
            categories && categories.length
              ? this.getCategories()
              : of(null),
            products && products.length
              ? this.getProducts()
              : of(null),
            groups && groups.length
              ? this.getGroupsOfCustomers()
              : of(null),
            customers && customers.length
              ? this.getCustomers()
              : of(null),
            countries && countries.length
              ? this.getCountries()
              : of(null),
          ]);
        }),
        tap(([coupon, categories, products, groupsOfCustomers, customers, countries]) => {
          const type = coupon.type;

          if (countries) {
            type.freeShippingToCountries = IdToDataMapper(type.freeShippingToCountries as string[], countries);
          }

          if (type.appliesToCategories?.length) {
            type.appliesToCategories = IdToDataMapper(type.appliesToCategories as string[], categories);
          }

          if (type.buyCategories?.length) {
            type.buyCategories = IdToDataMapper(type.buyCategories as string[], categories);
          }

          if (type.getCategories?.length) {
            type.getCategories = IdToDataMapper(type.getCategories as string[], categories);
          }

          if (type.appliesToProducts?.length) {
            type.appliesToProducts = IdToDataMapper(type.appliesToProducts as string[], products);
          }

          if (type.buyProducts?.length) {
            type.buyProducts = IdToDataMapper(type.buyProducts as string[], products);
          }

          if (type.getProducts?.length) {
            type.getProducts = IdToDataMapper(type.getProducts as string[], products);
          }

          if (groupsOfCustomers) {
            coupon.customerEligibilityCustomerGroups = IdToDataMapper(
              coupon.customerEligibilityCustomerGroups as string[],
              groupsOfCustomers,
            );
          }

          if (customers) {
            coupon.customerEligibilitySpecificCustomers = IdToDataMapper(
              coupon.customerEligibilitySpecificCustomers as string[],
              customers,
            );
          }

          const channelSets = this.channelSets$.value.map(channel => {
            channel.enabled = coupon.channelSets.some(channelSetId => channelSetId === channel._id);

            return channel;
          });

          this.couponForm.patchValue(coupon);
          this.channelSets$.next(channelSets);

          const { controls } = this.couponForm;
          controls.code.disable();

          if (coupon.startDate) {
            controls.startDateDate.patchValue(moment(coupon.startDate).format('DD.MM.YYYY'));
            controls.startDateTime.patchValue(moment(coupon.startDate).format('HH:mm'));
          }

          if (coupon.endDate) {
            controls.setEndDate.patchValue(true);
            controls.endDateDate.patchValue(moment(coupon.endDate).format('DD.MM.YYYY'));
            controls.endDateTime.patchValue(moment(coupon.endDate).format('HH:mm'));
          }

          this.cdr.markForCheck();
        }),
        catchError(error => {
          this.peOverlayConfig.doneBtnTitle = this.saveBtn;
          this.peOverlayConfig.isLoading = false;
          this.loading = false;
          const notFound = error?.error?.message.includes('found');
          notFound && this.couponForm.controls._id.patchValue(null);
          const errMsg = notFound
            ? this.notFoundError.replace('{couponId}', couponId)
            : this.unknownError;
          this.couponForm.controls.errorMsg.setValue(errMsg);
          this.cdr.markForCheck();

          return of(true);
        }));
  }

  public addToArray(element: any, control: AbstractControl): void {
    const elementId = element?.id ?? element?._id;
    !control.value.some(el => el?.id === elementId || el?._id === elementId) && control.value.push(element);
    control.updateValueAndValidity();
    control.markAsDirty();
  }

  public removeFromArray(control: AbstractControl, index: number): void {
    control.value.splice(index, 1);
    control.updateValueAndValidity();
    control.markAsDirty();
  }

  public trackItem(index: number, item: any) {
    return item?.id || item?._id;
  }

  public setFilter(filter: string, arrayName: string): void {
    this.setFilter$.next({ arrayName, filter });
  }

  public generateCode(): void {
    const code = this.peCouponsEnvService.generateCode();
    this.couponForm.controls.code.patchValue(code.toUpperCase());
  }

  public openDatepicker(dateControl: AbstractControl): void {
    const currentDate = dateControl.value;
    const setDate = moment(currentDate, 'DD.MM.YYYY');
    const validDate = setDate.isValid() ? setDate.toDate() : null;
    const config: MatDialogConfig = {
      panelClass: `datepicker-${this.theme}`,
      data: validDate,
    };

    this.matDialog
      .open(PeCouponsDatepickerComponent, config)
      .afterClosed()
      .pipe(
        take(1),
        tap(value => {
          if (value) {
            const date = moment(value).format('DD.MM.YYYY');
            dateControl.patchValue(date);
            dateControl.markAsDirty();
            this.cdr.markForCheck();
          }
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public openTimepicker(event: MouseEvent, timeControl: AbstractControl): void {
    const currentTime = timeControl.value;
    const setTime = moment(currentTime, 'HH:mm');
    const validTime = setTime.isValid() ? setTime : moment(new Date(), 'HH:mm');
    const timeToCorrect = validTime.format('HH:mm').toString();
    const config: PebTimePickerOverlayConfig = {
      theme: this.theme,
      position: {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetX: 18,
        offsetY: -12,
      },
      timeConfig: {
        animation: 'fade',
        time: timeToCorrect,
      },
    };

    this.pebTimePickerService
      .open(event, config)
      .afterClosed
      .pipe(
        take(1),
        tap(value => {
          const time = value ? value : timeToCorrect;
          timeControl.patchValue(time);
          timeControl.markAsDirty();
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private onSave(): void {
    this.initControlsValidation$.next();
    const { controls } = this.couponForm;
    const limitsControls = (controls.limits as FormGroup).controls;
    const typeControls = (controls.type as FormGroup).controls;
    const typeFormGroup = controls.type as FormGroup;

    controls.code.enable();
    controls.errorMsg.setValue(null);
    this.cdr.markForCheck();

    controls.code.setValidators([Validators.required]);
    controls.description.setValidators([Validators.required]);
    controls.name.setValidators([Validators.required]);
    controls.startDateDate.setValidators([Validators.required]);
    controls.startDateTime.setValidators([Validators.required]);

    controls.code.updateValueAndValidity();
    controls.description.updateValueAndValidity();
    controls.name.updateValueAndValidity();
    controls.startDateDate.updateValueAndValidity();
    controls.startDateTime.updateValueAndValidity();

    const startFullDate = `${controls.startDateDate.value} ${controls.startDateTime.value}`;
    const startDate = moment(startFullDate, 'DD.MM.YYYY HH:mm:ss');
    const periodOfValidity: { startDate: Date, endDate?: Date } = {
      startDate: startDate.toDate(),
    };

    if (controls.setEndDate.value) {
      controls.endDateDate.setValidators([Validators.required]);
      controls.endDateTime.setValidators([Validators.required]);
      const endFullTime = `${controls.endDateDate.value} ${controls.endDateTime.value}`;
      const endDate = moment(endFullTime, 'DD.MM.YYYY HH:mm:ss');
      const startDateDate = moment(controls.startDateDate.value, 'DD.MM.YYYY');
      const endDateDate = moment(controls.endDateDate.value, 'DD.MM.YYYY');
      endDateDate.isBefore(startDateDate) && controls.endDateDate.setErrors({ isBefore: true });
      startDate.isSameOrAfter(endDate) && controls.endDateTime.setErrors({ isBefore: true });
      controls.endDateDate.updateValueAndValidity();
      controls.endDateTime.updateValueAndValidity();
      periodOfValidity.endDate = endDate.toDate();
    }

    const status = controls.setEndDate.value
      ? moment(moment()).isBetween(startDate.toDate(), periodOfValidity.endDate, 'minute')
      : moment(moment()).isAfter(startDate.toDate(), 'minute');
    const { dirty, invalid, valid } = this.couponForm;

    if (dirty && valid) {
      const { customerEligibility } = controls;
      const customers = customerEligibility.value === PeCouponTypeCustomerEligibilityEnum.SpecificCustomers
        ? controls.customerEligibilitySpecificCustomers.value.map(customer => customer._id)
        : [];
      const groups = customerEligibility.value === PeCouponTypeCustomerEligibilityEnum.SpecificGroupsOfCustomers
        ? controls.customerEligibilityCustomerGroups.value.map(group => group._id)
        : [];
      const minimumRequirements = typeControls.type.value !== PeCouponTypeEnum.BuyXGetY
        ? {
            minimumRequirements: typeControls.minimumRequirements.value,
            minimumRequirementsPurchaseAmount: Number(typeControls.minimumRequirementsPurchaseAmount.value),
            minimumRequirementsQuantityOfItems: Number(typeControls.minimumRequirementsQuantityOfItems.value),
          }
        : { };

      const coupon: PeCouponInterface = {
        code: controls.code.value,
        description: controls.description.value,
        name: controls.name.value,
        channelSets: controls.channelSets.value,
        customerEligibility: controls.customerEligibility.value,
        customerEligibilitySpecificCustomers: customers,
        customerEligibilityCustomerGroups: groups,
        limits: {
          limitOneUsePerCustomer: limitsControls.limitOneUsePerCustomer.value,
          limitUsage: limitsControls.limitUsage.value,
          limitUsageAmount: Number(limitsControls.limitUsageAmount.value),
        },
        type: {
          type: typeControls.type.value,
          ...minimumRequirements,
        },
        status: status ? PeCouponsStatusEnum.Active : PeCouponsStatusEnum.Inactive,
        ...periodOfValidity,
      };

      switch (typeControls.type.value) {
        case PeCouponTypeEnum.Percentage:
          Object.assign(coupon.type, this.getPercentageOrFixedAmount(typeFormGroup));
          break;
        case PeCouponTypeEnum.FixedAmount:
          Object.assign(coupon.type, this.getPercentageOrFixedAmount(typeFormGroup));
          break;
        case PeCouponTypeEnum.FreeShipping:
          Object.assign(coupon.type, this.getFreeShipping(typeFormGroup));
          break;
        case PeCouponTypeEnum.BuyXGetY:
          Object.assign(coupon.type, this.getBuyXGetY(typeFormGroup));
          break;
      }

      of(controls._id.value)
        .pipe(
          switchMap(couponId => {
            this.peOverlayConfig.doneBtnTitle = this.loadingBtn;
            this.peOverlayConfig.isLoading = true;
            this.loading = true;
            this.cdr.detectChanges();

            return Boolean(couponId)
              ? this.peCouponsApiService.updateCoupon(couponId, coupon)
              : this.peCouponsApiService.createCoupon(coupon);
          }),
          tap(coupon => {
            this.peOverlayConfig.onSaveSubject$.next(coupon);
          }),
          catchError(error => {
            this.peOverlayConfig.doneBtnTitle = this.saveBtn;
            this.peOverlayConfig.isLoading = false;
            this.loading = false;
            if (error?.error?.message.includes('unique')) {
              controls.code.setErrors({ isNotUnique: true });
            } else {
              controls.errorMsg.setValue(this.unknownError);
            }
            this.cdr.markForCheck();

            return of(true);
          }),
          takeUntil(this.destroy$))
        .subscribe();
    } else if (dirty || invalid) {
      if (controls._id.value) {
        controls.code.disable();
        controls.code.updateValueAndValidity();
      }

      const openSection = (option: string, openAll = false, isDiscountExpanded = true) => {
        this.isDiscountOpen = openAll || option === PeCouponExpandOption.Discount;
        this.isDateOpen = openAll || option === PeCouponExpandOption.Date || isDiscountExpanded;
      };

      switch ('INVALID') {
        case controls.description.status:
        case controls.code.status:
        case controls.type.status:
          openSection(PeCouponExpandOption.Discount);
          break;
        case controls.startDateDate.status:
        case controls.startDateTime.status:
          openSection(PeCouponExpandOption.Date);
          break;
        default:
          openSection('', true);
          break;
      }

      this.cdr.detectChanges();
    } else {
      this.isDateOpen = true;
      this.isDiscountOpen = true;
      this.peOverlayWidgetService.close();
    }
  }

  private getPercentageOrFixedAmount(typeFormGroup: FormGroup): PeCouponTypeInterface {
    const typeControlsValue = typeFormGroup.value;
    const categories = typeControlsValue.appliesTo === PeCouponTypeAppliedToEnum.SpecificCategories
      ? typeControlsValue.appliesToCategories.map(category => category._id)
      : [];
    const products = typeControlsValue.appliesTo === PeCouponTypeAppliedToEnum.SpecificProducts
      ? typeControlsValue.appliesToProducts.map(product => product._id)
      : [];

    return {
      type: typeControlsValue.type,
      discountValue: Number(typeControlsValue.discountValue),
      appliesTo: typeControlsValue.appliesTo,
      appliesToProducts: products,
      appliesToCategories: categories,
    };
  }

  private getFreeShipping(typeFormGroup: FormGroup): PeCouponTypeInterface {
    const typeControls = typeFormGroup.controls;
    const typeControlsValue = typeFormGroup.value;
    const conutries = typeControls.freeShippingType.value === PeCouponTypeFreeShippingTypeEnum.SelectedCountries
      ? typeControlsValue.freeShippingToCountries.map(country => country._id)
      : [];

    return {
      type: typeControlsValue.type,
      freeShippingToCountries: conutries,
      freeShippingType: typeControlsValue.freeShippingType,
      excludeShippingRatesOverCertainAmount: typeControlsValue.excludeShippingRatesOverCertainAmount ?? false,
      excludeShippingRatesOverCertainAmountValue: Number(typeControlsValue.excludeShippingRatesOverCertainAmountValue),
    };
  }

  private getBuyXGetY(typeFormGroup: FormGroup): PeCouponTypeInterface {
    const typeControlsValue = typeFormGroup.value;
    const buyAmount = typeControlsValue.buyRequirementType
      === PeCouponTypeBuyXGetYBuyRequirementsTypeEnum.MinimumPurchaseAmount
        ? Number(typeControlsValue.buyQuantity)
        : null;
    const buyQuantity = typeControlsValue.buyRequirementType
      === PeCouponTypeBuyXGetYBuyRequirementsTypeEnum.MinimumQuantityOfItems
        ? Number(typeControlsValue.buyQuantity)
        : null;
    const buyCategories = typeControlsValue.buyType === PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories
      ? typeControlsValue.buyCategories.map(category => category._id)
      : [];
    const buyProducts = typeControlsValue.buyType === PeCouponTypeBuyXGetYItemTypeEnum.SpecificProducts
      ? typeControlsValue.buyProducts.map(product => product._id)
      : [];
    const getCategories = typeControlsValue.getType === PeCouponTypeBuyXGetYItemTypeEnum.SpecificCategories
      ? typeControlsValue.getCategories.map(category => category._id)
      : [];
    const getProducts = typeControlsValue.getType === PeCouponTypeBuyXGetYItemTypeEnum.SpecificProducts
      ? typeControlsValue.getProducts.map(product => product._id)
      : [];

    return {
      buyAmount: buyAmount,
      buyCategories: buyCategories,
      buyProducts: buyProducts,
      buyQuantity: buyQuantity,
      buyRequirementType: typeControlsValue.buyRequirementType,
      buyType: typeControlsValue.buyType,
      getCategories: getCategories,
      getDiscountType: typeControlsValue.getDiscountType,
      getDiscountValue: Number(typeControlsValue.getDiscountValue),
      getProducts: getProducts,
      getQuantity: Number(typeControlsValue.getQuantity),
      getType: typeControlsValue.getType,
      maxUsesPerOrder: typeControlsValue.maxUsesPerOrder,
      maxUsesPerOrderValue: Number(typeControlsValue.maxUsesPerOrderValue),
      type: typeControlsValue.type,
    };
  }

  public switchChannel(integration: PeListSectionIntegrationInterface): void {
    const { _id, enabled } = integration;
    const channels = this.channelSets$.value;
    const index = channels.findIndex(integration => integration._id === _id);
    channels[index].enabled = !enabled;
    this.channelSets$.next(channels);
    const controls = this.couponForm.controls;
    const channelsSet = !enabled
      ? [...controls.channelSets.value, _id]
      : controls.channelSets.value.filter(channelSetId => channelSetId !== _id);
    controls.channelSets.patchValue(channelsSet);
    controls.channelSets.markAsDirty();
  }
}
