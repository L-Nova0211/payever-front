import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, UrlTree } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';

import { BAD_REQUEST, PE_AFFILIATES_FIRST_PROGRAM, PE_AFFILIATES_FIRST_NETWORK } from '../constants';
import { PeAffiliatesAccessApiService, PeAffiliatesApiService } from '../services';

@Injectable()
export class PeAffiliatesNetworkGuard implements CanActivate {

  constructor(
    private pebEnvService: PebEnvService,
    
    private peAffiliatesApiService: PeAffiliatesApiService,
    private peAffiliatesAccessApiService: PeAffiliatesAccessApiService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const applicationId = route?.firstChild?.firstChild?.params.applicationId;
    const programId = route?.firstChild?.firstChild?.params.programId;

    if (applicationId) {
      const getApplicationId$ = programId && applicationId === 'default'
        ? this.peAffiliatesApiService.getProgram(programId)
        : of({ affiliateBranding: applicationId });

      return getApplicationId$
        .pipe(
          switchMap(({ affiliateBranding }) => {
            this.pebEnvService.applicationId = affiliateBranding;
            this.pebEnvService.shopId = affiliateBranding;

            return this.peAffiliatesApiService
              .getNetwork(affiliateBranding)
              .pipe(
                map(network => {
                  route.data = { ...route.data, network };
      
                  return true;
                }));
          }));
    }

    PE_AFFILIATES_FIRST_NETWORK.name = this.pebEnvService.businessData.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-');

    const createFirstNetwork$ = this.peAffiliatesApiService
      .createNetwork(PE_AFFILIATES_FIRST_NETWORK)
      .pipe(
        switchMap(network => {
          return forkJoin([
            of(network),
            this.peAffiliatesAccessApiService
              .getAccessConfig(network._id),
          ]);
        }),
        switchMap(([network, accessConfig]) => {
          const { _id, affiliateBranding } = accessConfig;

          return forkJoin([
            of(network),
            this.peAffiliatesAccessApiService
              .updateAccessConfig(affiliateBranding, _id, { internalDomain: network.name }),
          ]);
        }),
        switchMap(([network]) => {
          PE_AFFILIATES_FIRST_PROGRAM.affiliateBranding = network._id;

          return forkJoin([
            of(network),
            this.peAffiliatesApiService
              .createProgram(PE_AFFILIATES_FIRST_PROGRAM),
          ]);
        }),
        map(([network]) => [network]));

    return this.peAffiliatesApiService
      .getNetworks()
      .pipe(
        switchMap(networks => {
          return networks.length
            ? of(networks)
            : createFirstNetwork$;
        }),
        switchMap(networks => {
          const defaultNetwork = networks
            .find(network => network.isDefault);

          return defaultNetwork
            ? of(defaultNetwork)
            : this.peAffiliatesApiService
                .setNetworkAsDefault(networks[0]._id);
        }),
        map(defaultNetwork => {
          this.pebEnvService.applicationId = defaultNetwork._id;
          this.pebEnvService.shopId = defaultNetwork._id;
          route.data = { ...route.data, network: defaultNetwork };

          return true;
        }),
        catchError(() => {
          this.pebEnvService.applicationId = BAD_REQUEST;
          this.pebEnvService.shopId = BAD_REQUEST;

          return of(true);
        }));
  }
}
