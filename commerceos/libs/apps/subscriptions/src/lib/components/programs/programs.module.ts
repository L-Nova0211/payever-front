import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { PeFolderEditorModule, PeFoldersModule } from '@pe/folders';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import {
  PebCheckboxModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebMessagesModule,
  PebSelectModule,
  PeListModule,
  PeSearchModule
} from '@pe/ui';

import { PeSubscriptionsPlanEditorComponent } from '../plan-editor';

import { PeSubscriptionsProgramsComponent } from './programs.component';

const routes: Routes = [{
  path: '',
  component: PeSubscriptionsProgramsComponent,
}];

@NgModule({
  declarations: [
    PeSubscriptionsPlanEditorComponent,
    PeSubscriptionsProgramsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    I18nModule,
    PebCheckboxModule,
    PebExpandablePanelModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebMessagesModule,
    PebSelectModule,
    PeFolderEditorModule,
    PeFoldersModule,
    PeGridModule,
    PeListModule,
    PeSearchModule,
  ],
})
export class PeSubscriptionsProgramsModule { }
