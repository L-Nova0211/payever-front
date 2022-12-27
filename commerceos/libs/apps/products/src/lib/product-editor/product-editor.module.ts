import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { ApolloModule } from 'apollo-angular';
import { HttpLinkModule } from 'apollo-angular-link-http';
import { DragulaModule } from 'ng2-dragula';

import { AuthModule } from '@pe/auth';
import { ColorPickerModule } from '@pe/color-picker';
import { ConfirmationScreenModule } from '@pe/confirmation-screen';
import { FormComponentsColorPickerModule, FormCoreModule, FormModule, ThirdPartyFormModule } from '@pe/forms';
import { I18nModule, LANG } from '@pe/i18n';
import { MediaModule, MediaUrlPipe } from '@pe/media';
import { PETextEditorModule } from '@pe/text-editor';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule, PebFormFieldTextareaModule,
  PebMessagesModule,
  PebProductPickerModule,
  PebSelectModule, PeSearchModule,
} from '@pe/ui';

import { ApolloConfigModule } from '../app.apollo.module';
import { SharedModule } from '../shared/shared.module';

import { ProductsEditorAssetsDragAndDropComponent } from './assets/assets-drag-and-drop/assets-drag-and-drop.component';
import { AssetsShippingIconsComponent } from './assets/assets-shipping-icons/assets-shipping-icons.component';
import {
  CountryPickerComponent,
  ColorPickerComponent,
  PeProductsAutocompleteComponent,
  EditorDescriptionComponent,
  EditorPicturesComponent,
  LanguagePickerComponent,
} from './components';
import {
  EditorCategorySectionComponent,
  EditorChannelsSectionComponent,
  EditorInventorySectionComponent,
  EditorMainSectionComponent,
  EditorRecommendationsSectionComponent,
  EditorRecurringBillingSectionComponent,
  EditorShippingSectionComponent,
  EditorTaxesSectionComponent,
  EditorVariantsSectionComponent,
  EditorVisibilitySectionComponent,
  EditorSeoSectionComponent,
  VariantEditorComponent,
  ProductsPricingSectionComponent,
} from './components/editor-sections';
import { EditorAttributesSectionComponent, ProductsEditorContentSectionComponent } from './components/editor-sections';
import { OptionTypePickerComponent } from './components/option-type-picker/option-type-picker.component';
import { ProductTypeComponent } from './components/product-type/product-type.component';
import { EditorComponent } from './containers/editor/editor.component';
import { ProductsEditorRoutingModule } from './product-editor-routing.module';
import { CountriesResolver } from './resolvers/countries.resolver';
import { LanguagesResolver } from './resolvers/languages.resolve';
import { ProductResolver } from './resolvers/product.resolver';
import { RecurringBillingResolver } from './resolvers/recurring-billing.resolver';
import { VatRatesResolver } from './resolvers/vat-rates.resolver';
import { ChannelsService, VariantStorageService, VatRatesApiService } from './services';
import { SectionsService as ProductSectionsService } from './services';
import { ApiBuilderService } from './services/api-builder.service';
import { ContactsDialogService } from './services/contacts-dialog.service';
import { CountryService } from './services/country.service';
import { LanguageService } from './services/language.service';
import { VariantState } from './store/variant.state';


export const DragulaModuleForRoot = DragulaModule;
export const AuthModuleForRoot = AuthModule.forRoot();
export const NgxsFeatureModule = NgxsModule.forFeature([VariantState]);


const EXP: any[] = [
  AssetsShippingIconsComponent,
  ProductsEditorAssetsDragAndDropComponent,
  EditorComponent,
  EditorPicturesComponent,
  EditorMainSectionComponent,
  ProductsPricingSectionComponent,
  ProductsEditorContentSectionComponent,
  EditorAttributesSectionComponent,
  EditorInventorySectionComponent,
  EditorCategorySectionComponent,
  EditorChannelsSectionComponent,
  EditorRecommendationsSectionComponent,
  EditorRecurringBillingSectionComponent,
  EditorShippingSectionComponent,
  EditorTaxesSectionComponent,
  EditorVariantsSectionComponent,
  EditorVisibilitySectionComponent,
  EditorSeoSectionComponent,
  ProductTypeComponent,
  VariantEditorComponent,
  EditorDescriptionComponent,
  ColorPickerComponent,
  PeProductsAutocompleteComponent,
  CountryPickerComponent,
  LanguagePickerComponent,
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgxsFeatureModule,
    MatProgressSpinnerModule,
    ApolloConfigModule,
    ApolloModule,
    HttpLinkModule,
    FormsModule,
    ReactiveFormsModule,
    FormModule,
    ThirdPartyFormModule,
    DragDropModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTableModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatExpansionModule,
    DragulaModuleForRoot,
    MediaModule,
    PETextEditorModule,
    FormComponentsColorPickerModule,
    ColorPickerModule,
    AuthModuleForRoot,
    FormCoreModule,
    ProductsEditorRoutingModule,
    I18nModule,
    SharedModule,
    ScrollingModule,

    PebButtonToggleModule,
    PebExpandablePanelModule,
    PebFormFieldInputModule,
    PebFormFieldTextareaModule,
    PebMessagesModule,
    PebSelectModule,
    ConfirmationScreenModule,
    PebFormBackgroundModule,
    PebButtonModule,
    PebProductPickerModule,
    PeSearchModule
  ],
  exports: [],
  declarations: [...EXP, OptionTypePickerComponent],
  providers: [
    ProductResolver,
    RecurringBillingResolver,
    ChannelsService,
    ContactsDialogService,
    VatRatesApiService,
    VatRatesResolver,
    MediaUrlPipe,
    ProductSectionsService,
    LanguageService,
    CountryService,
    ApiBuilderService,
    VariantStorageService,
    CountriesResolver,
    LanguagesResolver,
    { provide: LANG, useValue: 'en' },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class ProductsEditorModule {}
