import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTreeModule } from '@angular/material/tree';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { PeFiltersModule } from '@pe/filters';
import { PeFoldersModule } from '@pe/folders';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { OverlayWidgetModule } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';
import { PETextEditorModule } from '@pe/text-editor';
import {
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PeUploaderModule
} from '@pe/ui';

import { MediaDetailsWrapComponent } from '../components/media-details-wrap/media-details-wrap.component';
import { PipeModule } from '../core/pipes/pipe/pipe.module';
import { StudioEnvService } from '../core/services/studio-env.service';
import { UploadTextService } from '../core/services/upload-text.service';

import { PeStudioGridComponent } from './grid/grid.component';
import { PeStudioLayoutRoutingModule } from './layout.routing.module';
import { PeLayoutComponent } from './layout/pe-layout.component';
import { PeMyMediaComponent } from './my-media/pe-my-media.component';
import { PePreviewComponent } from './my-media/preview/pe-preview.component';
import { PeStudioUploadOptionsComponent } from './upload-options/upload-options.component';
import { PeStudioUploadTextOptionComponent } from './upload-options/upload-text-option/upload-text-option.component';

(window as any).PayeverStatic.IconLoader.loadIcons([
  'edit-panel',
]);

export const i18n = I18nModule.forRoot();
@NgModule({
  declarations: [
    PeLayoutComponent,
    PeMyMediaComponent,
    PePreviewComponent,
    PeStudioGridComponent,
    MediaDetailsWrapComponent,
    PeStudioUploadOptionsComponent,
    PeStudioUploadTextOptionComponent,
  ],
  imports: [
    CdkTreeModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    PeStudioLayoutRoutingModule,
    PeUploaderModule,
    PebExpandablePanelModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PeFiltersModule,
    PeFoldersModule,
    PeGridModule,
    PePlatformHeaderModule,
    PePlatformHeaderModule,
    PeSidebarModule,
    PETextEditorModule,
    OverlayWidgetModule,
    i18n,

    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTreeModule,

    PipeModule,
    NgScrollbarModule,
  ],
  entryComponents: [PePreviewComponent],
  providers: [
    StudioEnvService,
    UploadTextService,
  ],
})
export class StudioLayoutModule {}
