import { ActivatedRouteSnapshot, DetachedRouteHandle, Route, RouteReuseStrategy } from '@angular/router';

export class CacheRouteReuseStrategy implements RouteReuseStrategy {
  private readonly storedRouteHandles = new Map<string, DetachedRouteHandle>();

  private static getPath(route: ActivatedRouteSnapshot): string {
    const config: Route | null = route.routeConfig;
    if (config && config.path !== null) {
      return `${config.path || ''}_${config.outlet || ''}`;
    }

    return '';
  }

  shouldReuseRoute(before: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return before.routeConfig === curr.routeConfig;
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const config: Route | null = route.routeConfig;

    return config && !!config.data && config.data.cache;
  }

  store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {
    this.storedRouteHandles.set(CacheRouteReuseStrategy.getPath(route), detachedTree);
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.storedRouteHandles.has(CacheRouteReuseStrategy.getPath(route));
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.storedRouteHandles.get(CacheRouteReuseStrategy.getPath(route)) || null;
  }
}
