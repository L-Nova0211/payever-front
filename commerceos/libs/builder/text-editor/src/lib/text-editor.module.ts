import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { registerFontFamily, registerFontSize, registerFontWeight, registerPebLink } from './quill';
import { PebTextActivationService } from './text-editor-activation.service';
import { PebTextEditor } from './text-editor.component';

@NgModule({
  declarations: [
    PebTextEditor,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    PebTextEditor,
  ],
  providers: [
    PebTextActivationService,
  ],
})
export class PebTextEditorModule {
  constructor() {
    registerFontSize();
    registerFontFamily();
    registerFontWeight();
    registerPebLink();
  }
}
