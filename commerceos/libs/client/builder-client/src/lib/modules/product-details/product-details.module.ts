import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebRendererModule } from '@pe/builder-renderer';

import { PebClientProductDetailsComponent } from './product-details.component';
import { PebClientProductDetailsService } from './product-details.service';


@NgModule({
  declarations: [
    PebClientProductDetailsComponent,
  ],
  imports: [
    CommonModule,
    OverlayModule,
    PebRendererModule,
  ],
  exports: [
    PebClientProductDetailsComponent,
  ],
  providers: [
    PebClientProductDetailsService,
  ],
})
export class PebClientProductDetailsModule { }
