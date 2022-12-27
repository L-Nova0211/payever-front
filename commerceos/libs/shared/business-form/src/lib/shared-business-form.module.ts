import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PhoneInputFilterDirective } from './directives/phone-input.directive';
import { GetValuesPipe } from './pipes/get-values.pipe';

@NgModule({
  declarations: [
    GetValuesPipe,
    PhoneInputFilterDirective,
  ],
  imports: [CommonModule],
  exports: [
    GetValuesPipe,
    PhoneInputFilterDirective,
  ],
})
export class SharedBusinessFormModule {}
