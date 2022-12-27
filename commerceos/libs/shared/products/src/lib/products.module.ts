import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { ProductsState } from '@pe/common';

import { ProductsAppState } from './store/products.state';

export const NgxsFeatureModule = NgxsModule.forFeature([ProductsState, ProductsAppState]);

@NgModule({
  imports: [
    CommonModule,
    NgxsFeatureModule,
  ],
})
export class PeDataAccessProductsModule {}
