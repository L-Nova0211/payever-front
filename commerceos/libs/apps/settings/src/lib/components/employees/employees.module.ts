import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { AuthModule } from '@pe/auth';
import { ConfirmationScreenModule } from '@pe/confirmation-screen';
import { PeFoldersModule } from '@pe/folders';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { PeSidebarModule } from '@pe/sidebar';
import {
    PebButtonModule,
    PebButtonToggleModule,
    PebExpandablePanelModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebLogoPickerModule,
    PebMessagesModule,
    PebSelectModule,
    PeInputPickerModule,
    PePickerModule,
} from '@pe/ui';

import { ComponentModule } from '../component.module';

import {
  EmployeeAppAccessSetterComponent,
} from './components/employee-app-access-setter/employee-app-access-setter.component';
import {
  EmployeesListStatusButtonsComponent,
} from './components/employees-list-status-buttons/employees-list-status-buttons.component';
import { NewEmployeeDialogComponent } from './components/new-employee-dialog/new-employee-dialog.component';
import { NewEmployeeGroupComponent } from './components/new-employee-group/new-employee-group.component';
import { EmployeesRoutingModule } from './employees-routing.module';
import { EmployeesComponent } from './employees.component';
import {
  PebBusinessEmployeesStorageService,
} from './services/business-employees-storage/business-employees-storage.service';
import { PebBusinessEmployeesService } from './services/business-employees/business-employees.service';
import { PebEmployeeDialogFormService } from './services/employee-dialog-form/peb-employee-dialog-form.service';
import { PebEmployeeDialogOpenerService } from './services/employee-dialog-opener/peb-employee-dialog-opener.service';
import { PebEmployeeDialogService } from './services/employee-dialog/peb-employee-dialog.service';
import {
  PebEmployeesGridSortHelperService,
} from './services/employee-grid-sorting-helper/employees-grid-sorting-helper.service';
import { PebGridDataConverterService } from './services/grid-data-converter/peb-grid-data-converter.service';
import {
  PebEmployeeSidebarService,
} from './services/sidebar/employee-sidebar.service';



@NgModule({
  declarations: [
    EmployeesComponent,
    EmployeesListStatusButtonsComponent,
    NewEmployeeDialogComponent,
    EmployeeAppAccessSetterComponent,
    NewEmployeeGroupComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EmployeesRoutingModule,
    I18nModule,
    AuthModule,
    PeGridModule,
    PeFoldersModule,
    PeSidebarModule,
    MatIconModule,
    MatDialogModule,
    PebExpandablePanelModule,
    PebFormFieldInputModule,
    PebFormBackgroundModule,
    PebButtonModule,
    PebLogoPickerModule,
    PebSelectModule,
    PebButtonToggleModule,
    PePickerModule,
    ComponentModule,
    PeInputPickerModule,
    PebMessagesModule,
    MatGoogleMapsAutocompleteModule,
    ConfirmationScreenModule,
  ],
  providers: [
    PebEmployeeSidebarService,
    PebBusinessEmployeesService,
    PebEmployeeDialogOpenerService,
    PebEmployeeDialogService,
    PebEmployeeDialogFormService,
    PebGridDataConverterService,
    PebEmployeesGridSortHelperService,
    PebBusinessEmployeesStorageService,

  ],
})
export class EmployeesModule { }
