import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { TreeFilterNode } from '@pe/common';


@Injectable({ providedIn: 'root' })
export class PebSidebarService {
  isSidebarClosed$ = new BehaviorSubject(false);

  toggleSidebar(a?: string) {
    if (a) {
      this.isSidebarClosed$.next(a === 'yes' ? true : false)

      return
    }
    this.isSidebarClosed$.next(!this.isSidebarClosed$.value)
  }

  createSidebar(id): TreeFilterNode[] {
    return [
      {
        id: id + '/dashboard',
        name: 'Site Name',
        parentId: null,
        image: '/assets/icons/dashboard.png',
        children: [],
      },
      {
        id: id + '/builder',
        parentId: null,
        name: 'Edit',
        image: '/assets/icons/edit.png',
        children: [],
      },
      {
        id: id + '/settings',
        parentId: null,
        name: 'Settings',
        image: '/assets/icons/settings.png',
        children: [],
      },
      {
        id: id + '/themes',
        parentId: null,
        name: 'Themes',
        image: '/assets/icons/theme.png',
        children: [],
      },
    ];
  }

}
