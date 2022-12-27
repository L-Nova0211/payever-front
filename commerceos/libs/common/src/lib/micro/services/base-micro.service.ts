import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { fromEvent, Observable, of, Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV } from '../../environment-config';
import { MicroRegistry, MicroRegistrySctiptInfo } from '../types';
// Long paths are here to avoid circular dependencies

/* @deprecated */
export class BaseMicroService {

  scriptLoaded$: Subject<boolean> = new Subject<boolean>();

  protected apmService: ApmService = this.injector.get(ApmService);
  protected httpClient: HttpClient = this.injector.get(HttpClient);
  protected envConfig: EnvironmentConfigInterface = this.injector.get(PE_ENV);

  constructor(protected injector: Injector) {}

  isScriptLoaded(url: string): boolean {
    return this.registry.scripts[url] && this.registry.scripts[url].loaded;
  }

  isScriptLoadedbyCode(microCode: string): boolean {
    let microData: MicroRegistrySctiptInfo;
    if (this.registry) {
      microData = Object.values(this.registry.scripts)
        .find((microInfo: MicroRegistrySctiptInfo) => microInfo.code === microCode);
    }

    return microData && microData.loaded;
  }

  loadScript(url: string, microCode: string): Observable<boolean> {
    if (this.isScriptLoaded(url)) {
      return of(true);
    }
    const logStart: number = (new Date()).getTime();
    const script: HTMLScriptElement = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = () => {
      this.markScriptAsLoaded(url, microCode);
    };
    script.src = url;
    script.onerror = (error: any) => {
      const n = window.navigator;
      const s = window.screen;
      const userDetails = `${n.platform} / ${n.language} / ${s.width}x${s.height} / ${n.userAgent}`;
      this.apmService.apm.captureError(
        `Not possible to load script '${url}' during ${(new Date()).getTime() - logStart}ms:\n ${JSON.stringify(error)}\nDetails: ${userDetails}`
      );
    };
    document.getElementsByTagName('head')[0].appendChild(script);

    return fromEvent(script, 'load').pipe(
      take(1),
      map((event: Event) => true)
    );
  }

  unloadScript(url: string): void {
    Array.from(document.querySelectorAll(`script[src="${url}"]`)).forEach(e => e.parentNode.removeChild(e));
    if (this.registry.scripts[url]) {
      this.registry.scripts[url].loaded = false;
    }
  }

  protected markScriptAsLoaded(url: string, microCode: string): void {
    this.scriptLoaded$.next(true);
    this.registry.scripts[url] = { loaded: true, code: microCode };
  }

  protected get registry(): MicroRegistry {
    if (!window['pe_registry']) {
      window['pe_registry'] = {
        buildHashes: {},
        buildMicroConfigs: {},
        scripts: {},
        registered: [],
      };
    }

    return window['pe_registry'];
  }
}
