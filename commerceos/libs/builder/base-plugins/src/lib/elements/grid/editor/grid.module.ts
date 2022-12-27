import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { PebPagesModule } from '@pe/builder-pages';
import { PebRendererSharedModule } from '@pe/builder-renderer';
import { PebEditorIconsModule, PebEditorSharedModule } from '@pe/builder-shared';

import { PebEditorGridSidebarComponent } from './grid.sidebar';


@NgModule({
  declarations: [
    PebEditorGridSidebarComponent,
  ],
  exports: [
    PebEditorGridSidebarComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    PebEditorIconsModule,
    PebEditorSharedModule,
    ReactiveFormsModule,
    PebPagesModule,
    PebRendererSharedModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
})
export class PebEditorGridPluginModule { }
