import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, mapTo, mergeMap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { ApiService } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { MicroAppInterface, MicroRegistryService } from '@pe/common';

@Component({
  selector: 'pe-message-invitation-invite-component',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageInvitationInviteComponent {

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,

    private apiService: ApiService,
    private microRegistryService: MicroRegistryService,
    private peAuthService: PeAuthService,
  ) {
    const {
      businessId,
      directInvitationKey,
      invitationKey,
      invitationPublicKey,
      registrationInvitationKey,
    } = this.activatedRoute.snapshot.params;

    const invitation = directInvitationKey
      ? { invitationKey: directInvitationKey }
      : invitationKey
        ? { invitationKey }
        : registrationInvitationKey
          ? { invitationKey: registrationInvitationKey }
          : { invitationPublicKey };

    const queryParams = businessId
      ? invitation
      : { invitationRedirectUrl: this.router.url };

    if (!(this.peAuthService.token || registrationInvitationKey || directInvitationKey)) {
      this.router.navigate(['/login'], { queryParams });
    } else if (!businessId && (registrationInvitationKey || directInvitationKey)) {
      this.router.navigate(['/registration'], { queryParams });
    } else if (businessId) {
      const enableBusiness$ = this.apiService
        .enableBusiness(businessId)
        .pipe(switchMap(tokens => this.peAuthService.setTokens(tokens)));

      const preinstall$ = (application: MicroAppInterface) => this.apiService
        .toggleInstalledApp(businessId, application._id, { installed: true })
        .pipe(
          switchMap(() => enableBusiness$),
          mapTo(true));

      enableBusiness$
        .pipe(
          switchMap(() => this.microRegistryService.getRegisteredMicros(businessId)),
          map(microServices => microServices.find(service => service.code === 'message')),
          switchMap(application => application.installed ? of(application.installed) : preinstall$(application)),
          mergeMap(() => this.router.navigate([`/business/${businessId}/message`], { queryParams })))
        .subscribe();
    } else {
      this.router.navigate(['/switcher'], { queryParams });
    }
  }
}
