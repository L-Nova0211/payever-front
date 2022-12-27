import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebContextService } from '@pe/builder-context';
import { PebIntegration } from '@pe/builder-core';

@Injectable()
export class PebMockContextApi extends PebContextService {
  fetchIntegrations(): Observable<PebIntegration[]> {
    return this.http.get('/assets/context-cache.json').pipe(
      map<any, PebIntegration[]>((cache: { components: any, integrations: PebIntegration[] }) =>
        cache?.integrations ?? []),
    );
  }
}
