import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebContextMenuComponent } from './context-menu';


@NgModule({
  imports: [CommonModule, OverlayModule],
  declarations: [PebContextMenuComponent],
  exports: [PebContextMenuComponent],
})
export class PebContextMenuModule { }
