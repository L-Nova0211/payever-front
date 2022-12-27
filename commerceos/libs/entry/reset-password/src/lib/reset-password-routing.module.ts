import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { ForgotPasswordComponent, ResetPasswordComponent } from './components';

const routes: Routes = [

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'forgot',
  },
  {
    path: 'forgot',
    component: ForgotPasswordComponent,
  },
  {
    path: 'reset/:token',
    component: ResetPasswordComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResetPasswordRoutingModule { }
