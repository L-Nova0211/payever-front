import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';

import { CosEnvService } from '@pe/base';



@Injectable({ providedIn: 'any' })
export class PersonalGuard implements CanActivate {

  constructor(
    private envService: CosEnvService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean | Observable<boolean> {
    const path = route.url[0]?.path;
    const parentPath = route.parent.url[0]?.path;

    if (path === 'personal' || parentPath === 'personal') {
      this.envService.isPersonalMode = true;

      return true;
    }
    this.envService.isPersonalMode = false;
  }
}
