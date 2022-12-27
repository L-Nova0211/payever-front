import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PebEditorSharedModule } from '@pe/builder-shared';

import { PebEditorTextSidebarComponent } from './text.sidebar';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebEditorSharedModule,
    MatIconModule,
  ],
  declarations: [
    PebEditorTextSidebarComponent,
  ],
  exports: [
    PebEditorTextSidebarComponent,
  ],
})
export class PebEditorTextPluginModule {
}
