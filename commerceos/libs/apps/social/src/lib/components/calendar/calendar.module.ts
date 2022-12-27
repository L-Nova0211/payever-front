import { CommonModule, TitleCasePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgxsModule } from '@ngxs/store';
import { TextMaskModule } from 'angular2-text-mask';

import { PeFoldersActionsService, PeFoldersApiService, PeFoldersModule } from '@pe/folders';
import { PeGridModule, PeGridState } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { PeMediaEditorModule, PeMediaService } from '@pe/media';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebCheckboxModule,
  PebDateTimePickerModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebSelectModule,
  PeListModule,
  PeSearchModule,
} from '@pe/ui';

import { PeSocialGridService } from '../../services';
import { PeDatepickerComponent } from '../datepicker';
import { PeSocialPostEditorComponent } from '../post-editor';

import { PeSocialCalendarRoutingModule } from './calendar-routing.module';
import { PeSocialCalendarComponent } from './calendar.component';

const angularModules = [
  CommonModule,
  FormsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatIconModule,
  NgxsModule.forFeature([PeGridState]),
  ReactiveFormsModule,
  TextMaskModule,
];

const peModules = [
  I18nModule,

  PebButtonModule,
  PebButtonToggleModule,
  PebCheckboxModule,
  PebDateTimePickerModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebSelectModule,

  PeGridModule,
  PeFoldersModule,
  PeListModule,
  PeMediaEditorModule,
  PeSearchModule,
];
@NgModule({
  declarations: [
    PeDatepickerComponent,
    PeSocialCalendarComponent,
    PeSocialPostEditorComponent,
  ],
  imports: [
    ...angularModules,
    ...peModules,

    PeSocialCalendarRoutingModule,
  ],
  providers: [
    PeFoldersActionsService,
    PeFoldersApiService,
    PeMediaService,
    PeSocialGridService,
    TitleCasePipe,
  ],
})
export class PeSocialCalendarModule { }
