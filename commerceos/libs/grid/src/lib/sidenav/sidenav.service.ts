import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export const DEFAULT_SIDENAV = 'default_sidenav';

interface PeGridSidenavStatusInterface {
  [sidenavName: string]: BehaviorSubject<boolean>;
}

@Injectable({ providedIn: 'any' })
export class PeGridSidenavService {
  public readonly sidenavOpenStatus: PeGridSidenavStatusInterface = { };
  public readonly toggleOpenStatus$ = new BehaviorSubject<boolean>(true);

  private addSidenavStatus(sidenavName: string): BehaviorSubject<boolean> {
    this.sidenavOpenStatus[sidenavName] = new BehaviorSubject<boolean>(true);

    return this.sidenavOpenStatus[sidenavName];
  }

  public removeSidenavStatus(sidenavName: string): void {
    delete this.sidenavOpenStatus[sidenavName];
  }

  public getSidenavOpenStatus(sidenavName: string): BehaviorSubject<boolean> {
    return this.sidenavOpenStatus?.[sidenavName]
      ? this.sidenavOpenStatus[sidenavName]
      : this.addSidenavStatus(sidenavName);
  }

  public toggleViewSidebar(sidenavName = DEFAULT_SIDENAV) {
    if (sidenavName === DEFAULT_SIDENAV) {
      this.toggleOpenStatus$.next(!this.toggleOpenStatus$.value);
    } else {
      this.sidenavOpenStatus[sidenavName].next(!this.sidenavOpenStatus[sidenavName].value);
    }
  }
}
