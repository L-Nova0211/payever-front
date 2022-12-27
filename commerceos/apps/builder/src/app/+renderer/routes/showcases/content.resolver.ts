import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import * as yaml from 'js-yaml';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SandboxRendererShowcaseContentResolver implements Resolve<any> {
  constructor(
    private http: HttpClient,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    const showcaseName = state.url.split('/').pop();
    const dataPath = `renderer/showcases/${showcaseName}/${showcaseName}.data.yml`;

    return this.http.get(dataPath, { responseType: 'text' }).pipe(
      map(content => (yaml as any).safeLoad(content)),
    );
  }
}
