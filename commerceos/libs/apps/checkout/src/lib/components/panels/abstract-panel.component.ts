import { Injector, Input, OnInit, Compiler, Directive, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Event } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import { PeDestroyService, NavigationService } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import {
  CheckoutInterface,
  CustomChannelTypeEnum,
  IntegrationCategory,
  IntegrationInfoInterface,
} from '../../interfaces';
import { RootCheckoutWrapperService, StorageService, ApiService } from '../../services';


@Directive({
  providers: [
    PeDestroyService,
  ],
})
export abstract class AbstractPanelComponent implements OnInit {

  @Input() onlyContent = false;

  loadingConnect = new BehaviorSubject(false);

  // Marketing list can be too huge this is why we don't show
  readonly disabledChannels: CustomChannelTypeEnum[] = [
    // CustomChannelTypeEnum.Marketing
  ];

  readonly channelsExtraConfigure: CustomChannelTypeEnum[] = [
    CustomChannelTypeEnum.Pos,
    CustomChannelTypeEnum.Shop,
    CustomChannelTypeEnum.Marketing,
    CustomChannelTypeEnum.QR,
  ];

  categories = IntegrationCategory;
  initHeaderSub: Subscription;
  currentCheckoutSub: Subscription;
  enabledIntegrationsSub: Subscription;
  currentCheckout$: BehaviorSubject<CheckoutInterface> = new BehaviorSubject(null);
  $enabledIntegrations: BehaviorSubject<string[]> = new BehaviorSubject([]);

  protected activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);
  protected compiler: Compiler = this.injector.get(Compiler);
  protected router: Router = this.injector.get(Router);
  protected apiService: ApiService = this.injector.get(ApiService);
  protected storageService: StorageService = this.injector.get(StorageService);
  protected wrapperService: RootCheckoutWrapperService = this.injector.get(RootCheckoutWrapperService);
  protected translateService: TranslateService = this.injector.get(TranslateService);
  protected navigationService: NavigationService = this.injector.get(NavigationService);
  private cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected destroyed$: PeDestroyService = this.injector.get(PeDestroyService);

  constructor(
    protected injector: Injector,
  ) {
    this.initCurrentCheckout(this.checkoutUuid);
  }

  ngOnInit(): void {
    let lastCheckoutUuid = this.checkoutUuid;
    this.router.events.pipe(takeUntil(this.destroyed$)).subscribe((event: Event) => {
      if (event instanceof NavigationEnd && lastCheckoutUuid !== this.checkoutUuid) {
        lastCheckoutUuid = this.checkoutUuid;
        this.initCurrentCheckout(this.checkoutUuid);
      }
    });
    this.storageService.checkoutUpdate$.pipe(takeUntil(this.destroyed$)).subscribe(() =>
    this.initCurrentCheckout(this.checkoutUuid));
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid']
    || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  initCurrentCheckout(checkoutUuid: string): void {
    if (this.currentCheckoutSub) {
      this.currentCheckoutSub.unsubscribe();
    }
    if (this.enabledIntegrationsSub) {
      this.enabledIntegrationsSub.unsubscribe();
    }

    this.currentCheckoutSub = this.storageService.getCheckoutById(this.checkoutUuid).pipe(
      takeUntil(this.destroyed$),
      filter(d => !!d)
    ).subscribe((current) => {
      this.currentCheckout$.next(current);
      this.cdr.markForCheck();
      this.enabledIntegrationsSub = this.storageService.getCheckoutEnabledIntegrations(current._id).pipe(
        takeUntil(this.destroyed$),
        filter(d => !!d)
      ).subscribe((enabledList) => {
        this.$enabledIntegrations.next(enabledList);
        this.cdr.markForCheck();
      });
    });
  }

  onToggleIntegration(integration: IntegrationInfoInterface) {
    this.$enabledIntegrations.pipe(
      takeUntil(this.destroyed$),
      filter(d => !!d),
      take(1)
    ).subscribe((names) => {
      this.storageService.toggleCheckoutIntegration(
        this.checkoutUuid,
        integration.integration.name,
        names.indexOf(integration.integration.name) < 0
      ).subscribe(() => {
        this.onUpdateData();
      });
    });
  }

  onUpdateData(): void {
    this.wrapperService.onSettingsUpdated();
  }

  clickedIntegrationOpenButton(integration: IntegrationInfoInterface): void {
    if (this.channelsExtraConfigure.indexOf(integration.integration.name as CustomChannelTypeEnum) >= 0) {
      // For qr, pos, etc. At Connect tab
      const channelRoute: string[] = [
        `business/${this.storageService.businessUuid}/checkout/` +
        `'${this.checkoutUuid}/channels/${integration.integration.name}-app`,
      ];
      this.router.navigate(channelRoute);
    } else if (this.disabledChannels.indexOf(integration.integration.name as CustomChannelTypeEnum) >= 0) {
      console.warn('This intergration is disabled:', integration.integration.name);
    } else {
      this.preloadConnectMicro().subscribe(() => {
        this.router.navigate([
          `/business/${this.storageService.businessUuid}/checkout/` +
          `${this.checkoutUuid}/connect-app-edit/${integration.integration.category}/${integration.integration.name}`,
        ]);
      });
    }
  }

  private getMicroPath(action: string) {
    let microPath = '';
    const app = this.activatedRoute.snapshot.params.app;
    const params = this.activatedRoute.snapshot.params;
    if (['shop', 'pos', 'marketing'].includes(app)) {
      microPath = `${app}/${params.appId}/${params.channelSetId}/${params.checkoutUuid}/`;
      switch (action) {
        case 'add':
          microPath += params.panel;
          break;
        default:
          microPath += 'view';
      }

      return (this.activatedRoute.snapshot.data.modal ? 'modal/' : '') + microPath;
    }

    return '';
  }

  clickedIntegrationAddButton(category: IntegrationCategory): void {
    this.loadingConnect.next(true);
    this.cdr.detectChanges();
    this.preloadConnectMicro().subscribe(() => {
      this.navigationService.saveReturn(this.router.url);
      this.router.navigate([
        `/business/${this.storageService.businessUuid}/connect`,
      ], { queryParams: { integrationName: category } });
    });
  }

  private preloadConnectMicro(): Observable<boolean> {
    // return this.microRegistryService.getRegisteredMicros(this.storageService.businessUuid).pipe(flatMap(() => {
    //   const config: MicroAppInterface = this.microRegistryService.getMicroConfig('connect') as MicroAppInterface;
    //   return this.microRegistryService.loadBuild(config).pipe(flatMap(() => timer(500)), map(() => true));
    // }));
    return new Observable<boolean>((subscriber) => {
      import('@pe/apps/connect').then((({ ConnectModule }) => {
        this.compiler.compileModuleAsync(ConnectModule).then((moduleFactory) => {
          subscriber.next(true);
        });
      }));
    });
  }
}
