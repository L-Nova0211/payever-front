import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebEditorIconsModule } from '@pe/builder-shared';

import { PebEditorLanguageToolDialogComponent } from './language.dialog';
import { PebEditorLanguageTool } from './language.tool';
import { PebEditorLanguagesComponent } from './languages/languages.component';


@NgModule({
  declarations: [
    PebEditorLanguageTool,
    PebEditorLanguagesComponent,
    PebEditorLanguageToolDialogComponent,
  ],
  exports: [
    PebEditorLanguageTool,
    PebEditorLanguageToolDialogComponent,
    PebEditorLanguagesComponent,
  ],
  imports: [
    CommonModule,
    PebEditorIconsModule,
  ],
})
export class PebEditorLanguageToolModule {
}
