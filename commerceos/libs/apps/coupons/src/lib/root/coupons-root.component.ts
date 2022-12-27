import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, AppType, APP_TYPE, EnvService, MessageBus, PeDestroyService, PreloaderState } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';

import { PeCouponsHeaderService } from '../services';

@Component({
  selector: 'pe-coupons-root',
  templateUrl: './coupons-root.component.html',
  styleUrls: ['./coupons-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class CosCouponsRootComponent implements OnInit, OnDestroy {
  @SelectSnapshot(PreloaderState.loading) loading: {};

  public theme = (this.envService.businessData?.themeSettings?.theme)
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  public readonly confirmationListener$ = this.messageBus
    .listen('open-confirm')
    .pipe(
      tap((headings: Headings) => {
        this.confirmationService.show(headings, false);
      }));

  constructor(
    private confirmationService: ConfirmScreenService,
    private envService: EnvService,
    private messageBus: MessageBus,
    private readonly destroy$: PeDestroyService,
    private peCouponsHeaderService: PeCouponsHeaderService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) { }

  get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType]
  }

  ngOnDestroy(): void {
    this.peCouponsHeaderService.destroy();
  }

  ngOnInit(): void {

    (window as any).PayeverStatic.IconLoader.loadIcons([
      'apps',
      'set',
    ]);

    this.peCouponsHeaderService.init();
    this.confirmationListener$
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
}
