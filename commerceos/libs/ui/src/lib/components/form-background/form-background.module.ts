import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebFormBackgroundComponent } from './form-background';
import { PebTwoColumnFormComponent } from './two-column-form';

@NgModule({
  imports: [CommonModule],
  exports: [PebFormBackgroundComponent, PebTwoColumnFormComponent],
  declarations: [PebFormBackgroundComponent, PebTwoColumnFormComponent],
})
export class PebFormBackgroundModule {}
