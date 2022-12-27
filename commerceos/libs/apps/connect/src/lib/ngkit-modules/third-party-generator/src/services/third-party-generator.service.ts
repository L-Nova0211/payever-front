import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { InfoBoxSettingsInterface } from '../interfaces';

@Injectable()
export class ThirdPartyGeneratorService {
  constructor(private http: HttpClient) {}

  execThirdPartyApi(baseApiUrl: string, data: {}): Observable<InfoBoxSettingsInterface> {
    return this.http.post<InfoBoxSettingsInterface>(baseApiUrl, data);
  }
}
