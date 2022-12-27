import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PebInvoiceGuard } from './guards/invoice.guard';
import { InvoiceThemeGuard } from './guards/theme.guard';
import { PeInvoiceComponent } from './routes/_root/invoice-root.component';
import { PeBrowseContactsModule } from './routes/edit/components/browse-contacts/browse-contacts.module';
import { PeBrowseProductsModule } from './routes/edit/components/browse-products/browse-products.module';
import { PeInvoiceEditorModule } from './routes/editor/invoice-editor.module';
import { PeInvoiceSettingsComponent } from './routes/settings/settings.component';
import { BusinessResolver } from './shared/resolvers/business.resolver';

export function editorModule() {

  return PeInvoiceEditorModule;
}

export function browseProductsModule() {

  return PeBrowseProductsModule;
}

export function browseContactsModule() {

  return PeBrowseContactsModule;
}

const routes: Routes = [
  {
    path: '',
    component: PeInvoiceComponent,
    canActivate: [PebInvoiceGuard],
    resolve: {
      business: BusinessResolver,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./routes/grid/invoice-grid.module').then(m => m.PeInvoiceGridModule),
      },
      {
        path:'list',
        redirectTo:'',
      },
      {
        path: 'add-product',
        loadChildren: browseProductsModule,
      },
      {
        path: 'add-contact',
        loadChildren: browseContactsModule,
      },
      {
        path: 'themes',
        canActivate: [InvoiceThemeGuard],
        loadChildren: () => import('./routes/theme-grid/theme-grid.module').then(m => m.PeThemeGridModule),
      },
      {
        path: 'edit',
        loadChildren: editorModule,
      },
      {
        path: 'settings',
        component: PeInvoiceSettingsComponent,
      },
      {
        path: 'builder/:themeId/edit',
        loadChildren: editorModule,
      },
    ],
  },

];

export const RouterModuleForChild: any = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
  providers: [],
})
export class PeInvoiceRouteModule {}
