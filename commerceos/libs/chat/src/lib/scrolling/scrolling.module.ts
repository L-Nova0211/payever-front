import { ScrollingModule as CdkScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { VirtualForDirective } from './virtual-for.directive';
import { VirtualScrollViewportComponent } from './virtual-scroll-viewport.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CdkScrollingModule,
  ],
  declarations: [
    VirtualScrollViewportComponent,
    VirtualForDirective,
  ],
  exports: [
    VirtualScrollViewportComponent,
    VirtualForDirective,
  ],
})

export class ScrollingModule {}