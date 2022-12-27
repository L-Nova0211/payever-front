import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebMenuComponent } from './menu';

@NgModule({
  imports: [CommonModule, OverlayModule],
  declarations: [PebMenuComponent],
  exports: [PebMenuComponent],
})
export class PeMenuModule {}
