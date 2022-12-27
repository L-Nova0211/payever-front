import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import cloneDeep from 'lodash/cloneDeep';
import { BehaviorSubject, concat, forkJoin, merge, Observable, of, OperatorFunction, Subject } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { IdToDataMapper, PeDestroyService } from '@pe/common';
import { Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import {
  OverlayHeaderConfig,
  PeOverlayWidgetService,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
} from '@pe/overlay-widget';
import { PeCustomValidators } from '@pe/shared/custom-validators';
import {
  PeListSectionButtonTypesEnum,
  PeListSectionCategoriesEnum,
  PeListSectionIntegrationInterface,
  PeListSectionTypesEnum,
} from '@pe/ui';

import {
  PeSubscriptionsPlanAppliesToEnum,
  PeSubscriptionsPlanArrayNamesEnum,
  PeSubscriptionsPlanBillingIntervalsEnum,
  PeSubscriptionsPlanEligibilityEnum,
} from '../../enums';
import {
  PeSubscriptionsPlanInterface,
} from '../../interfaces';
import {
  PeSubscriptionsApiService,
  PeSubscriptionsConnectionApiService,
  PeSubscriptionsGridService,
} from '../../services';

import { APPLIES_TO, INTERVALS, SUBSCRIBERS_ELIGIBILITY } from './selection-fields.constants';

@Component({
  selector: 'pe-subscriptions-plan',
  templateUrl: './plan-editor.component.html',
  styleUrls: ['../form-preloader.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeSubscriptionsPlanEditorComponent implements OnInit {
  
  private readonly cancelBtn = this.translateService.translate('subscriptions-app.actions.cancel');
  private readonly closeBtn = this.translateService.translate('subscriptions-app.actions.close');
  private readonly loadingBtn = this.translateService.translate('subscriptions-app.actions.loading');
  private readonly saveBtn = this.translateService.translate('subscriptions-app.actions.save');

  public readonly theme = this.peOverlayConfig.theme;

  public readonly integrationList = PeListSectionTypesEnum.Integrations;
  public readonly paymentsCategory = PeListSectionCategoriesEnum.Payments;
  public readonly toggleButtonType = PeListSectionButtonTypesEnum.Toggle;

  public readonly appliesTo = APPLIES_TO;
  public readonly subscribersEligibility = SUBSCRIBERS_ELIGIBILITY;
  public readonly intervalOptions = INTERVALS;

  public arrayNames = PeSubscriptionsPlanArrayNamesEnum;
  public loading = false;
  public planAppliesTo = PeSubscriptionsPlanAppliesToEnum;
  public planEligibility = PeSubscriptionsPlanEligibilityEnum;
  public subscribedChannelSets$ = new BehaviorSubject<PeListSectionIntegrationInterface[]>([]);
  public subscriptionPlanForm: FormGroup = this.formBuilder.group({
    _id: [],
    appliesTo: [PeSubscriptionsPlanAppliesToEnum.AllProducts],
    billingInterval: [PeSubscriptionsPlanBillingIntervalsEnum.Month],
    billingPeriod: [],
    categories: [[]],
    channelSet: [],
    groups: [[]],
    name: [],
    subscribedChannelSets: [[]],
    paymentOptions: [],
    planType: [],
    products: [[]],
    subscribersEligibility: [PeSubscriptionsPlanEligibilityEnum.Everyone],
    subscribers: [[]],
    subscribersTotals: [],
    totalPrice: [],
    trialPeriod: [false],
    trialPeriodDuration: [],
  });

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
          case PeSubscriptionsPlanArrayNamesEnum.Categories:
            return this.getCategories(filter);
          case PeSubscriptionsPlanArrayNamesEnum.Products:
            return this.getProducts(filter);
          case PeSubscriptionsPlanArrayNamesEnum.Subscribers:
            return this.getSubscribers(filter);
          case PeSubscriptionsPlanArrayNamesEnum.GroupsOfSubscribers:
            return this.getSubscribersGroups(filter);
          default:
            return of([]);
        }
      }),
      tap(arrayToFilter => {
        this.loading$.value && this.filterItems$.next(arrayToFilter);
        this.loading$.next(false);
      }));

  public readonly getPayments$ = this.peSubscriptionsConnectionApiService
    .getConnections()
    .pipe(
      tap((subscribedChannelSets: PeListSectionIntegrationInterface[]) => {
        const subscribedChannelSetsControl = this.subscriptionPlanForm.controls.subscribedChannelSets;
        const enabledSubscribedChannelSets = subscribedChannelSets
          .filter(subscribedChannelSet => {
            subscribedChannelSet.enabled && subscribedChannelSetsControl
              .patchValue([
                ...subscribedChannelSetsControl.value,
                subscribedChannelSet._id,
              ]);

            return subscribedChannelSet.enabled;
          });
        this.subscribedChannelSets$.next(enabledSubscribedChannelSets);
      }),
      this.errorHandler());

  private readonly initControlsValidation$ = new Subject<void>();
  private readonly controlsValidationHandler$ = this.initControlsValidation$
    .pipe(
      switchMap(() => {
        const { controls } = this.subscriptionPlanForm;

        return merge(
          controls.appliesTo.valueChanges,
          controls.subscribersEligibility.valueChanges,
          of(null),
        );
      }),
      tap(() => {
        const { controls } = this.subscriptionPlanForm;

        switch (controls.appliesTo.value) {
          case PeSubscriptionsPlanAppliesToEnum.SpecificProducts:
            controls.categories.disable();
            controls.products.enable();
            break;
          case PeSubscriptionsPlanAppliesToEnum.SpecificCategories:
            controls.products.disable();
            controls.categories.enable();
            break;
          default:
            controls.categories.disable();
            controls.products.disable();
            break;
        }

        switch (controls.subscribersEligibility.value) {
          case PeSubscriptionsPlanEligibilityEnum.SpecificSubscribers:
            controls.groups.disable();
            controls.subscribers.enable();
            break;
          case PeSubscriptionsPlanEligibilityEnum.SpecificGroupsOfSubscribers:
            controls.subscribers.disable();
            controls.groups.enable();
            break;
          default:
            controls.groups.disable();
            controls.subscribers.disable();
            break;
        }
      }));

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,

    private pebEnvService: PebEnvService,
    @Inject(PE_OVERLAY_CONFIG) public peOverlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private peSubscriptionsApiService: PeSubscriptionsApiService,
    private peSubscriptionsGridService: PeSubscriptionsGridService,
    private peSubscriptionsConnectionApiService: PeSubscriptionsConnectionApiService,
  ) {
    this.loading = true;
    this.peSubscriptionsGridService.backdropClick = this.closeEditor;
    this.peOverlayConfig.backBtnCallback = this.closeEditor;
    this.peOverlayConfig.doneBtnCallback = () => {
      !this.loading && this.onSave();
    };
    this.peOverlayConfig.doneBtnTitle = this.loadingBtn;
    this.peOverlayConfig.isLoading = true;
  }

  ngOnInit(): void {
    const planId = this.peOverlayData.id;
    const getPlan$ = planId
      ? this.getPlan(planId)
      : of(null);
    const initPlanForm$ = forkJoin([
      concat(
        this.getPayments$,
        getPlan$,
      ),
    ]).pipe(
      tap(() => {
        this.loading = false;
        this.peOverlayConfig.isLoading = false;
        this.peOverlayConfig.doneBtnTitle = this.saveBtn;
        this.cdr.markForCheck();
        this.subscriptionPlanForm.markAsPristine();
      }),
      catchError(() => {
        this.loading = false;
        this.peOverlayConfig.isLoading = false;
        this.peOverlayConfig.doneBtnTitle = this.saveBtn;
        this.cdr.markForCheck();
        this.subscriptionPlanForm.markAsPristine();
  
        return of(true);
      }));
      
    merge(
      initPlanForm$,
      this.controlsValidationHandler$,
      this.getFilteredData$,
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  private closeEditor = () => {
    if (this.subscriptionPlanForm.dirty && !this.loading) {
      this.peSubscriptionsGridService.confirmation$
        .pipe(
          take(1),
          filter(Boolean),
          tap(() => {
            this.peOverlayWidgetService.close();
          }),
          takeUntil(this.destroy$))
        .subscribe();

      const planId = this.peOverlayData?._id;
      const headingTitle = planId
        ? 'subscriptions-app.confirm_dialog.cancel.plan_editor.editing.title'
        : 'subscriptions-app.confirm_dialog.cancel.plan_editor.creating.title';
      const headingSubtitle = planId
        ? 'subscriptions-app.confirm_dialog.cancel.plan_editor.editing.subtitle'
        : 'subscriptions-app.confirm_dialog.cancel.plan_editor.creating.subtitle';
      const config: Headings = {
        title: this.translateService.translate(headingTitle),
        subtitle: this.translateService.translate(headingSubtitle),
        confirmBtnText: this.closeBtn,
        declineBtnText: this.cancelBtn,
      };

      this.peSubscriptionsGridService.openConfirmDialog(config);
    } else if (!this.loading) {
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
    return this.peSubscriptionsApiService
      .getCategories(filter)
      .pipe(this.errorHandler());
  }

  private getProducts(filter: string = ''): Observable<any> {
    return this.peSubscriptionsApiService
      .getProducts(filter)
      .pipe(this.errorHandler());
  }

  private getSubscribers(filter: string = ''): Observable<any> {
    return this.peSubscriptionsApiService
      .getSubscribers(filter)
      .pipe(this.errorHandler());
  }

  private getSubscribersGroups(filter: string = ''): Observable<any> {
    return this.peSubscriptionsApiService
      .getSubscribersGroups(filter)
      .pipe(this.errorHandler());
  }

  private getPlan(planId: string): Observable<any> {
    return this.peSubscriptionsApiService
      .getPlan(planId)
      .pipe(
        switchMap(plan => {
          const {
            categories,
            products,
            subscribers,
            subscribersGroups,
          } = plan;

          return forkJoin([
            of(plan),
            categories && categories.length
              ? this.getCategories()
              : of(null),
            products && products.length
              ? this.getProducts()
              : of(null),
            subscribers && subscribers.length
              ? this.getSubscribers()
              : of(null),
            subscribersGroups && subscribersGroups.length
              ? this.getSubscribersGroups()
              : of(null),
          ]);
        }),
        tap(([plan, categories, products, subscribers, subscribersGroups]) => {
          if (plan.categories.length) {
            plan.categories = IdToDataMapper(plan.categories, categories);
          }

          if (plan.products.length) {
            plan.products = IdToDataMapper(plan.products, products);
          }

          if (plan.subscribers.length) {
            plan.subscribers = IdToDataMapper(plan.subscribers, subscribers);
          }

          if (plan.subscribersGroups.length) {
            plan.groups = IdToDataMapper(plan.subscribersGroups, subscribersGroups);
          }

          if (!!plan.billingPeriod) {
            plan.trialPeriod = true;
            plan.trialPeriodDuration = plan.billingPeriod;
          }

          plan.billingInterval = plan.interval;

          const subscribedChannelSets = this.subscribedChannelSets$.value
            .map(subscribedChannelSet => {
              subscribedChannelSet.enabled = plan.subscribedChannelSets
                .some(subscribedChannelSetId => {
                  return subscribedChannelSetId === subscribedChannelSet._id;
                });

              return subscribedChannelSet;
            });
          this.subscriptionPlanForm.patchValue(plan);
          this.subscribedChannelSets$.next(subscribedChannelSets);
        }));
  }

  private onSave = () => {
    const { controls } = this.subscriptionPlanForm;
    controls.name.setValidators([Validators.required]);
    controls.categories.setValidators([Validators.required, PeCustomValidators.MinArrayLength(1)]);
    controls.groups.setValidators([Validators.required, PeCustomValidators.MinArrayLength(1)]);
    controls.products.setValidators([Validators.required, PeCustomValidators.MinArrayLength(1)]);
    controls.subscribers.setValidators([Validators.required, PeCustomValidators.MinArrayLength(1)]);
    this.initControlsValidation$.next();

    if (controls.trialPeriod.value) {
      controls.trialPeriodDuration.setValidators([Validators.required, PeCustomValidators.PositiveInteger(1)]);
    } else {
      controls.trialPeriodDuration.clearValidators();
    }

    controls.name.updateValueAndValidity();
    controls.categories.updateValueAndValidity();
    controls.groups.updateValueAndValidity();
    controls.products.updateValueAndValidity();
    controls.subscribers.updateValueAndValidity();
    controls.trialPeriodDuration.updateValueAndValidity();
    const { dirty, invalid, valid } = this.subscriptionPlanForm;
    
    if (dirty && valid) {
      const categories = controls.appliesTo.value === PeSubscriptionsPlanAppliesToEnum.SpecificCategories
        ? controls.categories.value
        : [];
      
      const products = controls.appliesTo.value === PeSubscriptionsPlanAppliesToEnum.SpecificProducts
        ? controls.products.value
        : [];
      const subscribers = controls.subscribersEligibility.value
        === PeSubscriptionsPlanEligibilityEnum.SpecificSubscribers
          ? controls.subscribers.value.map(subscriber => {
              delete subscriber.title;

              return subscriber;
            })
          : [];
      const subscribersGroups$ = controls.subscribersEligibility.value
        !== PeSubscriptionsPlanEligibilityEnum.SpecificGroupsOfSubscribers
          ? of([])
          : of(cloneDeep(controls.groups.value))
              .pipe(switchMap(this.peSubscriptionsApiService.mapSubscribersGroups));

      const plan: PeSubscriptionsPlanInterface = {
        appliesTo: controls.appliesTo.value,
        billingPeriod: controls.trialPeriod.value
          ? Number(controls.trialPeriodDuration.value)
          : null,
        categories: categories,
        interval: controls.billingInterval.value,
        name: controls.name.value,
        planType: controls.planType.value,
        products: products,
        shortName: controls.name.value,
        subscribedChannelSets: controls.subscribedChannelSets.value,
        subscribers: subscribers,
        subscribersEligibility: controls.subscribersEligibility.value,
        subscribersTotals: Number(subscribers.length),
        subscriptionNetwork: this.pebEnvService.applicationId,
        targetFolderId: this.peOverlayData.targetFolderId,
        totalPrice: products.length
          ? Number(
              products
                .map(product => product.price)
                .reduce((prev: number, curr: number) => prev + curr)
            )
          : 0,
      };

      subscribersGroups$
        .pipe(
          map(subscribersGroups => {
            plan.subscribersGroups = subscribersGroups;

            return controls._id.value;
          }),
          switchMap(planId => {
            this.peOverlayConfig.doneBtnTitle = this.loadingBtn;
            this.peOverlayConfig.isLoading = true;
            this.loading = true;
            this.cdr.detectChanges();

            return planId
              ? this.peSubscriptionsApiService.updatePlan(planId, plan)
              : this.peSubscriptionsApiService.createPlan(plan);
          }),
          map(plan => this.peOverlayData.applicationScopeElasticId
            ? {
                ...plan,
                applicationScopeElasticId: this.peOverlayData.applicationScopeElasticId,
              }
            : plan),
          tap(plan => {
            this.peOverlayConfig.onSaveSubject$.next(plan);
          }),
          catchError(() => {
            this.peOverlayConfig.doneBtnTitle = this.saveBtn;
            this.peOverlayConfig.isLoading = false;
            this.loading = false;
            this.cdr.detectChanges();

            return of(true);
          }),
          takeUntil(this.destroy$))
        .subscribe();
    } else if (dirty || invalid) {
      this.cdr.detectChanges();
    } else {
      this.peOverlayWidgetService.close();
    }
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

  public setFilter(filter: string, arrayName: string): void {
    this.setFilter$.next({ arrayName, filter });
  }

  public trackItem(index: number, item: any): any {
    return item?.id ?? item?._id;
  }

  public switchChannel(integration: PeListSectionIntegrationInterface): void {
    const { _id, enabled } = integration;
    const subscribedChannelSets = this.subscribedChannelSets$.value;
    const index = subscribedChannelSets.findIndex(integration => integration._id === _id);
    subscribedChannelSets[index].enabled = !enabled;
    this.subscribedChannelSets$.next(subscribedChannelSets);

    const controls = this.subscriptionPlanForm.controls;
    const channelsSet = !enabled
      ? [...controls.subscribedChannelSets.value, _id]
      : controls.subscribedChannelSets.value.filter(channel => channel !== _id);
    controls.subscribedChannelSets.patchValue(channelsSet);
    controls.subscribedChannelSets.markAsDirty();
  }
}
