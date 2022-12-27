import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebExpandablePanelComponent } from './expandable-panel';

@NgModule({
  imports: [CommonModule],
  declarations: [PebExpandablePanelComponent],
  exports: [PebExpandablePanelComponent],
})
export class PebExpandablePanelModule {}
