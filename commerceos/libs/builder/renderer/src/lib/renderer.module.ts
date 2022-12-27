import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { I18nModule } from '@pe/i18n';
import { TranslateService } from '@pe/i18n-core';

import { PebRenderer } from './root/renderer.component';
import { PebLoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { PebRendererSharedModule } from './shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PebRendererSharedModule,
    MatProgressSpinnerModule,
    I18nModule,
  ],
  declarations: [
    PebRenderer,
    PebLoadingSpinnerComponent,
  ],
  providers: [
    TranslateService,
  ],
  exports: [
    PebRenderer,
  ],
})
export class PebRendererModule {
}
