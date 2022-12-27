import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService, MessageBus, PeDestroyService, NavigationService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { DistanceMeasurementUnitsEnum } from '../../enums/DistanceMeasurementUnitsEnum';
import { BaseComponent } from '../../misc/base.component';
import { PebShippingBusinessService } from '../../services/business-shipping.service';
import { PebShippingOriginService } from '../../services/shipping-origin.service';
import { PebShippingSettingsService } from '../../services/shipping-settings.service';
import { ConfirmDialogService } from '../shipping-profiles/browse-products/dialogs/dialog-data.service';

import { LibShippingEditLocationModalComponent } from './edit-location-modal/edit-location-modal.component';


@Component({
  selector: 'peb-delivery-by-location',
  templateUrl: './delivery-by-location.component.html',
  styleUrls: ['./delivery-by-location.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebDeliveryByLocationComponent extends BaseComponent implements OnInit {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  dialogRef: PeOverlayRef;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  settings;
  currency;

  localDeliveryForm: FormGroup = this.formBuilder.group({
    shippingOrigin: [],
    hasLocalDelivery: [{ value: false, disabled: true }],
    deliveryArea: ['postal_code'],
    usePostalCodes: [false],
    radiusMeasurementUnit: [DistanceMeasurementUnitsEnum.KILOMETERS],
    conditionalDeliveryPricing: [false],
    postalCodes: [],
  });

  distanceMeasurementUnits = [
    { label: 'kilometers', value: DistanceMeasurementUnitsEnum.KILOMETERS },
    { label: 'miles', value: DistanceMeasurementUnitsEnum.MILES },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private messageBus: MessageBus,
    private shippingSettingsService: PebShippingSettingsService,
    private shippingOriginService: PebShippingOriginService,
    private shippingBussinessService: PebShippingBusinessService,
    private overlayService: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private envService: EnvService,
    protected translateService: TranslateService,
    private confirmDialog: ConfirmDialogService,
    private navigationService: NavigationService,
    private router: Router,
    private apmService: ApmService,
    private destroyed$: PeDestroyService
  ) {
    super(translateService);
    this.matIconRegistry.addSvgIcon(
      `shipping-location-icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/shipping-location-icon.svg'),
    );
  }

  ngOnInit(): void {
    this.getSettings();

    this.localDeliveryForm.get('shippingOrigin').valueChanges
      .pipe(
        filter(data => !!data),
        switchMap((value) => {
          this.localDeliveryForm.get('hasLocalDelivery').enable();

          return this.localDeliveryForm.get('postalCodes').valueChanges.pipe(
            tap((code) => {
              if (code?.length > 0) {
                if (code[code.length - 1].includes(',')) {
                  code[code.length - 1].split(/[ ,]+/).forEach((val) => {
                    if (val && !code.find(c => val === c) && val.match(/^[0-9]+$/)) {
                      code.push(val);
                    }
                  });
                  code.splice(code.indexOf(code.find(val => val.includes(','))), 1);
                } else if (!code[code.length - 1].match(/^[0-9]+$/)) {
                  code.splice(code.indexOf([code.length - 1]), 1);
                }
              }
              this.updateLocalDelivery();
            })
          )
        }),
        takeUntil(this.destroyed$)
      ).subscribe();

    this.localDeliveryForm.get('hasLocalDelivery').valueChanges.pipe(
      filter(data => !data),
      tap((value) => {
          this.localDeliveryForm.get('postalCodes').patchValue(null);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    this.cdr.detectChanges();
  }

  updateLocalDelivery() {
    const shippingOrigin = this.localDeliveryForm.get('shippingOrigin').value;

    const payload = {
      name: shippingOrigin.name,
      streetName: shippingOrigin.streetName,
      streetNumber: shippingOrigin.streetNumber,
      city: shippingOrigin.city,
      zipCode: shippingOrigin.zipCode,
      countryCode: shippingOrigin.countryCode,
      phone: shippingOrigin.phone,
      localDelivery: {
        postalCodes: this.localDeliveryForm.get('postalCodes').value ? this.localDeliveryForm.get('postalCodes').value : [],
      },
    };

    this.shippingOriginService.editOrigin(shippingOrigin._id, payload).subscribe();
  }

  getSettings() {
    this.shippingBussinessService.getShippingSettings().pipe(
      tap((responese: any) => {
        this.currency = responese.currency;
        this.cdr.detectChanges();
      })
    ).subscribe();
    this.shippingSettingsService.getSettings(this.envService.businessId)
      .pipe(
        switchMap((res: any) => {
          if (res) {
            const origins = res.find(origin => origin?.isDefault === true)?.origins;
            const origin = origins[origins.length-1];

            if (origin?._id) {
              return this.shippingOriginService.getOriginById(origin._id).pipe(
                tap((response: any) => {
                  origin.phone = origin.phone?.split(' ')[1] ?? origin.phone;
                  this.localDeliveryForm.get('shippingOrigin').patchValue(origin);
                  if (response.localDelivery) {
                    const localDelivery = response.localDelivery;
                    const controls = this.localDeliveryForm.controls;

                    if (localDelivery?.postalCodes?.length !== 0) {
                      this.localDeliveryForm.get('hasLocalDelivery').patchValue(true);
                      controls.postalCodes.patchValue(localDelivery.postalCodes);
                      controls.deliveryArea.patchValue('postal_code');
                    }

                    this.cdr.detectChanges();
                  } else {
                    return of(false);
                  }
                })
              );
            }
          }

          return of(null);
        }),
        takeUntil(this.destroyed$)
      ).subscribe();
  }

  openEditLocationModal() {
    const isEdit = this.localDeliveryForm.get('shippingOrigin').value;
    const config: PeOverlayConfig = {
      data: {
        data: this.localDeliveryForm.get('shippingOrigin').value,
      },
      headerConfig: {
        title: this.translateService.translate('shipping-app.actions.edit_location'),
        backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
        backBtnCallback: () => {
          this.showConfirmationWindow(
            this.getConfirmationContent('location', isEdit ? 'editing' : 'adding')
          );
        },
        doneBtnTitle: this.translateService.translate('shipping-app.actions.done'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: this.theme,
      },
      backdropClick: () => {
        this.showConfirmationWindow(this.getConfirmationContent('zone', isEdit ? 'editing' : 'adding'));
      },
      component: LibShippingEditLocationModalComponent,
    };
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed
      .pipe(
        filter(data => !!data),
        switchMap((data) => {
          if (data?.id) {
            return this.shippingOriginService
              .editOrigin(data.id, data.data)
              .pipe(
                tap((_) => {
                  this.getSettings();
                  this.cdr.detectChanges();
                }),
                catchError((err) => {
                  this.apmService.apm.captureError(
                    `Cant edit shipping origin ERROR ms:\n ${JSON.stringify(err)}`
                  );

                  return of(true);
                }),
              );
          } else {
            return this.shippingOriginService
              .postOrigin(data.data)
              .pipe(
                tap((_) => {
                  this.getSettings();
                  this.cdr.detectChanges();
                }),
                catchError((err) => {
                  this.apmService.apm.captureError(
                    `Cant add shipping origin ms:\n ${JSON.stringify(err)}`
                  );

                  return of(true);
                }),
              );
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  nagivateToCurrency() {
    this.navigationService.saveReturn(this.router.url);
    this.messageBus.emit('setting.currency.open', null);
  }

  showConfirmationWindow(dialogContent) {
    this.confirmDialog.open({
      cancelButtonTitle: this.translateService.translate('shipping-app.actions.no'),
      confirmButtonTitle: this.translateService.translate('shipping-app.actions.yes'),
      ...dialogContent,
    });

    this.confirmDialog.onConfirmClick().pipe(
      take(1),
      tap(() => {
        this.dialogRef.close();
      })
    ).subscribe();
  }
}
