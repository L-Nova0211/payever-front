import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, combineLatest, fromEvent, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, pluck, shareReplay, startWith, takeUntil } from 'rxjs/operators';

export interface WindowSizeInterface {
  height?: number;
  width?: number;
  availHeight?: number;
  availWidth?: number;
  availLeft?: number;
  availTop?: number;
  isMobile?: boolean;
  isIpad?: boolean;
  isTablet?: boolean;
  isDesktop?: boolean;
  isDesktopLg?: boolean;
}

export enum DeviceType {
  Mobile = 'mobile',
  Tablet = 'tablet',
  Desktop = 'desktop',
  DesktopLg = 'desktopLg',
}

export interface WindowScrollInterface {
  scrollHeight: number;
  scrollLeft: number;
  scrollTop: number;
  scrollWidth: number;
}

@Injectable({ providedIn: 'any' })
export class WindowService implements OnDestroy {
  destroy$: Subject<void> = new Subject();
  height$: Observable<number>;
  width$: Observable<number>;
  availHeight$: Observable<number>;
  availWidth$: Observable<number>;
  availLeft$: Observable<number>;
  availTop$: Observable<number>;
  isMobile$: Observable<boolean>;
  isIpad$: Observable<boolean>;
  isTablet$: Observable<boolean>;
  isDesktop$: Observable<boolean>;
  isDesktopLg$: Observable<boolean>;
  deviceType$: Observable<DeviceType>;
  deviceType: any;

  scrollHeight$: Observable<number>;
  scrollLeft$: Observable<number>;
  scrollTop$: Observable<number>;
  scrollWidth$: Observable<number>;

  window: Window = window;

  documentClickEvent$: Observable<Event> = fromEvent(this.window.document, 'click').pipe(
    takeUntil(this.destroy$),
    startWith(void 0), // always start from last event
    shareReplay(1), // always emit latest click event for subscriber
  );

  /**
   * @deprecated Use WindowEventsService.message$ instead
   */
  // messageEvent$: Observable<Event> = this.windowEventsService.message$(this.destroy$).pipe(
  //   takeUntil(this.destroy$),
  //   startWith(void 0), // always start from last event
  //   shareReplay(1), // always emit latest message for subscriber
  // );

  set scrollTop(value: number) {
    this.window.scrollTo(value, 0);
  }

  private widthMobile: number;
  private widthIpad: number;
  private widthTablet: number;
  private widthDesktop: number;

  constructor(
    // private window: Window, // non-injectable, use factory. Removed because doesn't work in ngcF
    @Inject(PLATFORM_ID) private platformId: string,
  ) {
    this.parseSizes();

    if (isPlatformBrowser(this.platformId)) {
      this.initialize();
    } else {
      this.handleWindowSizeForServerSideRendering();
      this.handleDeviceType();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calcWindowSize(windowWidth: number = null): WindowSizeInterface {
    return this.getWindowSize(windowWidth);
  }

  private initialize(): void {
    this.handleWindowResize();
    this.handleDeviceType();
    this.handleWindowScroll();
  }

  private parseSizes(): void {
    this.widthMobile = 720;
    this.widthIpad = 1024;
    this.widthTablet = 960;
    this.widthDesktop = 1280;
  }

  private handleWindowResize(): void {
    const windowSize$: BehaviorSubject<WindowSizeInterface> = new BehaviorSubject(this.getWindowSize());

    this.height$ = (windowSize$.pipe(pluck('height')) as Observable<number>).pipe(distinctUntilChanged());
    this.width$ = (windowSize$.pipe(pluck('width')) as Observable<number>).pipe(distinctUntilChanged());
    this.availHeight$ = (windowSize$.pipe(pluck('availHeight')) as Observable<number>).pipe(distinctUntilChanged());
    this.availWidth$ = (windowSize$.pipe(pluck('availWidth')) as Observable<number>).pipe(distinctUntilChanged());
    this.availLeft$ = (windowSize$.pipe(pluck('availLeft')) as Observable<number>).pipe(distinctUntilChanged());
    this.availTop$ = (windowSize$.pipe(pluck('availTop')) as Observable<number>).pipe(distinctUntilChanged());

    this.isMobile$ = (windowSize$.pipe(pluck('isMobile')) as Observable<boolean>).pipe(distinctUntilChanged());
    this.isIpad$ = (windowSize$.pipe(pluck('isIpad')) as Observable<boolean>).pipe(distinctUntilChanged());
    this.isTablet$ = (windowSize$.pipe(pluck('isTablet')) as Observable<boolean>).pipe(distinctUntilChanged());
    this.isDesktop$ = (windowSize$.pipe(pluck('isDesktop')) as Observable<boolean>).pipe(distinctUntilChanged());
    this.isDesktopLg$ = (windowSize$.pipe(pluck('isDesktopLg')) as Observable<boolean>).pipe(distinctUntilChanged());

    fromEvent(this.window, 'resize')
      .pipe(
        takeUntil(this.destroy$),
        map(() => this.getWindowSize()),
      )
      .subscribe(windowSize$);
  }

  private handleWindowSizeForServerSideRendering(): void {
    let width = 0;
    switch (this.deviceType) {
      case DeviceType.Desktop:
        width = this.widthDesktop;
        break;
      case DeviceType.Tablet:
        width = this.widthTablet;
        break;
      case DeviceType.Mobile:
        width = this.widthMobile;
        break;
      default:
        break;
    }

    this.height$ = of(0);
    this.width$ = of(width);
    this.availHeight$ = of(0);
    this.availWidth$ = of(width);
    this.availLeft$ = of(0);
    this.availTop$ = of(0);

    this.isMobile$ = of(this.deviceType ? this.deviceType === DeviceType.Mobile : false);
    this.isIpad$ = of(false);
    this.isTablet$ = of(this.deviceType ? this.deviceType === DeviceType.Tablet : false);
    this.isDesktop$ = of(this.deviceType ? this.deviceType === DeviceType.Desktop : false);
    this.isDesktopLg$ = of(false);

    this.scrollHeight$ = of(0);
    this.scrollLeft$ = of(0);
    this.scrollTop$ = of(0);
    this.scrollWidth$ = of(0);
  }

  private handleDeviceType(): void {
    this.deviceType$ = combineLatest(this.isMobile$, this.isTablet$, this.isDesktop$, this.isDesktopLg$).pipe(
      filter((data: boolean[]) => {
        return data.filter((value: boolean) => value).length === 1;
      }),
      map((data: boolean[]) => {
        switch (data.indexOf(true)) {
          case 1:
            this.deviceType = DeviceType.Tablet;

            return DeviceType.Tablet;
          case 2:
            this.deviceType = DeviceType.Desktop;

            return DeviceType.Desktop;
          case 3:
            this.deviceType = DeviceType.DesktopLg;

            return DeviceType.DesktopLg;
          default:
            this.deviceType = DeviceType.Mobile;

            return DeviceType.Mobile;
        }
      }),
    );
  }

  private handleWindowScroll(): void {
    const windowScroll$: BehaviorSubject<WindowScrollInterface> = new BehaviorSubject(this.getWindowScrollData());
    this.scrollHeight$ = (windowScroll$.pipe(pluck('scrollHeight')) as Observable<number>).pipe(distinctUntilChanged());
    this.scrollLeft$ = (windowScroll$.pipe(pluck('scrollLeft')) as Observable<number>).pipe(distinctUntilChanged());
    this.scrollTop$ = (windowScroll$.pipe(pluck('scrollTop')) as Observable<number>).pipe(distinctUntilChanged());
    this.scrollWidth$ = (windowScroll$.pipe(pluck('scrollWidth')) as Observable<number>).pipe(distinctUntilChanged());
    fromEvent(this.window, 'scroll')
      .pipe(
        takeUntil(this.destroy$),
        map(() => this.getWindowScrollData()),
      )
      .subscribe(windowScroll$);
  }

  private getWindowSize(windowWidth: number = null): WindowSizeInterface {
    windowWidth = windowWidth || this.window.innerWidth;
    const isMobile: boolean = windowWidth < this.widthMobile;
    const isIpad: boolean = windowWidth >= this.widthMobile && windowWidth <= this.widthIpad;
    const isTablet: boolean = this.widthMobile <= windowWidth && windowWidth < this.widthTablet;
    const isDesktop: boolean = this.widthTablet <= windowWidth && windowWidth < this.widthDesktop;
    const isDesktopLg: boolean = this.widthDesktop <= windowWidth;

    return {
      height: this.window.innerHeight,
      width: this.window.innerWidth,
      availHeight: this.window.screen['availHeight'],
      availWidth: this.window.screen['availWidth'],
      availLeft: this.window.screen['availLeft'] || 0,
      availTop: this.window.screen['availTop'] || 0,
      isIpad,
      isMobile,
      isTablet,
      isDesktop,
      isDesktopLg,
    };
  }

  private getWindowScrollData(): WindowScrollInterface {
    const scrollingElement: Element = (this.window && this.window.document && this.window.document.scrollingElement
      ? this.window.document.scrollingElement
      : {}) as Element;

    return {
      scrollHeight: scrollingElement.scrollHeight || 0,
      scrollLeft: scrollingElement.scrollLeft || 0,
      scrollTop: scrollingElement.scrollTop || 0,
      scrollWidth: scrollingElement.scrollWidth || 0,
    };
  }
}
