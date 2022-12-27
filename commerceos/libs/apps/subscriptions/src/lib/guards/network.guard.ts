import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, UrlTree } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';

import { BAD_REQUEST, PE_SUBSCRIPTIONS_FIRST_NETWORK, PE_SUBSCRIPTIONS_FIRST_PLAN } from '../constants';
import { PeSubscriptionsAccessApiService, PeSubscriptionsApiService } from '../services';

@Injectable()
export class PeSubscriptionsNetworkGuard implements CanActivate {
  
  constructor(
    private pebEnvService: PebEnvService,

    private peSubscriptionsApiService: PeSubscriptionsApiService,
    private peSubscriptionsAccessApiService: PeSubscriptionsAccessApiService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const applicationId = route?.firstChild?.firstChild?.params.applicationId;

    if (applicationId) {
      this.pebEnvService.applicationId = applicationId;
      this.pebEnvService.shopId = applicationId;

      return this.peSubscriptionsApiService
        .getNetwork(applicationId)
        .pipe(
          map(network => {
            route.data = { ...route.data, network };

            return true;
          }));
    }

    PE_SUBSCRIPTIONS_FIRST_NETWORK.name = this.pebEnvService.businessData.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-');

    const createFirstNetwork$ = this.peSubscriptionsApiService
      .createNetwork(PE_SUBSCRIPTIONS_FIRST_NETWORK)
      .pipe(
        switchMap(network => {
          return forkJoin([
            of(network),
            this.peSubscriptionsAccessApiService
              .getAccessConfig(network._id),
          ]);
        }),
        switchMap(([network, accessConfig]) => {
          const { _id, subscriptionNetwork } = accessConfig;

          return forkJoin([
            of(network),
            this.peSubscriptionsAccessApiService
              .updateAccessConfig(subscriptionNetwork, _id, { internalDomain: network.name }),
          ]);
        }),
        switchMap(([network]) => {
          PE_SUBSCRIPTIONS_FIRST_PLAN.subscriptionNetwork = network._id;

          return forkJoin([
            of(network),
            this.peSubscriptionsApiService
              .createPlan(PE_SUBSCRIPTIONS_FIRST_PLAN),
          ]);
        }),
        map(([network]) => [network]));

    return this.peSubscriptionsApiService
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
            : this.peSubscriptionsApiService
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
