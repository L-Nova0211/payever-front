import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';

import { RadioButtonComponent } from './radio';
import { RadioButtonDirective } from './radio.directive';

@NgModule({
  imports: [CommonModule, MatCommonModule, A11yModule],
  exports: [RadioButtonComponent, RadioButtonDirective],
  declarations: [RadioButtonComponent, RadioButtonDirective],
})
export class PebRadioModule {}
