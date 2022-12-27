import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PebRendererSharedModule } from '@pe/builder-renderer';
import { PebEditorIconsModule, PebEditorSharedModule } from '@pe/builder-shared';

import { PebEditorSectionSidebarComponent } from './section.sidebar';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    PebEditorIconsModule,
    PebEditorSharedModule,
    PebRendererSharedModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  declarations: [
    PebEditorSectionSidebarComponent,
  ],
  exports: [
    PebEditorSectionSidebarComponent,
  ],
})
export class PebEditorSectionPluginModule { }
