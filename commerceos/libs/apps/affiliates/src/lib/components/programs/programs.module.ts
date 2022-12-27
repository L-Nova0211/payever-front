import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';

import { PeAffiliatesProgramsRoutingModule } from './programs-routing.module';
import { PeAffiliatesProgramsComponent } from './programs.component';



@NgModule({
  declarations: [
    PeAffiliatesProgramsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PeAffiliatesProgramsRoutingModule,
  ],
})
export class PeAffiliatesProgramsModule { }
