import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { ApolloModule } from 'apollo-angular';

import { ContactsGQLService } from '@pe/apps/contacts';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PebExpandablePanelModule, PePickerModule } from '@pe/ui';

import { PeBuilderShareApi } from './builder-share.api';
import { PeBuilderShareComponent } from './builder-share.component';
import { PeBuilderShareService } from './builder-share.service';
import { PeBuilderShareGetLinkComponent } from './get-link/get-link.component';
import { PeBuilderShareStyles } from './styles/builder-share.styles';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebExpandablePanelModule,
    PePickerModule,
    ApolloModule,
    MatMenuModule,
  ],
  declarations: [
    PeBuilderShareComponent,
    PeBuilderShareStyles,
    PeBuilderShareGetLinkComponent,
  ],
  exports: [
    PeBuilderShareComponent,
  ],
  providers: [
    PeBuilderShareService,
    PeOverlayWidgetService,
    ContactsGQLService,
    PeBuilderShareApi,
  ],
})
export class PeBuilderShareModule {}
