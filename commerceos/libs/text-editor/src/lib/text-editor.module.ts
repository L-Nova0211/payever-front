import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTreeModule } from '@angular/material/tree';

import { I18nModule } from '@pe/i18n';
import { PeSearchAnimatedModule } from '@pe/ui';

import { TextEditorComponent } from './component/text-editor.component';
import { PeTextEditorPlaceholderComponent } from './placeholder/placeholder.component';
import { CommandExecutorService } from './services/command-executor.service';
import { TextEditorService } from './services/text-editor.service';
import { TextEditorToolbarComponent } from './toolbar/text-editor-toolbar.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatExpansionModule,
    MatSelectModule,
    MatMenuModule,
    MatIconModule,
    MatTreeModule,

    I18nModule.forChild(),
    PeSearchAnimatedModule,
  ],
  declarations: [
    TextEditorToolbarComponent,
    TextEditorComponent,
    PeTextEditorPlaceholderComponent,
  ],
  providers: [
    TextEditorService,
    CommandExecutorService,
  ],
  exports: [
    TextEditorComponent,
    TextEditorToolbarComponent,
  ],
})
export class PETextEditorModule {}
