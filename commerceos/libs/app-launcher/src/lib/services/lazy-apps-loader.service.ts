import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { appsLaunchedByEvent, CosEnvService } from '@pe/base';
import { BusinessState } from '@pe/business';
import {
  MicroAppDashboardInfoInterface,
  MicroAppInterface as LocalMicroAppInterface,
  MicroLoaderService,
  MicroRegistryService,
} from '@pe/common';
import { PlatformService } from '@pe/platform';

/**
 * This service can add and launch apps directly inside dashboard inside .pe-micro-container element.
 * Service add app to page, launch it and wait event from app that app is ready to be shown.
 * List of apps that can work this way stored inside appsShownWithoutRedirect array
 */
@Injectable({ providedIn: 'root' })
export class LazyAppsLoaderService {
  @SelectSnapshot(BusinessState.businessUuid) businessId: string;

  appReadyEvent$: Observable<string> = this.platformService.microAppReady$;

  runningMicroName$: Subject<string> = new Subject();
  microContainerActive$: Subject<boolean> = new Subject();

  private isMicroAppShowSubj: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private shownAppNameSubj: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(
    private authService: PeAuthService,
    private envService: CosEnvService,
    private microLoaderService: MicroLoaderService,
    private microRegistryService: MicroRegistryService,
    private platformService: PlatformService,
    private router: Router,
  ) {}

  get microContainerElement(): HTMLElement {
    return document.querySelector('.pe-micro-container');
  }

  get isMicroAppShown(): boolean {
    return this.isMicroAppShowSubj.value;
  }

  get isMicroAppShown$(): Observable<boolean> {
    return this.isMicroAppShowSubj.asObservable();
  }

  get shownAppName$(): Observable<string> {
    return this.shownAppNameSubj.asObservable();
  }

  get shownAppName(): string {
    return this.shownAppNameSubj.value;
  }

  set shownAppName(value: string) {
    this.shownAppNameSubj.next(value);
  }

  set isMicroAppShown(value: boolean) {
    this.isMicroAppShowSubj.next(value);

    // if we launch micro app inside dashboard we must check is this app should have platform header
    // if (appsUsingGlobalHeader.indexOf(this.shownAppNameSubj.value) < 0) {
    //   this.platformHeaderService.visible = !value;
    // }
  }

  showMicroApp$: Observable<boolean> = combineLatest(
    this.isMicroAppShown$,
    this.shownAppName$,
    this.appReadyEvent$,
    this.microContainerActive$.pipe(startWith(false)),
  ).pipe(
    debounceTime(200), // reduce amount of calls on switching statuses
    distinctUntilChanged((c, p) => !c.some((a, i) => p[i] !== a)),
    map(([isMicroShown, appToShow, readyApp, microContainerActive]) => {
      return (
        isMicroShown &&
        !microContainerActive &&
        (appToShow === readyApp || (appToShow === 'marketing' && readyApp === 'builder'))
      );
    }),
  );

  clearMicroContainerElement(): void {
    window.dispatchEvent(new CustomEvent(`pe-destroy-micro-app`, {}));
    if (this.microContainerElement) {
      this.microContainerElement.innerHTML = '';
    }
    this.shownAppName = null;
    this.isMicroAppShown = false;
    this.runningMicroName$.next('');
  }

  runMicroApp(microName: string, urlPath?: string): Observable<boolean> {
    /**
     * Adding POS header config
     */
    this.runningMicroName$.next(microName);
    if (this.envService.isPersonalMode) {
      window.history.pushState(null, null, `/personal/${this.authService.getUserData().uuid}/${urlPath || microName}`);
    } else {
      window.history.pushState(null, null, `/business/${this.businessId}/${urlPath || microName}`);
    }

    const config: LocalMicroAppInterface = this.microRegistryService.getMicroConfig(
      microName,
    ) as LocalMicroAppInterface;
    this.microContainerElement.innerHTML = config.tag;

    if (!config.installed) {
      this.install(config as LocalMicroAppInterface & MicroAppDashboardInfoInterface);
    }

    let obs$: Observable<boolean> = of(true);
    if (appsLaunchedByEvent.indexOf(config.code) > -1 && this.microLoaderService.isScriptLoadedbyCode(config.code)) {
      obs$ = of(true).pipe(
        tap(() => {
          window.dispatchEvent(new CustomEvent(`pe-run-${config.code}`, {}));
        }),
      );
    } else {
      if (this.microLoaderService.isScriptLoadedbyCode(config.code)) {
        // if the script already loaded we have to call it
        window.dispatchEvent(new CustomEvent(`pe-run-${config.code}`, {}));
      } else {
        obs$ = this.microRegistryService.loadBuild(config).pipe(
          tap(() => {
            if (appsLaunchedByEvent.indexOf(config.code) > -1) {
              window.dispatchEvent(new CustomEvent(`pe-run-${config.code}`, {}));
            }
          }),
        );
      }
    }

    return obs$.pipe(tap(() => (this.shownAppName = microName)));
  }

  runPackagedApp(microName: string, urlPath?: string): Observable<boolean> {
    this.runningMicroName$.next(microName);
    const config: LocalMicroAppInterface = this.microRegistryService.getMicroConfig(
      microName,
    ) as LocalMicroAppInterface;
    if (!config) {
      console.error('Cant get info about micro from registry!', microName, urlPath);
    }
    if (config && !config.installed) {
      this.install(config as LocalMicroAppInterface & MicroAppDashboardInfoInterface);
    }

    if (this.envService.isPersonalMode) {
      this.router.navigate([`personal/${this.authService.getUserData().uuid}/${urlPath || microName}`]);
    } else {
      this.router.navigate([`business/${this.businessId}/${urlPath || microName}`]);
    }

    return of(true).pipe(tap(() => (this.shownAppName = microName)));
  }

  private install(micro: LocalMicroAppInterface & MicroAppDashboardInfoInterface): void {
    micro.installed = true;
    const data = {
      microUuid: micro._id,
      installed: micro.installed,
    };

    micro.disabledClick = true;
  }
}
