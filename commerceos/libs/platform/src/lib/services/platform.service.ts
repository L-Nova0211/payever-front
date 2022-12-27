import { Injectable } from '@angular/core';
import { fromEvent, merge, Observable, of, Subject } from 'rxjs';
import { map, filter, mapTo } from 'rxjs/operators';

import { BackdropActionsEnum, MicroContainerTypeEnum } from '../enums/common.enum';
import { LoaderStateEnum } from '../enums/loader.enum';
import { DashboardEventEnum, EventEnum } from '../enums/platform-event.enum';
import { PlatformEventInterface } from '../interfaces/platform-event.interface';
import { ProfileMenuEventInterface } from '../interfaces/profile-menu-event.interface';
import { SubmicroNavigationDataInterface } from '../interfaces/submicro-navigation-data.interface';

import { PlatformAbstractService } from './platform-abstract.service';

@Injectable({ providedIn:'root' })
export class PlatformService extends PlatformAbstractService {

  eventName = EventEnum.Background;
  private platformEventsSubject: Subject<PlatformEventInterface> = new Subject<PlatformEventInterface>();

  constructor() {
    super();
    this.observe$.subscribe((event: PlatformEventInterface) => {
      this.platformEventsSubject.next(event);
    });
  }

  get backToCheckout$(): Observable<PlatformEventInterface> {
    return this.platformEvents$.pipe(
      filter((event: PlatformEventInterface) => event.target === DashboardEventEnum.CheckoutBack)
    );
  }

  get backToDashboard$(): Observable<PlatformEventInterface> {
    return this.platformEvents$.pipe(
      filter((event: PlatformEventInterface) => event.target === DashboardEventEnum.DashboardBack)
    );
  }

  get showAppSelector$(): Observable<PlatformEventInterface> {
    return this.platformEvents$.pipe(
      filter((event: PlatformEventInterface) => event.target === DashboardEventEnum.ShowAppSelector)
    );
  }

  get backToSwitcher$(): Observable<PlatformEventInterface> {
    return this.platformEvents$.pipe(
      filter((event: PlatformEventInterface) => event.target === DashboardEventEnum.SwitcherBack)
    );
  }

  get blurryBackdrop$(): Observable<boolean> {
    return this.platformEvents$.pipe(
      filter((event: PlatformEventInterface) => event.target === DashboardEventEnum.BlurryBackdrop),
      map((event: PlatformEventInterface) => event.action === BackdropActionsEnum.Show)
    );
  }

  get localeChanged$(): Observable<PlatformEventInterface> {
    return this.platformEvents$.pipe(
      filter((event: PlatformEventInterface) => event.target === EventEnum.LocaleChanged)
    );
  }

  get internetConnectionStatus$(): Observable<boolean> {
    return merge(
      fromEvent(window, 'offline').pipe(mapTo(false)),
      fromEvent(window, 'online').pipe(mapTo(true)),
      of(navigator.onLine)
    );
  }

  get microAppReady$(): Observable<string> {
    return this.platformEvents$.pipe(
      filter((event: PlatformEventInterface) => event.target === DashboardEventEnum.AppReady),
      map((event: PlatformEventInterface) => event.data)
    );
  }

  get microContainerType$(): Observable<MicroContainerTypeEnum> {
    return this.platformEvents$.pipe(
      filter((event: PlatformEventInterface) => event.target === DashboardEventEnum.MicroContainer),
      map((event: PlatformEventInterface) => event.action as MicroContainerTypeEnum)
    );
  }

  get microLoading$(): Observable<LoaderStateEnum> {
    return this.platformEvents$.pipe(
      filter((event: PlatformEventInterface) => event.target === DashboardEventEnum.MicroLoading),
      map((event: PlatformEventInterface) => event.action as LoaderStateEnum)
    );
  }

  get microNavigation$(): Observable<LoaderStateEnum> {
    return this.platformEvents$.pipe(
      filter((event: PlatformEventInterface) => event.target === DashboardEventEnum.MicroNavigation),
      map((event: PlatformEventInterface) => event.data)
    );
  }

  get submicroNavigation$(): Observable<SubmicroNavigationDataInterface> {
    return this.platformEvents$.pipe(
      filter((event: PlatformEventInterface) => event.target === DashboardEventEnum.SubmicroNavigation),
      map((event: PlatformEventInterface) => event.data as SubmicroNavigationDataInterface)
    );
  }

  get submicroClose$(): Observable<PlatformEventInterface> {
    return this.platformEvents$.pipe(
      filter((event: PlatformEventInterface) => event.target === DashboardEventEnum.SubmicroClose)
    );
  }

  get platformEvents$(): Observable<PlatformEventInterface> {
    return this.platformEventsSubject.asObservable();
  }

  get profileMenuChanged$(): Observable<ProfileMenuEventInterface> {
    return this.platformEvents$.pipe(
      filter((event: PlatformEventInterface) => event.target === DashboardEventEnum.ProfileMenuChange),
      map((event: PlatformEventInterface) => event.data)
    );
  }

  set blurryBackdrop(show: boolean) {
    this.dispatchEvent({
      target: DashboardEventEnum.BlurryBackdrop,
      action: show ? BackdropActionsEnum.Show : BackdropActionsEnum.Hide,
    });
  }

  set microContainerType(microContainerType: MicroContainerTypeEnum) {
    this.dispatchEvent({
      target: DashboardEventEnum.MicroContainer,
      action: microContainerType,
    });
  }

  set microLoaded(loaded: boolean) {
    this.dispatchEvent({
      target: DashboardEventEnum.MicroLoading,
      action: loaded ? LoaderStateEnum.NoLoading : LoaderStateEnum.Loading,
    });
  }

  set microAppReady(appName: string) {
    this.dispatchEvent({
      target: DashboardEventEnum.AppReady,
      action: '',
      data: appName,
    });
  }

  set profileMenuChanged(profileMenu: ProfileMenuEventInterface) {
    this.dispatchEvent({
      target: DashboardEventEnum.ProfileMenuChange,
      action: '',
      data: profileMenu,
    });
  }

  backToDashboard(): void {
    this.blurryBackdrop = false;
    this.microContainerType = MicroContainerTypeEnum.InfoBox;
    this.dispatchEvent({
      target: DashboardEventEnum.DashboardBack,
      action: '',
    });
  }

  showAppSelector(): void {
    this.dispatchEvent({
      target: DashboardEventEnum.ShowAppSelector,
      action: '',
    });
  }


  submicroNavigationForMicro$(micro: string): Observable<SubmicroNavigationDataInterface> {
    return this.platformEvents$.pipe(
      filter((event: PlatformEventInterface) => {
        return event.target === DashboardEventEnum.SubmicroNavigation && event.data &&
          (event.data as SubmicroNavigationDataInterface).rootMicro === micro
      }),
      map((event: PlatformEventInterface) => event.data as SubmicroNavigationDataInterface)
    );
  }

  isTestEnvironment(): boolean {
    return (window as any).PE_QA_DISABLE_AUTO_CLICK === true;
  }
}
