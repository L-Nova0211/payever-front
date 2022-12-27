import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { FormModule as NgFormModule } from '@pe/forms';

import { ButtonModule } from '../../button';
import { NavbarModule } from '../../navbar';
import { OverlayBoxModule as NgOverlayBoxModule } from '../../overlay-box';

import { InfoBoxGeneratorComponent, InfoBoxGeneratorFormComponent } from './components';
import { ThirdPartyGeneratorService } from './services';

const shared: any[] = [
  InfoBoxGeneratorComponent,
  InfoBoxGeneratorFormComponent,
];

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatListModule,
    NavbarModule,
    ButtonModule,
    MatExpansionModule,
    MatMenuModule,
    MatSlideToggleModule,
    NgFormModule,
    NgOverlayBoxModule,
  ],
  exports: [
    ...shared,
  ],
  declarations: [
    ...shared,
  ],
  providers: [
    ThirdPartyGeneratorService,
  ],
})
/* @deprecated */
export class ThirdPartyGeneratorModule {
}
