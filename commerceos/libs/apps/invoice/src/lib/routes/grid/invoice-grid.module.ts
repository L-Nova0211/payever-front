import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PeFoldersModule } from '@pe/folders';
import { PeGridModule } from '@pe/grid';

import { SharedModule } from '../../shared/modules/shared.module';

import { PeInvoiceGridRoutingModule } from './invoice-grid-routing.module';
import { PeInvoiceGridComponent } from './invoice-grid.component';

@NgModule({
  declarations: [
    PeInvoiceGridComponent,
  ],
  imports: [
    CommonModule,
    PeInvoiceGridRoutingModule,
    SharedModule,
    PeGridModule,
    PeFoldersModule,
  ],
})
export class PeInvoiceGridModule { }
