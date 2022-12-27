import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';

import { AppThemeEnum } from '@pe/common';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';

import { BusinessEnvService } from '../../services';
import { AbstractComponent } from '../abstract';

@Component({
  selector: 'peb-edit-style',
  templateUrl: './edit-style.component.html',
  styleUrls: ['./edit-style.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditStyleComponent extends AbstractComponent implements OnInit {
  primaryColor: string;
  secondaryColor: string;
  themeSettings: any;
  styleForm: any;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  constructor(
    private envService: BusinessEnvService,
    private peOverlayRef: PeOverlayRef,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
  ) {
    super();
  }

  ngOnInit() {
    this.styleForm = this.fb.group({
      primaryColor: [''],
      secondaryColor: [''],
    });

    if (this.overlayData.data.themeSettings) {
      this.themeSettings = this.overlayData.data.themeSettings;
      this.primaryColor = this.themeSettings.primaryColor || '#0091df';
      this.secondaryColor = this.themeSettings.secondaryColor || '#fefefe';
      this.styleForm.controls.primaryColor.patchValue(this.primaryColor);
      this.styleForm.controls.secondaryColor.patchValue(this.secondaryColor);
      this.cdr.detectChanges();
    }

    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.onSave();
    });
  }

  onSave() {
    if (this.primaryColor && this.secondaryColor) {
      this.peOverlayRef.close({
        data: {
          style: {
            primaryColor: this.styleForm.controls.primaryColor.value,
            secondaryColor: this.styleForm.controls.secondaryColor.value,
            id: this.themeSettings._id,
          },
        },
      });
    }
  }

}
