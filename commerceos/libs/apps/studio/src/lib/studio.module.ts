import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsModule } from '@ngxs/store';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { PeAuthService } from '@pe/auth';
import { EnvService, PePreloaderService, PreloaderState } from '@pe/common';
import { PeDataGridModule } from '@pe/data-grid';
import { OverlayWidgetModule } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';

import { PipeModule } from './core/pipes/pipe/pipe.module';
import { DataGridItemsService } from './core/services/data-grid-items.service';
import { StudioEnvService } from './core/services/studio-env.service';
import { StudioAppState } from './core/store/studio.app.state';
import { PeStudioRoutingModule } from './studio.routing.module';
import { StudioLayoutModule } from './studio/studio-layout.module';

export const NgxsFeatureModule = NgxsModule.forFeature([PreloaderState]);

@NgModule({
  imports: [
    CommonModule,
    PeStudioRoutingModule,
    StudioLayoutModule,

    PeDataGridModule,
    PePlatformHeaderModule,
    PeSidebarModule,
    OverlayWidgetModule,

    MatProgressSpinnerModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    MatExpansionModule,
    MatTreeModule,

    NgScrollbarModule,
    NgxsModule.forFeature([StudioAppState]),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxsFeatureModule,
    PipeModule,
  ],
  declarations: [],
  providers: [
    DataGridItemsService,
    PePreloaderService,

    {
      provide: EnvService,
      useClass: StudioEnvService,
    },
    PeAuthService,
  ],
})
export class PeStudioModule {}
