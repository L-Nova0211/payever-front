import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebButtonComponent } from './button';

@NgModule({
  imports: [CommonModule],
  exports: [PebButtonComponent],
  declarations: [PebButtonComponent],
})
export class PebButtonModule {}
