import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebEditorIconsModule, PebEditorSharedModule } from '@pe/builder-shared';

import { PebEditorMotionSidebarComponent } from './motion.sidebar';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebEditorIconsModule,
    PebEditorSharedModule,
  ],
  declarations: [
    PebEditorMotionSidebarComponent,
  ],
  exports: [
    PebEditorMotionSidebarComponent,
  ],
})
export class PebEditorMotionPluginModule { }
