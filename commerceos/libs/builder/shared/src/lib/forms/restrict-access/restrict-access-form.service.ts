import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PebRestrictAccess, PebRestrictType } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-services';

import { PebRestrictAccessFormInterface } from './restrict-access-form.interface';

@Injectable()
export class PebRestrictAccessFormService {

  constructor(
    private editorStore: PebEditorStore,
  ) { }

  getPageRestrictAccess(): PebRestrictAccessFormInterface {
    return {
      restrict: !!this.editorStore.page.data?.restrictAccess,
      type: PebRestrictType.All,
      customers: [],
      groups: [],
      password: '',
      ...this.editorStore.page.data?.restrictAccess,
    };
  }

  setPageRestrict(restrictAccess: PebRestrictAccessFormInterface): Observable<any> {
    const pageRestrictAccess: PebRestrictAccess = restrictAccess.restrict ? {
      type: restrictAccess.type,
      customers: restrictAccess.customers,
      groups: restrictAccess.groups,
      password: restrictAccess.password,
    } : null;

    return this.editorStore.updatePage(this.editorStore.page, {
      data: {
        restrictAccess: pageRestrictAccess,
      },
    });
  }
}
