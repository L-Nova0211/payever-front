import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HammerModule } from '@angular/platform-browser';
import { ApolloModule } from 'apollo-angular';

import { AuthModule } from '@pe/auth';
import { EnvironmentConfigInterface, PeDestroyService, PE_ENV } from '@pe/common';
import { PeDataGridModule } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { SnackBarModule } from '@pe/forms';
import { PeGridService, PeGridViewportService } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { 
  MediaModule,
  MediaUrlPipe,
  PeMediaService,
  PE_CUSTOM_CDN_PATH,
  PE_MEDIA_API_PATH,
  PE_MEDIA_CONTAINER,
} from '@pe/media';
import { PeSidebarModule } from '@pe/sidebar';

import { ApolloConfigModule } from './app.apollo.module';
import { ContactsDialogService } from './product-editor/services/contacts-dialog.service';
import { ChannelTypeIconService } from './products-list/services/channel-type-icon.service';
import { DataGridService } from './products-list/services/data-grid/data-grid.service';
import { DialogService } from './products-list/services/dialog-data.service';
import { ImportApiService } from './products-list/services/import/import-api.service';
import { ProductsListService } from './products-list/services/products-list.service';
import { ProductsRouterModule } from './products-routing.module';
import { ProductsComponent } from './products.component';
import { PeGridProductsService, PeGridViewportProductsService } from './services';
import { BusinessResolver } from './shared/resolvers/business.resolver';
import { ProductsApiService } from './shared/services/api.service';
import { CollectionsDataService } from './shared/services/collections-data.service';
import { DefaultCountryService } from './shared/services/country.service';
import { ImagesUploaderService } from './shared/services/images-uploader.service';
import { TokenInterceptor } from './token.interceptor';

export const MediaModuleForRoot = MediaModule.forRoot({});
export const PeAuthModuleForRoot = AuthModule.forRoot();
export const I18nModuleForChild: ModuleWithProviders<I18nModule> = I18nModule.forChild();

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ApolloModule,
    ApolloConfigModule,
    FormsModule,
    ReactiveFormsModule,
    SnackBarModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    HammerModule,
    MediaModuleForRoot,
    PeAuthModuleForRoot,
    ProductsRouterModule,
    I18nModuleForChild,
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
  ],
  providers: [
    PeDestroyService,
    ProductsApiService,
    DialogService,
    ChannelTypeIconService,
    DefaultCountryService,
    ImagesUploaderService,
    BusinessResolver,
    CollectionsDataService,
    ContactsDialogService,
    DataGridService,
    ProductsListService,
    MediaUrlPipe,
    ImportApiService,
    PeMediaService,
    {
      provide: PeGridService,
      useClass: PeGridProductsService,
    },
    {
      provide: PeGridViewportService,
      useClass: PeGridViewportProductsService,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      deps: [PE_ENV],
      provide: PE_CUSTOM_CDN_PATH,
      useFactory: (env: EnvironmentConfigInterface) => env.custom.cdn,
    },
    {
      deps: [PE_ENV],
      provide: PE_MEDIA_API_PATH,
      useFactory: (env: EnvironmentConfigInterface) => env.backend.media,
    },
    {
      provide: PE_MEDIA_CONTAINER,
      useValue: PE_MEDIA_CONTAINER,
    },
  ],
  exports: [ProductsComponent],
  declarations: [ProductsComponent],
})
export class ProductsModule {}
