import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApmService } from '@elastic/apm-rum-angular';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, skip, takeUntil, tap } from 'rxjs/operators';

import { EnvService, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import {
  OverlayHeaderConfig,
  PeOverlayRef,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
} from '@pe/overlay-widget';

import { PackageKindEnum, PackageTypeEnum } from '../../../enums/PackageTypeEnum';
import { SizeMeasurementUnitsEnum } from '../../../enums/SizeMeasurementUnitsEnum';
import { WeightMeasurementUnitsEnum } from '../../../enums/WeightMeasurementUnitsEnum';
import { ShippingPackageInterface } from '../../../interfaces/shipping-package.interface';
import { BaseComponent } from '../../../misc/base.component';
import { NumericPipe } from '../../../pipes/keypress.pipe';
import { ProductsApiService } from '../../shipping-profiles/browse-products/services/api.service';

@Component({
  selector: 'peb-new-package-dialog',
  templateUrl: './new-package.component.html',
  styleUrls: ['./new-package.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
  encapsulation: ViewEncapsulation.None,
})
export class PebNewPackageComponent extends BaseComponent implements OnInit {
  edit = false;
  theme;
  packageTypeEnum = PackageTypeEnum;

  sizeMeasurementUnits = [
    { label: 'Milimeter', value: SizeMeasurementUnitsEnum.MILIMETER },
    { label: 'Centimeters', value: SizeMeasurementUnitsEnum.CENTIMETER },
    { label: 'Meters', value: SizeMeasurementUnitsEnum.METER },
    { label: 'Inch', value: SizeMeasurementUnitsEnum.INCH },
    { label: 'Foot', value: SizeMeasurementUnitsEnum.FOOT },
    { label: 'Foot US', value: SizeMeasurementUnitsEnum.FOOT_US },
    { label: 'Yard', value: SizeMeasurementUnitsEnum.YARD },
  ];

  weightMeasurementUnits = [
    { label: 'Microgramme', value: WeightMeasurementUnitsEnum.MICROGRAMME },
    { label: 'Miligrams', value: WeightMeasurementUnitsEnum.MILIGRAM },
    { label: 'Grams', value: WeightMeasurementUnitsEnum.GRAMS },
    { label: 'Kilograms', value: WeightMeasurementUnitsEnum.KILOGRAMS },
    { label: 'Ounce', value: WeightMeasurementUnitsEnum.OUNCE },
    { label: 'Pound', value: WeightMeasurementUnitsEnum.POUND },
    { label: 'Tonne', value: WeightMeasurementUnitsEnum.TONNE },
    { label: 'Megatonne', value: WeightMeasurementUnitsEnum.MEGATONNE },
  ];

  packageBoxTypes = [
    { label: 'Box', value: PackageTypeEnum.Box },
    { label: 'Envelope', value: PackageTypeEnum.Envelope },
    {
      label: 'Soft package/satchel',
      value: PackageTypeEnum.Soft,
    },
  ];

  carrierBoxes = [];
  carrierValid = true;


  packageKind = [
    { label: 'Custom package', value: 'Custom' },
  ];

  shippingPackageForm: FormGroup = this.formBuilder.group({
    name: '',
    type: [PackageTypeEnum.Box],
    dimensionUnit: [SizeMeasurementUnitsEnum.CENTIMETER],
    length: [''],
    width: [''],
    height: [''],
    weightUnit: [WeightMeasurementUnitsEnum.KILOGRAMS],
    weight: [''],
    isDefault: [],
  });

  shippingPackageKind = this.formBuilder.control('Custom');

  carrierShippingPackages = [];

  constructor(
    public numeric: NumericPipe,
    public destroy$: PeDestroyService,
    public apmService: ApmService,
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private cdr: ChangeDetectorRef,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private apiService: ProductsApiService,
    private envService: EnvService,
    protected translateService: TranslateService,
  ) {
    super(translateService);
  }

  ngOnInit() {
    this.apiService.getCarrierBoxes(this.envService.businessId).pipe(tap((res: any) => {
        this.carrierBoxes = res
          .filter(carrier => carrier?.integration?.name !== 'custom' && carrier?.enabled && carrier?.boxes?.length > 0);

        if (this.carrierBoxes?.length > 0) {
          this.packageKind.push({ label: 'Carrier package', value: PackageKindEnum.Carrier });
        }
      }
    )).subscribe();
    this.theme = this.overlayConfig.theme;
    this.overlaySaveSubject.pipe(
      skip(1),
      tap((dialogRef) => {
        this.onCheckValidity();
      }), takeUntil(this.destroy$)
    ).subscribe();

    const couponId = this.overlayData?.data?.id;
    if (this.overlayData.new) {
      this.shippingPackageForm.get('type').setValue(this.overlayData.new);
    }

    if (couponId) {
      this.edit = true;
    }

    if (this.edit) {
      const formData: ShippingPackageInterface = this.overlayData.data;
      this.shippingPackageForm.patchValue(formData);
    }
  }

  onCheckValidity() {
    const value = this.shippingPackageForm.controls;
    if (this.shippingPackageKind.value.toLowerCase() === 'custom') {
      value.name.setValidators([Validators.required]);
      value.name.updateValueAndValidity();

      value.length.setValidators([Validators.required]);
      value.length.updateValueAndValidity();

      value.width.setValidators([Validators.required]);
      value.width.updateValueAndValidity();

      if (value.type.value !== PackageTypeEnum.Envelope) {
        value.height.setValidators([Validators.required]);
        value.height.updateValueAndValidity();
      } else {
        value.height.setValue(0);
      }

      value.weight.setValidators([Validators.required]);
      value.weight.updateValueAndValidity();
      this.carrierValid = true;
    } else {
      this.carrierValid = this.carrierShippingPackages.length >= 1;
    }

    this.cdr.detectChanges();

    if (this.shippingPackageForm.valid && this.carrierValid) {
      this.onSave();
    }
  }

  onSave() {
    if (this.shippingPackageKind.value === PackageKindEnum.Carrier) {
      const shippingBoxData = [];
      this.carrierShippingPackages.forEach((element) => {
        shippingBoxData.push({
          name: element.name,
          business: this.envService.businessId,
          dimensionUnit: element.dimensionUnit,
          weightUnit: element.weightUnit,
          kind: PackageKindEnum.Carrier,
          length: element.length,
          width: element.width,
          height: element.height,
          weight: element.weight,
          isDefault: element.isDefault,
          type: element.type,
        });
      });
      this.peOverlayRef.close({ data: shippingBoxData, kind: PackageKindEnum.Carrier });
    }
    if (this.shippingPackageForm.valid) {
      this.overlayConfig.doneBtnTitle = 'Saving...';
      let data;
      if (this.edit) {
        data = {
          data: this.shippingPackageForm.value,
          id: this.overlayData.data.id,
        };
      } else {
        data = this.shippingPackageForm.value;
      }
      if (data?.kind === PackageKindEnum.Carrier) {
        this.apiService.addCarrierPackage(data.data, this.envService.businessId)
          .pipe(
            tap((_) => {
              this.peOverlayRef.close(data);
            }),
            takeUntil(this.destroy$),
            catchError((err) => {
              this.apmService.apm.captureError(
                `Cant add carrier package ERROR ms:\n ${JSON.stringify(err)}`
              );

              this.peOverlayRef.close(null);

              return EMPTY;
            }),
          ).subscribe();
      } else {
        this.apiService.actionPackage(data, this.envService.businessId, data.id)
          .pipe(
            tap((_) => {
              this.peOverlayRef.close(data);
            }),
            takeUntil(this.destroy$),
            catchError((err) => {
              this.apmService.apm.captureError(
                `Cant add custom package ERROR ms:\n ${JSON.stringify(err)}`
              );

              this.peOverlayRef.close(null);

              return EMPTY;
            }),
          ).subscribe();
      }
    }
  }

  handleBoxes(event, box, carrier) {
    if (event.checked) {
      this.carrierShippingPackages.push(box);
    } else {
      if (this.carrierShippingPackages.indexOf(box) !== -1) {
        box.isDefault = false;
        this.carrierShippingPackages.splice(this.carrierShippingPackages.indexOf(box), 1);
      }
    }
    this.carrierValid = this.carrierShippingPackages.length >= 1;
  }

  makeDefault(box, i) {
    this.carrierBoxes[i].boxes.forEach((val) => {
      if (val._id === box._id) {
        val.isDefault = true;
        if (!this.carrierShippingPackages?.find(item => item._id === val._id)) {
          this.carrierShippingPackages.push(box);
        }
      } else {
        val.isDefault = false;
      }
    });
  }

  isChecked(box): boolean {
    return this.carrierShippingPackages.find(val => val._id === box._id);
  }
}
