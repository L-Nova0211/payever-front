import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { from } from 'rxjs';

import { SandboxDBService } from '../../dev/sandbox-idb.service';

@Injectable()
export class SandboxSourceEditorDataResolver implements Resolve<unknown> {
  constructor(
    private dbService: SandboxDBService,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return from(this.dbService.getRawThemeById(route.params.identifier));
  }
}
