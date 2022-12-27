import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FormCoreModule } from '@pe/forms';

import { ButtonModule } from '../../button';
import { NavbarModule } from '../../navbar';
import { AbbreviationPipe } from '../../pipes';

import {
  InfoBoxConfirmComponent,
  OverlayContainerComponent,
  SubdashboardHeaderComponent,
} from './components';

const shared: any[] = [
  InfoBoxConfirmComponent,
  OverlayContainerComponent,
  SubdashboardHeaderComponent,
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
    MatButtonToggleModule,
    MatExpansionModule,
    MatMenuModule,
    FormCoreModule,
  ],
  exports: [
    ...shared,
  ],
  declarations: [
    AbbreviationPipe,
    ...shared,
  ],
})
export class OverlayBoxModule {}
