import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EmployeesComponent } from './employees.component';

const routes: Routes = [
  {
    path: '',
    component: EmployeesComponent,
  },
];

export const employeeRoutingModule = RouterModule.forChild(routes);
@NgModule({
  imports: [employeeRoutingModule],
  exports: [RouterModule],
})
export class EmployeesRoutingModule { }
