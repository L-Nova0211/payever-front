import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Routes } from '@angular/router';

import { EntrySharedModule } from '@pe/entry/shared';
import { I18nModule } from '@pe/i18n';
import { WindowModule } from '@pe/window';

import { EmailVerificationComponent } from './components/email-verification/email-verification.component';


const routes: Routes = [
  {
    path: ':token',
    component: EmailVerificationComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    WindowModule,
    RouterModule.forChild(routes),
    EntrySharedModule,
    I18nModule.forChild(),
    MatButtonModule,
  ],
  declarations: [EmailVerificationComponent],
})
export class EntryConfirmationModule {}
