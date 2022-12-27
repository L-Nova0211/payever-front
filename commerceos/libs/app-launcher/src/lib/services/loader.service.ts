import { Injectable } from '@angular/core';
import { fromEvent, Observable, of, Subject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { appsLaunchedByEvent, preloadedApps } from '@pe/base';
import { MicroAppInterface, MicroRegistryService } from '@pe/common';

@Injectable({ providedIn:'root' })
export class LoaderService {

  private appLoadingSubject: Subject<string> = new Subject<string>();
  private loadImageSubject: Subject<boolean> = new Subject<boolean>();
  private logoutSubject: Subject<boolean> = new Subject<boolean>();

  constructor(private microRegistryService: MicroRegistryService) {
  }

  get appLoading$(): Observable<string> {
    return this.appLoadingSubject.asObservable();
  }

  set appLoading(appName: string) {
    this.appLoadingSubject.next(appName);
  }

  get loadImage$(): Observable<boolean> {
    return this.loadImageSubject.asObservable();
  }

  get logoutEvent$(): Observable<boolean> {
    return this.logoutSubject.asObservable();
  }

  imagePreload(src: string): Observable<Event> {
    const image: HTMLImageElement = new Image();
    image.src = src;

    return fromEvent(image, 'load');
  }

  setImageStateToLoaded(): void {
    this.loadImageSubject.next();
  }

  setLogoutState(): void {
    this.logoutSubject.next();
  }

  /**
   * Try to load micro script, handle loading spinners. Load script only once
   * @param micro
   */
  loadMicroScript(microName: string, businessId?: string): Observable<boolean> {
    let registeredMicros$: Observable<MicroAppInterface[]> = of([]);
    let micro: MicroAppInterface = this.microRegistryService.getMicroConfig(microName) as MicroAppInterface;
    // if app-registry data is missed then try to fetch it at first
    if (!micro) {
      if (businessId) {
        registeredMicros$ = this.microRegistryService.getRegisteredMicros(businessId);
      } else {
        registeredMicros$ = this.microRegistryService.getPersonalRegisteredMicros();
      }
      registeredMicros$ = registeredMicros$.pipe(
        catchError(() => of([])),
        tap((micros: MicroAppInterface[]) => {
          micro = this.microRegistryService.getMicroConfig(microName) as MicroAppInterface;
        })
      );
    }

    return registeredMicros$.pipe(
      switchMap(() => {
        // if app support launching by window event - load it here, then navigate to route.
        let loadObservable$: Observable<boolean> = of(true);
        if (micro && appsLaunchedByEvent.indexOf(micro.code) > -1 && !this.isMicroLoaded(micro) &&
          preloadedApps.indexOf(micro.code) === -1)
        {

          loadObservable$ = this.microRegistryService.loadBuild(micro);
        }
        if (!micro) {
          console.error('Not possible to load Micro Script', microName, businessId);
        }

        return loadObservable$;
      }),
      tap(() => {
        // this.appLoading = null;
        this.setMicroLoaded(micro);
      })
    );
  }

  private setMicroLoaded(micro: MicroAppInterface): void {
    window['peCommerceosMicroLoaded_' + micro.code] = true;
  }

  private isMicroLoaded(micro: MicroAppInterface): boolean {
    return !!window['peCommerceosMicroLoaded_' + micro.code];
  }
}
