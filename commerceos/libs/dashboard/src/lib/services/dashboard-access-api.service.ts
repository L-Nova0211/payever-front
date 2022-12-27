import { Observable } from 'rxjs';

import { PeBuilderDashboardAccessInterface } from '../interfaces';

export abstract class PeBuilderDashboardAccessApiService {
  public abstract getAccessConfig(applicationId: string): Observable<PeBuilderDashboardAccessInterface>;
}
