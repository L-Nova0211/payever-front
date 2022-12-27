import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ThirdPartyFormModule } from '@pe/forms';
import { SnackBarService } from '@pe/forms-core';
import { I18nModule } from '@pe/i18n';

import { PeQrPrintComponent } from './qr-print.component';

export const i18n = I18nModule.forRoot();

@NgModule({
  declarations: [PeQrPrintComponent],
  imports: [
    CommonModule,
    ThirdPartyFormModule,
    i18n,
  ],
  providers: [
    MatSnackBarModule,
    SnackBarService,
  ],
})
export class PeQrPrintModule { }
