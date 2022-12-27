import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebThemesModule } from '@pe/themes';

import { PeInvoiceMaterialModule } from '../../misc/material/material.module';

import { PeThemeGridRoutingModule } from './theme-grid-routing.module';
import { PeThemeGridComponent } from './theme-grid.component';

@NgModule({
  declarations: [
    PeThemeGridComponent,
  ],
  imports: [
    CommonModule,
    PebThemesModule,
    PeThemeGridRoutingModule,
    PeInvoiceMaterialModule,
  ],
})
export class PeThemeGridModule { }
