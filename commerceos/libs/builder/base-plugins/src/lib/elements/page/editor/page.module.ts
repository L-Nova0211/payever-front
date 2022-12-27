import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebEditorIconsModule, PebEditorSharedModule } from '@pe/builder-shared';

import { PebEditorPageSidebarComponent } from './page.sidebar';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebEditorIconsModule,
    PebEditorSharedModule,
  ],
  declarations: [
    PebEditorPageSidebarComponent,
  ],
  exports: [
    PebEditorPageSidebarComponent,
  ],
})
export class PebEditorPagePluginModule { }
