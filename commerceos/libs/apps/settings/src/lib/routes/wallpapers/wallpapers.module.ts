import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { AuthModule } from '@pe/auth';
import { ConfirmationScreenModule } from '@pe/confirmation-screen';
import { PeFoldersModule } from '@pe/folders';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { MediaUrlPipe } from '@pe/media';
import { PeSidebarModule } from '@pe/sidebar';
import {
    PebButtonModule,
    PebButtonToggleModule,
    PebExpandablePanelModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebLogoPickerModule,
    PebMessagesModule,
    PebSelectModule,
    PeInputPickerModule,
    PePickerModule,
} from '@pe/ui';

import { PebWallpapersService, PebWallpaperStorageService, WallpaperGridItemConverterService } from '../../services';
import { PebWallpaperGridSortHelperService } from '../../services/wallpaper-grid-sorting-helper.service';
import { PebWallpaperSidebarService } from '../../services/wallpaper-sidebar.service';

import { WallpapersRoutingModule } from './wallpapers-routing.module';
import { WallpapersComponent } from './wallpapers.component';






@NgModule({
  declarations: [
    WallpapersComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WallpapersRoutingModule,
    I18nModule,
    AuthModule,
    PeGridModule,
    PeFoldersModule,
    PeSidebarModule,
    MatIconModule,
    MatDialogModule,
    PebExpandablePanelModule,
    PebFormFieldInputModule,
    PebFormBackgroundModule,
    PebButtonModule,
    PebLogoPickerModule,
    PebSelectModule,
    PebButtonToggleModule,
    PePickerModule,
    PeInputPickerModule,
    PebMessagesModule,
    MatGoogleMapsAutocompleteModule,
    ConfirmationScreenModule,
  ],
  providers: [
    PebWallpapersService,
    PebWallpaperStorageService,
    WallpaperGridItemConverterService,
    MediaUrlPipe,
    PebWallpaperSidebarService,
    PebWallpaperGridSortHelperService,
  ],
})
export class WallpapersModule { }
