import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import merge from 'lodash/merge';
import pick from 'lodash/pick';
import { filter, startWith, tap } from 'rxjs/operators';
import { ApmService } from '@elastic/apm-rum-angular';

import { DEFAULT_TRIGGER_POINT, PebScript, PebScriptTrigger } from '@pe/builder-core';

import { PebClientStoreService } from './store.service';

@Injectable()
export class PebClientSeoService {

  get theme() {
    return this.clientStore.theme;
  }

  constructor(
    @Inject(DOCUMENT) private document: any,
    private meta: Meta,
    private title: Title,
    @Inject(PLATFORM_ID) private platformId: string,
    private clientStore: PebClientStoreService,
    private apmService: ApmService,
    router: Router,
  ) {
    /** global scripts */
    if (this.theme?.data?.scripts?.length) {
      router.events.pipe(
        filter(e => e instanceof NavigationEnd),
        startWith(null),
        tap((event) => this.execScripts(this.theme.data.scripts, !!event)),
      ).subscribe();
    }
  }

  handlePageData(pageData): void {
    const { seo = {}, scripts = [] } = pageData?.data ?? {};
    /** page scripts */
    this.execScripts(scripts);
    const head = this.document.head;

    let canonicalLinkElement: HTMLLinkElement = head.querySelector(`link[rel='canonical']`) || null;
    if (canonicalLinkElement) {
      head.removeChild(canonicalLinkElement);
    }
    if (seo.canonicalUrl) {
      canonicalLinkElement = this.document.createElement('link') as HTMLLinkElement;
      head.appendChild(canonicalLinkElement);
      canonicalLinkElement.setAttribute('rel', 'canonical');
      canonicalLinkElement.setAttribute('href', seo.canonicalUrl);
    }

    const customMetaTagElements = head.querySelectorAll(`link[pe-custom-meta-tag='true']`) || [];
    if (customMetaTagElements.length) {
      for (let i = 0; i > customMetaTagElements.length; i += 1) {
        const tag = customMetaTagElements[i];
        head.removeChild(tag);
      }
    }

    if (seo.customMetaTags) {
      const div = this.document.createElement('div');
      div.innerHTML = seo.customMetaTags;
      const customMetaTags = div.children;
      for (let i = 0; i < customMetaTags.length; i += 1) {
        const item = customMetaTags.item(i);
        if (item.tagName.toLowerCase() === 'meta') {
          item.setAttribute('pe-custom-meta-tag', 'true');
          head.appendChild(item);
        }
      }
    }

    let metaData: HTMLScriptElement = head.querySelector(`script[type='application/ld+json']`) || null;
    if (metaData) {
      head.removeChild(metaData);
    }
    if (seo.metaData) {
      metaData = this.document.createElement('script') as HTMLScriptElement;
      metaData.type = 'application/ld+json';
      metaData.text = seo.metaData;
      head.appendChild(metaData);
    }

    this.title.setTitle(pageData.name);

    this.meta.removeTag(`name='description'`);
    if (seo.description) {
      this.meta.addTag({
        name: 'description',
        content: seo.description,
      });
    }
  }

  private execScripts(scripts: PebScript[], reload = true): void {
    const head = this.document.head;
    try {
      scripts.forEach((script: PebScript) => {
        if (script.enabled) {
          const oldScripts = head.querySelectorAll(`script[script-id="${script.id}"]`);
          if (oldScripts.length) {
            if (!reload) {
              return;
            }

            for (let i = 0; i < oldScripts.length; i += 1) {
              const oldScript = oldScripts[i];
              head.removeChild(oldScript);
            }
          }

          try {
            const scriptElements = this.createScriptElements(script);
            scriptElements.forEach(el => head.appendChild(el));
          } catch (err) {
            this.apmService.apm.captureError(`Invalid script format: \n${JSON.stringify(script)}`);
          }
        }
      });
    } catch (err) {
      this.apmService.apm.captureError(`Script error: \n ${JSON.stringify(err)}
        \nScripts: ${JSON.stringify(scripts)}`);
    }
  }

  private createScriptElements(script: PebScript): HTMLScriptElement[] {
    const scripts: HTMLScriptElement[] = [];

    const div = this.document.createElement('div');
    div.innerHTML = script.content;
    const divScripts = div.querySelectorAll('script');
    if (divScripts.length) {
      for (let i = 0; i < divScripts.length; i += 1) {
        const child = divScripts[i];
        const scriptElement = this.document.createElement('script') as HTMLScriptElement;
        scriptElement.setAttribute('script-id', script.id);
        merge(scriptElement, pick(child, ['src', 'type']));
        scriptElement.textContent = this.getScriptText(child.textContent, script.triggerPoint || DEFAULT_TRIGGER_POINT);
        scripts.push(scriptElement);
      }
    } else {
      const scriptElement = this.document.createElement('script') as HTMLScriptElement;
      scriptElement.setAttribute('script-id', script.id);
      scriptElement.textContent = this.getScriptText(script.content, script.triggerPoint || DEFAULT_TRIGGER_POINT);
      console.log(scriptElement.textContent);
      scripts.push(scriptElement);
    }

    return scripts;
  }

  private getScriptText(content: string, triggerPoint: PebScriptTrigger | string): string {
    if (!content) {
      return '';
    }

    if (isPlatformBrowser(this.platformId)) {
      return content;
    }

    switch (triggerPoint) {
      case PebScriptTrigger.WindowLoaded: {
        return `window.addEventListener('load', function () {try {${content}} catch (e) { console.error(e) }})`;
      }
      case PebScriptTrigger.DOMReady: {
        return `document.addEventListener('DOMContentLoaded', function() {try {${content}} catch (e) { console.error(e) }})`;
      }
      case PebScriptTrigger.PageView: {
        return `(function() {try {${content}} catch (e) { console.error(e) }})()`;
      }
      default: {
        return content;
      }
    }
  }
}
