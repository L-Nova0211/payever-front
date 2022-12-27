import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebThemesModule } from '@pe/themes';

import { PeSiteMaterialModule } from '../../components/material/material.module';

import { PebThemeGridRoutingModule } from './theme-grid-routing.module';
import { PebThemeGridComponent } from './theme-grid.component';

@NgModule({
  declarations: [
    PebThemeGridComponent,
  ],
  imports: [
    CommonModule,
    PebThemesModule,
    PebThemeGridRoutingModule,
    PeSiteMaterialModule,
  ],
})
export class PebThemeGridModule { }
