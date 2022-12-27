import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { MicroRegistryService } from '@pe/common';
import { DockerService } from '@pe/docker';

@Injectable()
export class PersonalAppRegistryGuard implements CanActivate {
  constructor(
    private router: Router,
    private microRegistryService: MicroRegistryService,
    private dockerService: DockerService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | Observable<boolean> {
    return this.microRegistryService.getPersonalRegisteredMicros().pipe(
      tap(() => this.dockerService.initDocker()),
      map(() => { return true }),
      catchError((error: any, caught: Observable<boolean>) => {
        this.router.navigate(['switcher']);

        return of(false);
      }),
    );
  }
}
