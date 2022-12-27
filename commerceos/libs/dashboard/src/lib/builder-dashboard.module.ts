import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule, Routes } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';

import { PebViewerModule } from '@pe/builder-viewer';
import { I18nModule } from '@pe/i18n';

import { PeBuilderDashboardComponent } from './builder-dashboard.component';
import { PeQrPrintModule } from './qr-print';

const routes: Routes = [{
  path: '',
  component: PeBuilderDashboardComponent,
}];

@NgModule({
  declarations: [PeBuilderDashboardComponent],
  imports: [
    CommonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    RouterModule.forChild(routes),

    I18nModule,
    PebViewerModule.forRoot(),
    PeQrPrintModule,
  ],
  providers: [
    ApmService,
    Clipboard,
  ],
})
export class PeBuilderDashboardModule { }
