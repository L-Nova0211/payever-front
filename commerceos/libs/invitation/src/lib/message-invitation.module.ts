import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeAuthService } from '@pe/auth';
import { I18nModule } from '@pe/i18n';

import { PeMessageInvitationInviteComponent } from './message-invitation-invite.component';

export const routes: Routes = [
  {
    path: 'join/:invitationPublicKey',
    component: PeMessageInvitationInviteComponent,
  },
  {
    path: 'join/:invitationPublicKey/:businessId',
    component: PeMessageInvitationInviteComponent,
  },
  {
    path: 'invite/:invitationKey',
    component: PeMessageInvitationInviteComponent,
  },
  {
    path: 'invite/:invitationKey/:businessId',
    component: PeMessageInvitationInviteComponent,
  },
  {
    path: 'registration/:registrationInvitationKey',
    component: PeMessageInvitationInviteComponent,
  },
  {
    path: 'registration/:registrationInvitationKey/:businessId',
    component: PeMessageInvitationInviteComponent,
  },
  {
    path: 'direct-chat/:directInvitationKey',
    component: PeMessageInvitationInviteComponent,
  },
  {
    path: 'direct-chat/:directInvitationKey/:businessId',
    component: PeMessageInvitationInviteComponent,
  },
];

@NgModule({
  declarations: [PeMessageInvitationInviteComponent],
  imports: [
    CommonModule,
    I18nModule,

    RouterModule.forChild(routes),
  ],
  providers: [PeAuthService],
})
export class PeMessageInvitationModule { }
