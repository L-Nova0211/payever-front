import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule, Routes } from '@angular/router';
import { NgxsModule } from '@ngxs/store';

import { PeDestroyService, PePreloaderService, PreloaderState, ProductsState } from '@pe/common';
import { PeDataGridModule, PeDataGridService } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { PeFoldersModule } from '@pe/folders';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { ProductsAppState } from '@pe/shared/products';
import { PeSidebarModule } from '@pe/sidebar';
import { SnackbarService } from '@pe/snackbar';
import { PebButtonModule } from '@pe/ui';
import {
  PebButtonToggleModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
} from '@pe/ui';

import { ChannelsService } from '../product-editor';
import { SharedModule } from '../shared/shared.module';

import { EditFolderComponent } from './components/edit-folder/edit-folder.component';
import { EditMenuComponent } from './components/edit-menu/edit-menu.component';
import { EditPictureComponent } from './components/edit-picture/edit-picture.component';
import { ImportMenuComponent } from './components/import-menu/import-menu.component';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { ThemesMediaUrlPipe } from './pipes/media-url.pipe';
import { ProductsFoldersService } from './services/products-folder.service';
import { ProductsListService } from './services/products-list.service';
import { ProductsRuleService } from './services/products-rules.service';


export const I18nModuleForChild: ModuleWithProviders<I18nModule> = I18nModule.forChild();

export const NgxsFeatureModule = NgxsModule.forFeature([ProductsState, ProductsAppState]);
export const NgxsFeaturePreloaderModule = NgxsModule.forFeature([PreloaderState]);

const routes: Routes = [
  {
    path: '',
    component: ProductsListComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list',
  },
];

export const ProductsListRouteModuleWithRoutes = RouterModule.forChild(routes);

@NgModule({
  imports: [
    CommonModule,
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
    SharedModule,
    FormsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    NgxsFeatureModule,
    NgxsFeaturePreloaderModule,
    I18nModuleForChild,
    ProductsListRouteModuleWithRoutes,
    MatMenuModule,
    MatIconModule,
    PebButtonModule,
    PeGridModule,
    PeFoldersModule,
    PebButtonToggleModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebFormFieldTextareaModule,
  ],
  exports: [],
  declarations: [
    ThemesMediaUrlPipe,
    EditMenuComponent,
    ImportMenuComponent,
    ProductsListComponent,
    EditFolderComponent,
    EditPictureComponent,
  ],
  providers: [
    SnackbarService,
    ChannelsService,
    PeDataGridService,
    PeDestroyService,
    ProductsFoldersService,
    ProductsRuleService,
    ProductsListService,
    PePreloaderService,
  ],
})
export class ProductsListModule {}
