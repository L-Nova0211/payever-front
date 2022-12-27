import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ChangeDetectorRef,
  HostBinding,
  Input,
} from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { tap, filter, takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { PeMobileSidenavItem, PePlatformHeaderConfig } from '../platform-header.types';
import { PePlatformHeaderService } from '../services/abstract.platform-header.service';

@Component({
  selector: 'pe-new-platform-header',
  templateUrl: './platform-header.component.html',
  styleUrls: ['./platform-header.component.scss'],
  providers: [
    PeDestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PePlatformHeaderComponent implements OnInit {

  @HostBinding('class.short-header') isShortHeader = false;
  @HostBinding('class.subheader-mode') isShowSubheader = false;
  @Input() theme = 'dark';
  @Input() isLoading = false;

  isHeaderHideByZeroHeight$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  config$: BehaviorSubject<PePlatformHeaderConfig> = new BehaviorSubject<PePlatformHeaderConfig>(null);

  spinnerStrokeWidth = 2;
  spinnerDiameter = 18;

  isMobile = window.innerWidth <= 720;

  constructor(
    private platformHeaderService: PePlatformHeaderService,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService
  ) {

    (window as any).PayeverStatic.IconLoader.loadIcons([
      'set',
    ]);
  }

  ngOnInit(): void {
    merge(
      fromEvent(window, 'resize').pipe(
        tap(() => {
          this.isMobile = window.innerWidth <= 720;
        }),
      ),
      this.platformHeaderService.config$.pipe(
        filter(Boolean),
        tap((config: PePlatformHeaderConfig) => {
          const isRedrawRequired = this.isShowSubheader !== config.isShowSubheader || this.isShortHeader !== config.isShowShortHeader;
          this.isShowSubheader = config.isShowSubheader;
          this.isShortHeader = config.isShowShortHeader;
          this.config$.next(config);
          this.isHeaderHideByZeroHeight$.next(config.isHidden);
          if (isRedrawRequired) {
            this.cdr.detectChanges();
          }
        })
      )
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();

    this.platformHeaderService.routeChanged$.pipe(
      tap(() => {
        this.cdr.detectChanges();
      })
    );
  }

  isShowMobileSidebar(item: PeMobileSidenavItem, config: PePlatformHeaderConfig): boolean {
    const mobileSidenavItems = cloneDeep(config.mobileSidenavItems);
    if (config?.mobileSidenavItems?.length) {
      const lastItem = mobileSidenavItems.reverse().find(item => !item.active);

      return lastItem?.name === item.name ? true : false;
    }

    return false;
  }

  onCloseButtonClick(): void {
    this.platformHeaderService.closeButtonClicked$.next();
    if (this?.config$.value?.closeItem?.onClick) {
      this.config$.value.closeItem.onClick();
    }
  }
}
