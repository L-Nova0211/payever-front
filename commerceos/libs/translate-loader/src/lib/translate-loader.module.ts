import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TranslateLoader } from './translate-loader.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [TranslateLoader],
  exports: [TranslateLoader],
})
export class TranslateLoaderModule {}
