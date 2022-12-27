import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { LoaderOffGuard } from './guards/loader-off.guard';
import { AbbreviationPipe } from './pipes/abbreviation.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [AbbreviationPipe],
  exports: [AbbreviationPipe],
  providers: [LoaderOffGuard],
})
export class BaseModule { }
