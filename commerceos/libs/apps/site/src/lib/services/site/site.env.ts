import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { EnvService } from '@pe/common';

import { SiteDTO } from '../../site.interface';
import { SiteEnvService } from '../site-env.service';

@Injectable()
export class SiteEnv {

  constructor(
    @Inject(EnvService) private envService: SiteEnvService,
  ) {
  }

  private _activeSite: SiteDTO;
  private _defaultSite: SiteDTO;

  get activeSite() {
    return this._activeSite;
  }

  set activeSite(site: SiteDTO) {
    this._activeSite = site;
    this.siteId = site ? site.id : this._defaultSite?.id;
  }

  get defaultSite() {
    return this._defaultSite;
  }

  set defaultSite(site: SiteDTO) {
    this._defaultSite = site;
    if (!this._activeSite) {this.siteId = site?.id;}
  }


  protected siteIdSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  set siteId(value: string) {
    this.envService.applicationId= value;
    this.siteIdSubject.next(value);
  }

  get siteId(): string {
    return this.siteIdSubject.getValue();
  }


  get siteIdAsync(): Observable<any> {
    return this.siteIdSubject.asObservable();
  }

}


