import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';

import { PebDirectivesModule, PebEditorIconsModule, PebEditorSharedModule } from '@pe/builder-shared';

import { PebLayersComponent } from './layers.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PebEditorIconsModule,
    PebEditorSharedModule,
    MatIconModule,
    PebDirectivesModule,
    MatTreeModule,
    MatIconModule,
  ],
  declarations: [
    PebLayersComponent,
  ],
  exports: [
    PebLayersComponent,
  ],
})
export class PebLayersModule {}
