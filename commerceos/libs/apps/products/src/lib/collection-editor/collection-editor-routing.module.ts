import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CollectionEditorComponent } from './containers/editor/editor.component';
import { CollectionProductsResolver } from './resolvers/collection-products.resolver';
import { CollectionResolver } from './resolvers/collection.resolver';

const routes: Routes = [
  // {
  //   path: 'delete-product',
  //   component: DeleteProductConfirmDialogComponent,
  // },
  // {
  //   path: 'add-leave',
  //   component: LeaveEditorConfirmDialogComponent,
  //   data: {isAddCollection: true},
  // },
  // {
  //   path: 'edit-leave',
  //   component: LeaveEditorConfirmDialogComponent,
  //   data: {isAddCollection: false},
  // },
  {
    path: ':collectionId',
    component: CollectionEditorComponent,
    resolve: {
      collection: CollectionResolver,
      collectionProducts: CollectionProductsResolver,
    },
    data: {
      isCollectionEdit: true,
    },
  },
  {
    path: '',
    component: CollectionEditorComponent,
    resolve: {
      collection: CollectionResolver,
    },
    data: {
      isCollectionEdit: false,
    },
  },
  {
    path: '**',
    component: CollectionEditorComponent,
  },
];

export const RouterWithChild: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
@NgModule({
  imports: [RouterWithChild],
  exports: [RouterModule],
})
export class CollectionEditorRoutingModule {}
