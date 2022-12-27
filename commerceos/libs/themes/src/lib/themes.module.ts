import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule, Routes } from '@angular/router';
import { NgxsModule } from '@ngxs/store';

import { PebTranslateService } from '@pe/builder-core';
import { PebViewerModule } from '@pe/builder-viewer';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { ConfirmationScreenModule } from '@pe/confirmation-screen';
import { PeFiltersModule } from '@pe/filters';
import {
  PeFoldersActionsService,
  PeFoldersApiService,
  PeFoldersModule,
} from '@pe/folders';
import { PeGridModule, PeGridState } from '@pe/grid';
import { I18nModule, TranslateService } from '@pe/i18n';
import { PeMediaEditorModule, PeMediaService, PE_CUSTOM_CDN_PATH, PE_MEDIA_API_PATH } from '@pe/media';
import { PeSidebarModule } from '@pe/sidebar';
import {
  PebButtonToggleModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
} from '@pe/ui';

import { PeThemeEditorComponent } from './components';
import { PeThemesComponent } from './components/themes';
import { ThemesApi } from './services';

const routes: Routes = [{
  path: '',
  component: PeThemesComponent,
}]

@NgModule({
  declarations: [
    PeThemeEditorComponent,
    PeThemesComponent,
  ],
  exports: [PeThemesComponent],
  imports: [
    CommonModule,
    MatMenuModule,
    MatSnackBarModule,
    PeSidebarModule,
    PeFiltersModule,
    MatTreeModule,
    PebViewerModule.forRoot(),
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatProgressSpinnerModule,
    MatIconModule,
    NgxsModule.forFeature([PeGridState]),
    PebFormFieldTextareaModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebButtonToggleModule,
    FormsModule,
    I18nModule.forChild(),
    PeFoldersModule,
    PeGridModule,
    PeMediaEditorModule,
    ConfirmationScreenModule,
  ],
  providers: [
    PeFoldersApiService,
    PeFoldersActionsService,
    PeMediaService,
    ThemesApi,
    {
      provide: PebTranslateService,
      useExisting: TranslateService,
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
  ],
})
export class PebThemesModule { }
