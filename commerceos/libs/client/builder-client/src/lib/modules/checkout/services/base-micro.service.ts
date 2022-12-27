import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injector, Renderer2, RendererFactory2 } from '@angular/core';
import { fromEvent, Observable, of, Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { PE_ENV } from '@pe/common';

export class BaseMicroService {
  scriptLoaded$: Subject<boolean> = new Subject<boolean>();

  protected httpClient: HttpClient = this.injector.get(HttpClient);
  protected config: any = this.injector.get(PE_ENV);
  protected rendererFactory: RendererFactory2 = this.injector.get(
    RendererFactory2,
  );

  protected document: Document = this.injector.get(DOCUMENT);
  protected renderer: Renderer2;
  protected peRegistry;

  constructor(protected injector: Injector) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  isScriptLoaded(url: string): boolean {
    return this.registry.scripts[url] && this.registry.scripts[url].loaded;
  }

  isScriptLoadedbyCode(microCode: string): boolean {
    let microData: any;
    if (this.registry) {
      microData = Object.values(this.registry.scripts).find(
        (microInfo: any) => microInfo.code === microCode,
      );
    }

    return microData && microData.loaded;
  }

  loadScript(url: string, microCode: string): Observable<boolean> {
    if (this.isScriptLoaded(url)) {
      return of(true);
    }
    const logStart: number = new Date().getTime();
    const script: HTMLScriptElement = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.onload = () => {
      this.markScriptAsLoaded(url, microCode);
    };
    script.src = url;
    script.onerror = (error: any) => {
      console.error(
        `Not possible to load script '${url}' during ${new Date().getTime() -
          logStart}ms:\n ${JSON.stringify(error)}`,
      );
    };
    const head: HTMLElement = this.document
      .getElementsByTagName('head')
      .item(0);
    this.renderer.appendChild(head, script);

    return fromEvent(script, 'load').pipe(
      take(1),
      map((event: Event) => true),
    );
  }

  unloadScript(url: string): void {
    Array.from(this.document.querySelectorAll(`script[src="${url}"]`)).forEach(e =>
      e.parentNode.removeChild(e),
    );
    if (this.registry.scripts[url]) {
      this.registry.scripts[url].loaded = false;
    }
  }

  protected markScriptAsLoaded(url: string, microCode: string): void {
    this.scriptLoaded$.next(true);
    this.registry.scripts[url] = { loaded: true, code: microCode };
  }

  protected get registry(): any {
    if (!this.peRegistry) {
      this.peRegistry = {
        buildHashes: {},
        buildMicroConfigs: {},
        scripts: {},
        registered: [],
      };
    }

    return this.peRegistry;
  }
}
