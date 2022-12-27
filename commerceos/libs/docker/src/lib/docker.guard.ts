import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { combineLatest } from 'rxjs';
import { flatMap, map, take, tap } from 'rxjs/operators';

import { CosEnvService } from '@pe/base';
import { MicroRegistryService } from '@pe/common';


import { DockerItemInterface } from './docker.interface';
import { DockerService } from './docker.service';
import { DockerState } from './state/docker.state';



@Injectable({ providedIn: 'any' })
export class DockerGuard implements CanActivate {
    @SelectSnapshot(DockerState.dockerItems) dockerItems: DockerItemInterface[];

    constructor(
      private dockerService: DockerService,
      private envService: CosEnvService,
      private microRegistryService: MicroRegistryService,
      private store: Store
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (!this.dockerItems?.length) {
          if (this.envService.isPersonalMode) {
            return combineLatest([this.microRegistryService.getPersonalRegisteredMicros()]).pipe(
              tap(() => this.dockerService.initDocker()),
              map(() => { return true })
            )
          } else {
            return this.store.select(state => state.peUserState.peBusinessState.businessData._id).pipe(
              take(1),
              flatMap((businessId) => {
                return combineLatest([this.microRegistryService.getRegisteredMicros(businessId)])
                  .pipe(
                    tap(() => this.dockerService.initDocker()),
                    map(() => { return true })
                  )
              })
            );
          }
        }

        return true
    }
}
