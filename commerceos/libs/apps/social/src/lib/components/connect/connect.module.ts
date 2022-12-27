import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Routes } from '@angular/router';

import { I18nModule } from '@pe/i18n';
import { PebButtonToggleModule } from '@pe/ui';

import { PeSocialConnectListComponent } from '../connect-list';

import { PeSocialConnectComponent } from './connect.component';

const routes: Routes = [{
  path: '',
  component: PeSocialConnectComponent,
}];

@NgModule({
  declarations: [
    PeSocialConnectComponent,
    PeSocialConnectListComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule.forChild(routes),

    I18nModule,
    PebButtonToggleModule,
  ],
})
export class PeSocialConnectModule { }
