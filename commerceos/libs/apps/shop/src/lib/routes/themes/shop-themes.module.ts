import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebThemesModule } from '@pe/themes';

import { PeShopMaterialComponent } from '../../components/material/material.component';

import { PebShopThemesRoutingModule } from './shop-themes-routing.module';
import { PebShopThemesComponent } from './shop-themes.component';

@NgModule({
  declarations: [
    PebShopThemesComponent,
  ],
  imports: [
    CommonModule,
    PebThemesModule,
    PebShopThemesRoutingModule,
  ],
})
export class PebShopThemesModule { }
