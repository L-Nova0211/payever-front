import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { PebShopEditorModule } from '@pe/builder-shop-editor';
import { PeDataGridModule } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { I18nModule } from '@pe/i18n';
import { PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';

import {
  PebInvoiceBuilderInsertComponent,
  PebInvoiceBuilderViewComponent,
  PeInvoiceBuilderEditComponent,
  PeInvoiceBuilderPublishComponent,
} from '../../components';
import { InvoiceThemeGuard } from '../../guards/theme.guard';
import { PeInvoiceSharedModule } from '../../invoice.shared';

import { InvoiceEditorComponent } from './invoice-editor.component';

export const routerModule = RouterModule.forChild([
  {
    path: '',
    component: InvoiceEditorComponent,
    canActivate: [InvoiceThemeGuard],
  },
]);

@NgModule({
  declarations: [
    InvoiceEditorComponent,
    PeInvoiceBuilderPublishComponent,
    PebInvoiceBuilderViewComponent,
    PeInvoiceBuilderEditComponent,
    PebInvoiceBuilderInsertComponent,
  ],
  imports: [
    CommonModule,
    PebShopEditorModule,
    I18nModule,
    MatIconModule,
    routerModule,
    PeInvoiceSharedModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
    PebInvoiceBuilderInsertComponent,
    PeInvoiceBuilderEditComponent,
  ],
  providers: [
  {
    provide: PePlatformHeaderService,
    useClass: PlatformHeaderFakeService,
  },
  ],
})
export class PeInvoiceEditorModule {}
