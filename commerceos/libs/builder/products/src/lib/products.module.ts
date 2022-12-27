import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';

import { PeDataGridModule } from '@pe/data-grid';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';

import { PebProductCategoriesStylesComponent } from './product-categories/product-categories-styles.component';
import { PebProductCategoriesComponent } from './product-categories/product-categories.component';
import { PebProductsStylesComponent } from './products/products-styles.component';
import { PebProductsComponent } from './products/products.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatMenuModule,
    PeDataGridModule,
    PePlatformHeaderModule,
    ReactiveFormsModule,
    PeSidebarModule,
  ],
  declarations: [
    PebProductsComponent,
    PebProductCategoriesComponent,
    PebProductsStylesComponent,
    PebProductCategoriesStylesComponent,
  ],
  exports: [
    PebProductsComponent,
    PebProductCategoriesComponent,
  ],
})
export class PebProductsModule {}
