import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n-core';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';

import { AbstractComponent } from '../abstract';

@Component({
  selector: 'peb-edit-taxes',
  templateUrl: './edit-taxes.component.html',
  styleUrls: ['./edit-taxes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTaxesComponent extends AbstractComponent implements OnInit {
  data: any;
  countries;
  theme;
  address = '';

  taxesForm: FormGroup = this.formBuilder.group({
    companyRegisterNumber: [''],
    taxId: [''],
    taxNumber: [''],
    turnoverTaxAct: [false],
  });

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    protected translateService: TranslateService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
  ) {
    super();
  }

  ngOnInit() {
    if (this.overlayData.data.business) {
      this.data = this.overlayData.data.business;
    }
    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.onSave();
    });

    this.theme = this.overlayConfig.theme;
    this.setOriginForm();
  }

  setOriginForm() {
    const formData = this.overlayData.data.business?.taxes || {};
    this.taxesForm.patchValue(formData);
  }

  onClose() {
    this.peOverlayRef.close();
  }

  onSave() {
    if (this.taxesForm.valid) {
      this.data['taxes'] = this.taxesForm.value;
      this.peOverlayRef.close({ data: this.data });
    }
  }
}
