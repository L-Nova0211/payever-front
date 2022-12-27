import {
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { assign, cloneDeep } from 'lodash-es';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { flatMap, map, shareReplay, takeUntil, tap } from 'rxjs/operators';

import { PebColorPickerService } from '@pe/builder-color-picker';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n';
import {
  PE_OVERLAY_DATA,
  PeOverlayRef,
  PE_OVERLAY_CONFIG,
} from '@pe/overlay-widget';

import {
  CheckoutInterface,
  CheckoutSettingsInterface,
  ColorAndStylePanelInterface,
  StylesSettingsInterface,
} from '../../../interfaces';
import { colorAndStyleMenu } from '../../../panels-info-data';
import { RootCheckoutWrapperService, StorageService } from '../../../services';
import { TimestampEvent } from '../../timestamp-event';
import { BaseSettingsComponent } from '../base-settings.component';

import { DEFAULT_STYLES } from './constants';
import { ScreenTypeEnum } from './enums';
import { ScreenTypeStylesService } from './services/screen-type.service';

const businessHeaderMaxHeight = 200;
const businessHeaderMinHeight = 0;

@Component({
  selector: 'checkout-color-and-style',
  templateUrl: './color-and-style.component.html',
  styleUrls: ['color-and-style.component.scss'],
  providers: [PebColorPickerService, ScreenTypeStylesService],
})
export class ColorAndStyleComponent extends BaseSettingsComponent implements OnInit, OnDestroy {

  @ViewChildren(MatExpansionPanel) panels: QueryList<MatExpansionPanel>;

  currentCheckout: CheckoutInterface;
  businessUuid: string;
  colorAndStyleMenu: ColorAndStylePanelInterface[] = colorAndStyleMenu;
  formStyle: FormGroup;
  stylesSettings: StylesSettingsInterface;
  stylesChanged: boolean;

  channelSetId$: Observable<string> = null;
  savingSub: Subscription = null;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isShowDemo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  dialogRef: PeOverlayRef;
  theme = this.overlayData.theme;
  onSave$ = this.overlayData.onSave$.pipe(takeUntil(this.destroyed$));
  onClose$ = this.overlayData.onClose$.pipe(takeUntil(this.destroyed$));
  checkoutUuid = this.overlayData.checkoutUuid;
  updateSettings$: Subject<TimestampEvent> = new Subject();

  showPanelIndex = 0;

  onSuccessSubject$ = new BehaviorSubject<number>(0);
  onCancelSubject$ = new BehaviorSubject<number>(0);
  screenSelect$: Observable<string>;

  readonly defaultStyles: StylesSettingsInterface = DEFAULT_STYLES;

  constructor(
    injector: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    public translateService: TranslateService,
    private wrapperService: RootCheckoutWrapperService,
    private storageService: StorageService,
    private confirmScreenService: ConfirmScreenService,
    private screenTypeStylesService: ScreenTypeStylesService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any
  ) {
    super(injector);
    this.screenSelect$ = this.screenTypeStylesService.screen$.pipe(
      map((screen: ScreenTypeEnum) => this.translateService.translate(`settings.colorAndStyle.screen.values.${screen}`))
    );
  }

  ngOnInit() {
    super.ngOnInit();
    this.overlayConfig.isLoading$ = this.isLoading$.asObservable();
    this.overlayConfig.doneBtnCallback = () => {
      this.saveChanges();
    }

    this.channelSetId$ = this.wrapperService.getCheckoutChannelSetID(this.checkoutUuid).pipe(shareReplay());
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((currentCheckout: CheckoutInterface) => {
        this.currentCheckout = currentCheckout;
        const s = this.currentCheckout.settings;
        this.stylesSettings = assign(cloneDeep(this.defaultStyles), s && s.styles ? s && s.styles : {});
        this.initStyleForm();
      });

    this.onClose$.subscribe(() => {
      if (this.businessUuid) {
        if (this.stylesChanged) {
          this.initWarningModal();
        } else {
          this.overlayData.close();
        }
      }
    });

    this.businessUuid = this.storageService.businessUuid;
  }

  ngOnDestroy(): void {
    this.wrapperService.reCreateFlow(); // Just resetting inputted data
  }

  trackByFn(i: number, section: ColorAndStylePanelInterface): string {
    return section.key;
  }

  onChangeDevice(): void {
    this.screenTypeStylesService.openDialog();
  }

  goBack(): void {
    if (this.isLoading$.getValue()) {
      this.showError('Please wait when saving is finished');

      return;
    }
    this.wrapperService.onSettingsUpdated();
    if (this.isModal) {
      this.backToModal();
    } else {
      this.router.navigate([`${this.storageService.getHomeSettingsUrl(this.checkoutUuid)}`]);
    }
  }

  resetStyles(): void {
    const isActive = this.stylesSettings.active;
    this.stylesSettings = this.defaultStyles;
    this.stylesSettings.active = isActive;
    this.initStyleForm();
    this.stylesChanged = true;
  }

  private initStyleForm(): void {
    this.formStyle = this.fb.group({
      businessHeaderBorderColor: this.stylesSettings.businessHeaderBorderColor,
      businessHeaderBackgroundColor: this.stylesSettings.businessHeaderBackgroundColor,
      businessHeaderDesktopHeight: this.stylesSettings.businessHeaderDesktopHeight,
      businessHeaderMobileHeight: this.stylesSettings.businessHeaderMobileHeight,

      businessLogoDesktopWidth: this.stylesSettings.businessLogoDesktopWidth,
      businessLogoDesktopHeight: this.stylesSettings.businessLogoDesktopHeight,
      businessLogoDesktopPaddingTop: this.stylesSettings.businessLogoDesktopPaddingTop,
      businessLogoDesktopPaddingRight: this.stylesSettings.businessLogoDesktopPaddingRight,
      businessLogoDesktopPaddingBottom: this.stylesSettings.businessLogoDesktopPaddingBottom,
      businessLogoDesktopPaddingLeft: this.stylesSettings.businessLogoDesktopPaddingLeft,
      businessLogoDesktopAlignment: this.stylesSettings.businessLogoDesktopAlignment,

      businessLogoMobileWidth: this.stylesSettings.businessLogoMobileWidth,
      businessLogoMobileHeight: this.stylesSettings.businessLogoMobileHeight,
      businessLogoMobilePaddingTop: this.stylesSettings.businessLogoMobilePaddingTop,
      businessLogoMobilePaddingRight: this.stylesSettings.businessLogoMobilePaddingRight,
      businessLogoMobilePaddingBottom: this.stylesSettings.businessLogoMobilePaddingBottom,
      businessLogoMobilePaddingLeft: this.stylesSettings.businessLogoMobilePaddingLeft,
      businessLogoMobileAlignment: this.stylesSettings.businessLogoMobileAlignment,

      buttonBackgroundColor: this.stylesSettings.buttonBackgroundColor,
      buttonBackgroundDisabledColor: this.stylesSettings.buttonBackgroundDisabledColor,
      buttonTextColor: this.stylesSettings.buttonTextColor,
      buttonBorderRadius: this.stylesSettings.buttonBorderRadius,

      buttonSecondaryBackgroundColor: this.stylesSettings.buttonSecondaryBackgroundColor,
      buttonSecondaryBackgroundDisabledColor: this.stylesSettings.buttonSecondaryBackgroundDisabledColor,
      buttonSecondaryTextColor: this.stylesSettings.buttonSecondaryTextColor,
      buttonSecondaryBorderRadius: this.stylesSettings.buttonSecondaryBorderRadius,

      pageBackgroundColor: this.stylesSettings.pageBackgroundColor,
      pageLineColor: this.stylesSettings.pageLineColor,
      pageTextPrimaryColor: this.stylesSettings.pageTextPrimaryColor,
      pageTextSecondaryColor: this.stylesSettings.pageTextSecondaryColor,
      pageTextLinkColor: this.stylesSettings.pageTextLinkColor,

      inputBackgroundColor: this.stylesSettings.inputBackgroundColor,
      inputBorderColor: this.stylesSettings.inputBorderColor,
      inputTextPrimaryColor: this.stylesSettings.inputTextPrimaryColor,
      inputTextSecondaryColor: this.stylesSettings.inputTextSecondaryColor,
      inputBorderRadius: this.stylesSettings.inputBorderRadius,

      active: this.stylesSettings.active,
    });

    this.formStyle.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((values) => {
      const {
        businessHeaderDesktopHeight,
        businessHeaderMobileHeight,
        businessLogoDesktopHeight,
        businessLogoMobileHeight,
      } = values;

      this.stylesChanged = true;
      this.formStyle.get('businessHeaderDesktopHeight').setValue(
        Math.min(businessHeaderMaxHeight, Math.max(businessHeaderDesktopHeight, businessHeaderMinHeight)),
        { onlySelf: true }
      );
      this.formStyle.get('businessHeaderMobileHeight').setValue(
        Math.min(businessHeaderMaxHeight, Math.max(businessHeaderMobileHeight, businessHeaderMinHeight)),
        { onlySelf: true }
      );
      this.formStyle.get('businessLogoDesktopHeight').setValue(
        Math.min(businessHeaderDesktopHeight, Math.max(businessLogoDesktopHeight, businessHeaderMinHeight)),
        { onlySelf: true }
      );
      this.formStyle.get('businessLogoMobileHeight').setValue(
        Math.min(businessHeaderMobileHeight, Math.max(businessLogoMobileHeight, businessHeaderMinHeight)),
        { onlySelf: true }
      );
    });

    this.changeDetectorRef.detectChanges();
  }

  private saveChanges(): void {

    const values: StylesSettingsInterface = this.formStyle.value;
    const newSettings: CheckoutSettingsInterface = cloneDeep(this.currentCheckout.settings);

    if (!newSettings.styles) {
      newSettings.styles = {};
    }
    assign(newSettings.styles, values);

    if (this.savingSub) {
      this.savingSub.unsubscribe();
    }
    this.isLoading$.next(true);
    this.savingSub = timer(600).pipe(
      flatMap(() => this.storageService.saveCheckoutSettings(this.currentCheckout._id, newSettings))
    ).subscribe(() => {
      this.isLoading$.next(false);
      this.updateCheckoutSettings();
      this.overlayData.close();
    }, (err) => {
      this.showError(err.message || 'Not possible to save styles! Unknown error!');
      this.isLoading$.next(false);
    });
  }

  updateCheckoutSettings(): void {
    this.updateSettings$.next(new TimestampEvent());
  }

  openPanel(panelIndex: number) {
    this.showPanelIndex = panelIndex;
  }

  openColorPickerPanel(id: string): void {
    const elementRef = document.querySelector(`button[pe-qa-color-picker='${id}']`) as HTMLButtonElement;
    elementRef?.click();
  }

  private initWarningModal() {
    const headings: Headings = {
      title: this.translateService.translate('warning-modal.title'),
      subtitle: this.translateService.translate('warning-modal.description'),
      confirmBtnText: this.translateService.translate('warning-modal.actions.yes'),
      declineBtnText: this.translateService.translate('warning-modal.actions.no'),
    }

    this.confirmScreenService.show(headings, true).pipe(
      tap((val) => {
        if (val) {
          this.overlayData.close();
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }
}
