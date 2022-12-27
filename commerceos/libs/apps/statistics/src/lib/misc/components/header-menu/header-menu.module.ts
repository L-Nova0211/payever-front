import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PeHeaderMenuComponent } from './header-menu';

@NgModule({
  imports: [CommonModule, OverlayModule],
  declarations: [PeHeaderMenuComponent],
  exports: [PeHeaderMenuComponent],
})
export class PeHeaderMenuModule {}
