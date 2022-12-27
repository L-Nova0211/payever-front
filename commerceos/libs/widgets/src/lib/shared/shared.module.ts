import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AbbreviationPipe } from './abbreviation.pipe';

const DECLARATIONS = [
  AbbreviationPipe,
];

@NgModule({
  declarations: DECLARATIONS,
  imports: [
    CommonModule,
  ],
  exports: DECLARATIONS,
  providers: [
  ],
})
export class SharedModule { }
