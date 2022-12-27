import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { cloneDeep } from 'lodash-es';

import { AppThemeEnum } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayWidgetService, PeOverlayConfig, PeOverlayRef } from '@pe/overlay-widget';

import { FormSchemeModalInterface } from '../../interfaces';
import { ScreenTypeStylesService } from '../../services/screen-type.service';
import { StyleModalComponent } from '../style-modal/style-modal.component';

@Component({
  selector: 'pe-style-modal-item',
  templateUrl: './style-modal-item.component.html',
  styles: [`
    :host {
      display: contents;
    }
    .text-left {
      max-width: none !important;
      padding-left: 12px !important;
    }
    .mat-list-item {
      margin-top: 1px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleModalItemComponent {
  @Input() theme: AppThemeEnum;
  @Input() parentForm: FormGroup;
  @Input() modal: FormSchemeModalInterface;

  dialogRef: PeOverlayRef;

  constructor(
    private overlayService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private screenTypeStylesService: ScreenTypeStylesService,
  ) { }

  openDialog(modal: FormSchemeModalInterface): void {
    const parentForm: FormGroup = cloneDeep(this.parentForm);

    const config: PeOverlayConfig = {
      hasBackdrop: true,
      backdropClass: 'settings-modal',
      backdropClick: () => {},
      data: {
        theme: this.theme,
        parentForm,
        controls: modal.controls,
        screenTypeStylesService: this.screenTypeStylesService,
      },
      headerConfig: {
        title: this.translateService.translate(modal.titleKey),
        backBtnTitle: this.translateService.translate('actions.cancel'),
        backBtnCallback: () => {
          this.dialogRef.close();
        },
        doneBtnCallback: () => {
          this.parentForm.patchValue(parentForm.value);
          this.dialogRef.close();
        },
        doneBtnTitle: this.translateService.translate('actions.done'),
        theme: this.theme,
      },
      component: StyleModalComponent,
    };

    this.dialogRef = this.overlayService.open(config);
  }
}
