import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ClonePipe } from './clone.pipe';

@NgModule({
  declarations: [ClonePipe],
  imports: [CommonModule],
  exports: [ClonePipe],
})
export class PipeModule {}
