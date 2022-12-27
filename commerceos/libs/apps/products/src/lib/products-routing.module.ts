import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CollectionsEditorModule } from './collection-editor/collection-editor.module';
import { ProductsEditorModule } from './product-editor/product-editor.module';
import { ProductsListModule } from './products-list/products-list.module';
import { ProductsComponent } from './products.component';
import { BusinessResolver } from './shared/resolvers/business.resolver';

export function getProductsListModule() {
  return ProductsListModule;
}

export function getProductsEditorModule() {
  return ProductsEditorModule;
}

export function getCollectionsEditorModule() {
  return CollectionsEditorModule;
}

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
  },
  {
    path: 'list',
    component: ProductsComponent,
    resolve: {
      business: BusinessResolver,
    },
    children: [
      {
        path: '',
        loadChildren: getProductsListModule,
      },
      {
        path: 'products-editor',
        outlet: 'editor',
        loadChildren: getProductsEditorModule,
      },
      {
        path: 'collections-editor',
        outlet: 'editor',
        loadChildren: getCollectionsEditorModule,
      },
    ],
  },
];

export const RouterModuleWithRoutes = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleWithRoutes],
  exports: [RouterModule],
  declarations: [],
})
export class ProductsRouterModule {}
