import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService, MessageBus, PeDestroyService,NavigationService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { PickupTimeEnums } from '../../enums/PickupTimeEnums';
import { BaseComponent } from '../../misc/base.component';
import { PebShippingBusinessService } from '../../services/business-shipping.service';
import { PebShippingOriginService } from '../../services/shipping-origin.service';
import { PebShippingSettingsService } from '../../services/shipping-settings.service';
import {
  LibShippingEditLocationModalComponent,
} from '../delivery-by-location/edit-location-modal/edit-location-modal.component';
import { ConfirmDialogService } from '../shipping-profiles/browse-products/dialogs/dialog-data.service';


@Component({
  selector: 'peb-pickup-by-location',
  templateUrl: './pickup-by-location.component.html',
  styleUrls: ['./pickup-by-location.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebPickupByLocationComponent extends BaseComponent implements OnInit {
  currency;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  dialogRef: PeOverlayRef;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  localPickupForm: FormGroup = this.formBuilder.group({
    shippingOrigin: [],
    pickUpTime: [],
    pickUpMessage: [''],
    hasLocalPickup: [{ value: false, disabled: true }],
  });

  pickUpTimes = [
    { label: 'Usually ready in 1 hour', value: PickupTimeEnums.ReadyInOneHour },
    { label: 'Usually ready in 2 hours', value: PickupTimeEnums.ReadyInTwoHours },
    { label: 'Usually ready in 4 hours', value: PickupTimeEnums.ReadyInFourHours },
    { label: 'Usually ready in 24 hours', value: PickupTimeEnums.ReadyInTwentyFourHours },
    { label: 'Usually ready in 2-4 days', value: PickupTimeEnums.ReadyInTwoToFourDays },
    { label: 'Usually ready in 5+ days', value: PickupTimeEnums.ReadyInMoreThanFiveDays },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private shippingSettingsService: PebShippingSettingsService,
    private shippingOriginService: PebShippingOriginService,
    private shippingBussinessService: PebShippingBusinessService,
    private overlayService: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private envService: EnvService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private messageBus: MessageBus,
    private confirmDialog: ConfirmDialogService,
    private navigationService: NavigationService,
    private router: Router,
    private apmService: ApmService,
    private destroyed$: PeDestroyService,
    protected translateService: TranslateService,
  ) {
    super(translateService);
    this.matIconRegistry.addSvgIcon(
      `shipping-location-icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/shipping-location-icon.svg'),
    );
  }

  ngOnInit() {
    this.getSettings();

    this.localPickupForm.get('shippingOrigin').valueChanges.pipe(
      filter(data => !!data),
      switchMap((value) => {
        this.localPickupForm.get('hasLocalPickup').enable();

        return this.localPickupForm.get('pickUpTime').valueChanges.pipe(
          tap(() => {
            this.updateLocalDelivery();
          })
        )
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    this.localPickupForm.get('hasLocalPickup').valueChanges.pipe(
      tap((value) => {
        if (!value) {
          this.localPickupForm.get('pickUpTime').patchValue(null);
          this.localPickupForm.get('pickUpMessage').patchValue('');
        } else {
          if (!this.localPickupForm.get('pickUpTime').value) {
            this.localPickupForm.get('pickUpTime').patchValue(PickupTimeEnums.ReadyInOneHour);
          }
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    this.cdr.detectChanges();
  }

  updateLocalDelivery() {
    const shippingOrigin = this.localPickupForm.get('shippingOrigin').value;

    const payload = {
      name: shippingOrigin.name,
      streetName: shippingOrigin.streetName,
      streetNumber: shippingOrigin.streetNumber,
      city: shippingOrigin.city,
      zipCode: shippingOrigin.zipCode,
      countryCode: shippingOrigin.countryCode,
      phone: shippingOrigin.phone,
      localPickUp: {
        pickUpTime: this.localPickupForm.get('pickUpTime').value,
        pickUpMessage: this.localPickupForm.get('pickUpMessage').value,
      },
    };
    this.shippingOriginService.editOrigin(shippingOrigin._id, payload).subscribe();
  }

  getSettings() {
    this.shippingBussinessService.getShippingSettings().pipe(tap((responese: any) => {
        this.currency = responese.currency;
        this.cdr.detectChanges();
      }
    )).subscribe();
    this.shippingSettingsService.getSettings(this.envService.businessId)
      .pipe(
        switchMap((response: any) => {
          if (response) {
            const origins = response.filter(origin => origin?.isDefault === true)[0]?.origins;
            const origin = origins[origins.length-1];
            if (origin?._id) {
              return this.shippingOriginService.getOriginById(origin._id).pipe(
                tap((response: any) => {
                  origin.phone = origin.phone?.split(' ')[1] ?? origin.phone;
                  this.localPickupForm.get('shippingOrigin').patchValue(origin);
                  if (response.localPickUp) {
                    const localPickup = response?.localPickUp;
                    const controls = this.localPickupForm.controls;

                    if (localPickup?.pickUpTime) {
                      this.localPickupForm.get('hasLocalPickup').patchValue(true);
                    }

                    controls.pickUpTime.patchValue(localPickup?.pickUpTime, { emitEvent: false });
                    controls.pickUpMessage.patchValue(localPickup?.pickUpMessage);

                    this.cdr.detectChanges();
                  }
                })
              );
            } else {
              return of(false);
            }
          }

          return of(null);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  openEditLocationModal() {
    const isEdit = this.localPickupForm.get('shippingOrigin').value;
    const config: PeOverlayConfig = {
      data: { data: this.localPickupForm.get('shippingOrigin').value },
      headerConfig: {
        title: this.translateService.translate(
          isEdit ? 'shipping-app.actions.edit_location' : 'shipping-app.actions.add_location'
        ),
        backBtnTitle: 'Cancel',
        backBtnCallback: () => {
          this.showConfirmationWindow(this.getConfirmationContent('location', isEdit ? 'editing' : 'adding'));
        },
        doneBtnTitle: 'Done',
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: this.theme,
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
            this.shippingOriginService
              .postOrigin(data.data)
              .pipe(
                tap((_) => {
                  this.getSettings();
                  this.cdr.detectChanges();
                }),
                catchError((err) => {
                  this.apmService.apm.captureError(
                    `Cant add shipping origin ERROR ms:\n ${JSON.stringify(err)}`
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
