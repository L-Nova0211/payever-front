import { Injectable } from '@angular/core';

import { PeAuthService } from '@pe/auth';

import { PeMessageGuardRoles } from '../enums';

@Injectable()
export class PeMessageGuardService {

  constructor(
    private peAuthService: PeAuthService,
  ) {}

  isAllowByRoles(allowRoles: PeMessageGuardRoles[]) {
    const roles = this.peAuthService.getUserData()?.roles.map((role: any) => role.name) ?? [];
    for (let role of allowRoles) {
      if (roles.includes(role)) {
        return true;
      }
    }

    return false;
  }
}
