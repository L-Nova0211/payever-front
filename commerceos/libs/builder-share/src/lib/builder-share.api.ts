import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';

import { PEB_EDITOR_API_PATH } from '@pe/builder-api';
import { PebEnvService } from '@pe/builder-core';

import { PeBuilderShareAccess, PeBuilderShareCustomAccess } from './builder-share.constants';

@Injectable()
export class PeBuilderShareApi {

  constructor(
    private http: HttpClient,
    private injector: Injector,
    private pebEnvService: PebEnvService,
  ) {
  }

  customAccess(access: PeBuilderShareAccess): Observable<PeBuilderShareCustomAccess> {
    const apiPath = this.injector.get(PEB_EDITOR_API_PATH, null);

    return this.http.post<PeBuilderShareCustomAccess>(
      `${apiPath}/api/business/${this.pebEnvService.businessId}/application/${this.pebEnvService.applicationId}/custom-access`,
      { access },
    );
  };
}
