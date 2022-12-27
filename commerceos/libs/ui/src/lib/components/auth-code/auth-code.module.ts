import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PeAuthCodeComponent } from './auth-code';
import { PeAuthCodeDirective } from './auth-code.directive';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [PeAuthCodeComponent, PeAuthCodeDirective],
  declarations: [PeAuthCodeComponent, PeAuthCodeDirective],
})
export class PeAuthCodeModule {}
