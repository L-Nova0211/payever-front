import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PebEditorIconsModule, PebEditorSharedModule } from '@pe/builder-shared';

import { PebEditorPageSidebarFormatComponent } from './page-format.sidebar';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebEditorIconsModule,
    PebEditorSharedModule,
    MatIconModule,
  ],
  declarations: [
    PebEditorPageSidebarFormatComponent,
  ],
  exports: [
    PebEditorPageSidebarFormatComponent,
  ],
})
export class PebEditorPageFormatPluginModule { }
