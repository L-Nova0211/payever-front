import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PeMailBuilderService } from '../mail-builder.service';
import { PeMessageBuilderComponent } from '../message-builder.component';

@Injectable({
  providedIn: 'any',
})
export class PeMessageMailGuard implements CanDeactivate<any> {

  constructor(
    private mailBuilderService: PeMailBuilderService,
  ) {}

  canDeactivate(
    component: PeMessageBuilderComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.mailBuilderService.blockRouteNavigation$.pipe(
      map((isNavigateToRoot) => !isNavigateToRoot),
    );
  }
}
