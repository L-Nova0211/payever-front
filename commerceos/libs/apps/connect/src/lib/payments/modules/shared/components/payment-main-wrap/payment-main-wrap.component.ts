import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ContentChild, EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { cloneDeep, isEqual } from 'lodash-es';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { distinctUntilChanged, filter, take, takeUntil, tap } from 'rxjs/operators';


import {
  IntegrationsStateService,
  PanelEnum, PaymentMethodEnum,
  PaymentWithVariantInterface,
  StepEnum, UninstallService,
  VariantListItemInterface,
} from '../../../../../shared';
import { LoaderService } from '../../../shared/services';
import { BasePaymentAccordionComponent, ExpandedTypeIndexInterface } from '../base-payment-accordion.component';

@Component({
  selector: 'payment-main-wrap',
  templateUrl: './payment-main-wrap.component.html',
  styleUrls: ['./payment-main-wrap.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PaymentMainWrapComponent extends BasePaymentAccordionComponent implements OnInit, AfterViewChecked {

  @Input() paymentMethod: PaymentMethodEnum;
  @Input() forceHideSectionAccount: boolean;
  @Input() forceHideSectionAccountStatus: boolean;
  @Input() forceHideSectionAuthentication: boolean;

  @Input() hasExternalRegister: boolean; // Only for SOFORT
  @Input() hasExternalRegistration: boolean;
  @Input() hasExternalAuth: boolean;

  @Input() doOpenPanel$: Subject<PanelEnum> = null;
  @Input() doOpenNextPanel$: Subject<void> = null;

  @Output() dataLoading: EventEmitter<number> = new EventEmitter<number>();

  @ContentChild(TemplateRef) templateVariable: TemplateRef<any>;

  @ViewChildren('panel') panels: QueryList<MatExpansionPanel>;
  paymentData$: Observable<PaymentWithVariantInterface>;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isAddingConnVariant$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  processingConnVariant$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);

  PanelEnum = PanelEnum;
  StepEnum = StepEnum;

  integration;

  private lastExpandedTypeIndex: ExpandedTypeIndexInterface = null;
  private showFirstPanelRequired = true;
  private changeDetectorRef: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  private integrationsStateService: IntegrationsStateService = this.injector.get(IntegrationsStateService);
  public uninstallService: UninstallService = this.injector.get(UninstallService);
  private loaderService = this.injector.get(LoaderService);

  loader$ = this.loaderService.loaderSubject$;

  constructor(injector: Injector) {
    super(injector);
    this.isReloadingPaymentDone$.subscribe(() => {
      this.showFirstPanelRequired = true;
    });
    this.payment$.subscribe((data) => {
      if (data) {
        this.changeDetectorRef.detectChanges();
        this.isLoading$.next(false);
        this.initShortHeader(data);
        this.dataLoading.emit(1);
      } else {
        this.isLoading$.next(true);
        this.dataLoading.emit(1);
      }
    });
    // For panels:
    this.paymentData$ = this.payment$.pipe(takeUntil(this.destroyed$), filter(d => !!d),
    distinctUntilChanged((prev, next) => {
      // We update paymentData only when changed fields that make effect on accordions in template
      function mapVariant(variant: VariantListItemInterface): VariantListItemInterface {
        variant = cloneDeep(variant);
        delete variant.options;
        delete variant.credentials;
        delete variant.accept_fee;
        delete variant.shop_redirect_enabled;
        delete variant.variable_fee;
        delete variant.min;
        delete variant.max;
        delete variant.fixed_fee;

        return variant;
      }
      const prevVariants = prev.variants.map(e => mapVariant(e));
      const nextVariants = next.variants.map(e => mapVariant(e));
      this.saveExpandedPanel();

      return isEqual(prevVariants, nextVariants) && isEqual(prev.missing_steps, next.missing_steps);
    }));
  }

  ngOnInit(): void {
    this.integrationsStateService.getIntegration(this.paymentMethod).pipe(
      filter(d => !!d),
      tap(data => this.integration = data),
      takeUntil(this.destroyed$)
    ).subscribe();

    if (this.doOpenPanel$) {
      this.doOpenPanel$.pipe(
        takeUntil(this.destroyed$),
      ).subscribe((step: PanelEnum) => {
        this.openPanel(step);
      });
    }
    if (this.doOpenNextPanel$) {
      this.doOpenNextPanel$.pipe(
        takeUntil(this.destroyed$),
      ).subscribe(() => {
        this.openNextPanel();
      });
    }
    this.isAddingConnVariant$.pipe(takeUntil(this.destroyed$)).subscribe((isAdding) => {
      if (isAdding) {
      } else {
        this.payment$.pipe(take(1)).subscribe((data) => {});
      }
      this.dataLoading.emit(1);
    });
  }

  ngAfterViewChecked() {
    if (this.panels && this.payment && this.showFirstPanelRequired) {
      this.showFirstPanelRequired = false;
      timer(100).pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.showFirstPanel(this.panels);
      });
    }
  }

  openPanel(panel: PanelEnum): void {
    if (this.panels && this.payment) {
      timer(100).pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.showPanelByStepName(this.panels, panel);
      });
    }
  }

  openNextPanel(): void {
    if (this.panels && this.payment) {
      timer(100).pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.showNextPanelAfterOpened(this.panels);
      });
    }
  }

  onConnectionVariantAdded(): void {
    this.isAddingConnVariant$.next(false);
  }

  showConnectionVariantModal(): void {
    if (this.isVariantStatusConnected(0)) {
      this.isAddingConnVariant$.next(true);
    } else {
      this.showStepError(this.translateService.translate(
      'categories.payments.add_variant.errors.connect_default_before_add'));
      this.openPanel(PanelEnum.settings);
    }
  }

  disconnectConnectionVariant(event: Event, index: number): boolean {
    event.stopPropagation();
    if (this.processingConnVariant$.value < 0) {
      this.processingConnVariant$.next(index);
    }

    return false;
  }

  deleteConnectionVariant(event: Event, index: number): boolean {
    event.stopPropagation();
    if (this.processingConnVariant$.value < 0) {
      this.processingConnVariant$.next(index);
    }

    return false;
  }

  private saveExpandedPanel(): void {
    this.lastExpandedTypeIndex = this.getExpandedPanelTypeIndex(this.panels);
  }

  private restoreLastExpandedPanel(): void {
    this.expandPanelByTypeIndex(this.panels, this.lastExpandedTypeIndex);
  }

  private initShortHeader(data: PaymentWithVariantInterface): void {

  }
}
