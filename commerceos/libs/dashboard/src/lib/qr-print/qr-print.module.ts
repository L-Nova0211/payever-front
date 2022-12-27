import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { PE_PRIMARY_HOST } from '@pe/domains';
import { ThirdPartyFormModule } from '@pe/forms';
import { SnackBarService } from '@pe/forms-core';
import { I18nModule } from '@pe/i18n';

import { PeQrPrintComponent } from './qr-print.component';
import { PE_QR_API_PATH, PE_QR_PRINT_HOST } from './qr-ptint.token';

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
    {
      deps: [PE_ENV],
      provide: PE_QR_API_PATH,
      useFactory: (env: EnvironmentConfigInterface) => env.connect.qr,
    },
    {
      provide: PE_QR_PRINT_HOST,
      useValue: PE_PRIMARY_HOST,
    },
  ],
})
export class PeQrPrintModule { }
