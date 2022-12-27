import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebListInfoComponent } from './list-info';

@NgModule({
  imports: [CommonModule],
  exports: [PebListInfoComponent, PlatformModule],
  declarations: [PebListInfoComponent],
})
export class PebListInfoModule {}
