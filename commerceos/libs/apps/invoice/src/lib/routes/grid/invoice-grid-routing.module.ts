import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InvoiceResolver } from '../../resolver/invoice.resolver';

import { PeInvoiceGridComponent } from './invoice-grid.component';

const routes: Routes = [
  {
    path: '',
    component: PeInvoiceGridComponent,
  },
  {
    path: ':invoiceId/details',
    component: PeInvoiceGridComponent,
    resolve: {
      invoice: InvoiceResolver,
    },
    data: {
      isDetailsView: true,
    },
  },
];

export const shopThemesRoutingModule = RouterModule.forChild(routes);
@NgModule({
  imports: [shopThemesRoutingModule],
  exports: [RouterModule],
})
export class PeInvoiceGridRoutingModule { }
