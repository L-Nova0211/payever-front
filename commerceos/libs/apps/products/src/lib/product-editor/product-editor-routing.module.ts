import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  CountryPickerComponent,
  ColorPickerComponent,
  OptionTypePickerComponent,
  VariantEditorComponent,
  LanguagePickerComponent,
} from './components';
import { EditorComponent } from './containers/editor/editor.component';
import { CountriesResolver } from './resolvers/countries.resolver';
import { LanguagesResolver } from './resolvers/languages.resolve';
import { ProductResolver } from './resolvers/product.resolver';
import { RecurringBillingResolver } from './resolvers/recurring-billing.resolver';
import { VatRatesResolver } from './resolvers/vat-rates.resolver';

const childRoutes = [
  {
    component: VariantEditorComponent,
    path: 'variant',
    data: {
      isVariantEdit: false,
    },
    outlet: 'auxiliary',
  },
  {
    component: VariantEditorComponent,
    path: 'variant/:variantId',
    data: {
      isVariantEdit: true,
    },
    resolve: {
      product: ProductResolver,
    },
    outlet: 'auxiliary',
  },
  {
    path: 'option-type-picker',
    component: OptionTypePickerComponent,
    outlet: 'auxiliary',
  },
  {
    path: 'color-picker',
    component: ColorPickerComponent,
    outlet: 'auxiliary',
  },
  {
    path: 'country',
    component: CountryPickerComponent,
    outlet: 'auxiliary',
  },
  {
    path: 'language',
    component: LanguagePickerComponent,
    outlet: 'auxiliary',
  },
]

const routes: Routes = [
  {
    path: 'edit/:productId',
    component: EditorComponent,
    resolve: {
      product: ProductResolver,
      vatRates: VatRatesResolver,
      recurringBilling: RecurringBillingResolver,
      languages: LanguagesResolver,
      countries: CountriesResolver,
    },
    data: {
      isProductEdit: true,
    },
    children: [
      ...childRoutes,
      {
        path: 'option-type-picker/:variantId',
        component: OptionTypePickerComponent,
        outlet: 'auxiliary',
      },
      {
        path: 'color-picker/:variantId',
        component: ColorPickerComponent,
        outlet: 'auxiliary',
      },
    ],
  },
  {
    path: 'add',
    component: EditorComponent,
    resolve: {
      vatRates: VatRatesResolver,
      recurringBilling: RecurringBillingResolver,
      languages: LanguagesResolver,
      countries: CountriesResolver,
    },
    data: {
      isProductEdit: false,
    },
    children: [
      ...childRoutes,
    ],
  },
  {
    path: '**',
    resolve: {
      vatRates: VatRatesResolver,
      recurringBilling: RecurringBillingResolver,
    },
    component: EditorComponent,
  },
];

export const RouterWithChild: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterWithChild],
  exports: [RouterModule],
})
export class ProductsEditorRoutingModule {}
