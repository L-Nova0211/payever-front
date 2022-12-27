import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ThirdPartyFormModule } from '@pe/forms';
import { SnackBarService } from '@pe/forms-core';
import { I18nModule } from '@pe/i18n';

export const i18n = I18nModule.forRoot();

@NgModule({
  imports: [
    MatSnackBarModule,
    i18n,
    ThirdPartyFormModule,
  ],
  providers: [
    SnackBarService,
  ],
})

export class PebPosConnectModule { }
