import { Injectable, Injector } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, mergeMap, share, take, tap, catchError } from 'rxjs/operators';

import { NodeJsFrontendConfigInterface } from '../../environment-config';
import {  MicroAppInterface } from '../types';

import { BaseMicroService } from './base-micro.service';

/* @deprecated */
@Injectable()
export class MicroLoaderService extends BaseMicroService {

  private buildHashObservables: { [key: string]: Observable<string> } = {};
  private buildMicroConfigObservables: { [key: string]: Observable<MicroAppInterface> } = {};
  private buildObservables: { [key: string]: Observable<boolean> } = {};
  private innerBuildObservables: { [key: string]: Observable<boolean> } = {};
  private readonly microFileName: string = 'micro';

  constructor(injector: Injector) {
    super(injector);
  }

  loadBuildHash(microCode: string, subPath: string = null): Observable<string> {
    if (!this.buildHashObservables[microCode]) {
      this.buildHashObservables[microCode] = this._createBuildHashObservable(microCode, subPath)
        .pipe(
          take(1),
          share(),
          tap(() => delete this.buildHashObservables[microCode])
        );
    }

    return this.buildHashObservables[microCode];
  }

  loadBuildMicroConfig(microCode: string): Observable<MicroAppInterface> {
    if (!this.buildMicroConfigObservables[microCode]) {
      this.buildMicroConfigObservables[microCode] = this._createBuildMicroConfigObservable(microCode)
        .pipe(
          take(1),
          share(),
          tap(() => delete this.buildMicroConfigObservables[microCode])
        );
    }

    return this.buildMicroConfigObservables[microCode];
  }

  loadBuild(microCode: string, forceReload: boolean = false): Observable<boolean> {
    if (forceReload) {
      this.buildObservables[microCode] = null;
    }

    if (!this.buildObservables[microCode]) {
      this.buildObservables[microCode] = this._createBuildObservable(microCode, forceReload)
        .pipe(
          take(1),
          share(),
          tap(() => delete this.buildObservables[microCode])
        );
    }

    return this.buildObservables[microCode];
  }

  loadInnerMicroBuild(microCode: string, innerMicroCode: string, forceReload: boolean = false): Observable<boolean> {
    if (forceReload) {
      this.innerBuildObservables[microCode] = null;
    }

    if (!this.innerBuildObservables[microCode]) {
      this.innerBuildObservables[microCode] = this._createInnerMicroBuildObservable(microCode, innerMicroCode, null, forceReload)
        .pipe(
          take(1),
          share(),
          tap(() => delete this.innerBuildObservables[microCode])
        );
    }

    return this.innerBuildObservables[microCode];
  }

  loadInnerMicroBuildEx(microCode: string, innerMicroCode: string, subPath: string, forceReload: boolean = false): Observable<boolean> {
    if (forceReload) {
      this.innerBuildObservables[microCode] = null;
    }

    if (!this.innerBuildObservables[microCode]) {
      this.innerBuildObservables[microCode] = this._createInnerMicroBuildObservable(microCode, innerMicroCode, subPath, forceReload)
        .pipe(
          take(1),
          share(),
          tap(() => delete this.innerBuildObservables[microCode])
        );
    }

    return this.innerBuildObservables[microCode];
  }

  loadMicroByScriptUrl(bootstrapScriptUrl: string): Observable<boolean> {
    const url = bootstrapScriptUrl;

    // if (forceReload) {
    //   this.registry.scripts[url] = null;
    // }
    return this.loadScript(url, null);
  }

  getResourceUrl(microCode: string, buildHash: string, resourceName: string, resourceType: string, allowCache: boolean = true): string {
    const config: NodeJsFrontendConfigInterface = this.envConfig.frontend;

    if (config && config[microCode]) {
      const now = new Date();
      const hourHash = `${now.getDay()}-${now.getMonth()}-${now.getFullYear()}`;

      return `${config[microCode]}/${resourceName}.${resourceType}?${buildHash || hourHash}`;
    } else {
      // For wrapper tests
      return `/dist_ext/${microCode}/${resourceName}.${resourceType}${allowCache ? '' : `?${+new Date()}`}`;
    }
  }

  private _createBuildObservable(microCode: string, forceReload: boolean = false): Observable<boolean> {
    return this.loadBuildHash(microCode).pipe(
      mergeMap((buildHash: string) => {
        const url: string = this.getResourceUrl(microCode, buildHash, this.microFileName, 'js');
        if (forceReload) {
          this.registry.scripts[url] = null;
        }

        return this.loadScript(url, microCode);
      })
    );
  }

  private _createInnerMicroBuildObservable(microCode: string, innerMicroCode: string, subPath: string = null, forceReload: boolean = false): Observable<boolean> {
    return this.loadBuildHash(microCode, subPath).pipe(
      mergeMap((buildHash: string) => {
        return this._createBuildMicroConfigObservable(microCode, subPath).pipe(mergeMap((config: MicroAppInterface) => {
          if (!config.innerMicros || !config.innerMicros[innerMicroCode] || !config.innerMicros[innerMicroCode].bootstrapScriptUrl) {
            throw new Error(`Cant find inner micro: ${innerMicroCode}`);
          }
          const url: string = config.innerMicros[innerMicroCode].bootstrapScriptUrl;
          if (forceReload) {
            this.registry.scripts[url] = null;
          }

          return this.loadScript(url, microCode);
        }));
      })
    );
  }

  private _createBuildHashObservable(microCode: string, subPath: string = null): Observable<string> {
    return of(''); // We don't use hash anymore
    /*
    if (this.registry.buildHashes[microCode]) {
      return of(this.registry.buildHashes[microCode].micro);
    } else {
      const logStart: number = (new Date()).getTime();
      if (subPath) {
        subPath = subPath.split('/').filter(a => a !== '').join('/') + '/';
      }
      const url: string = this.getResourceUrl(microCode, null, `${subPath || ''}hashmap`, 'json', false);
      return this.httpClient.get(url).pipe(
        tap((hashmap: BuildHashMap) => this.registry.buildHashes[microCode] = hashmap),
        map(() => this.registry.buildHashes[microCode].micro),
        catchError(error => {
          this.logger.logError(`Cant load micro hash during ${(new Date()).getTime() - logStart}ms at '${url}':\n ${error.message || JSON.stringify(error)}`);
          return throwError(error);
        })
      );
    }*/
  }

  private _createBuildMicroConfigObservable(microCode: string, subPath: string = null): Observable<MicroAppInterface> {
    if (this.registry.buildMicroConfigs[microCode]) {
      return of(this.registry.buildMicroConfigs[microCode]);
    } else {
      const logStart: number = (new Date()).getTime();
      if (subPath) {
        subPath = subPath.split('/').filter(a => a !== '').join('/') + '/';
      }
      const url: string = this.getResourceUrl(microCode, null, `${subPath || ''}micro.config`, 'json', false);

      return this.httpClient.get(url).pipe(
        map((config: any) => {
          this.registry.buildMicroConfigs[microCode] = config;

          return config;
        }),
        catchError(error => {
          this.apmService.apm.captureError(`Cant load micro config during ${(new Date()).getTime() - logStart}ms at '${url}':\n ${error.message || JSON.stringify(error)}`);

          return throwError(error);
        })
      );
    }
  }
}
