import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { MessageBus } from '@pe/common';
import { PeDataGridSidebarService } from '@pe/data-grid';
import { TranslateService } from '@pe/i18n';
import {
  PePlatformHeaderService,
} from '@pe/platform-header';
import { PeSimpleStepperService } from '@pe/stepper';


import { IntegrationsStateService } from './integrations-state.service';

/*
const CATEGORIES = { // Key is IntegrationCategory
  'payments': 'categories.payments.title',
  // 'accountings': 'categories.accounting.title',
  'shippings': 'categories.shipping.title',
  'products': 'categories.products.title',
  'shopsystems': 'categories.shopsystems.title',
  'communications': 'categories.communications.title'
};
*/
@Injectable()
export class HeaderService {

  private integrationsStateService: IntegrationsStateService = this.injector.get(IntegrationsStateService);
  private platformHeaderService: PePlatformHeaderService = this.injector.get(PePlatformHeaderService);
  private router: Router = this.injector.get(Router);
  private simpleStepperService: PeSimpleStepperService = this.injector.get(PeSimpleStepperService);
  private translateService: TranslateService = this.injector.get(TranslateService);
  private dataGridSidebarService: PeDataGridSidebarService = this.injector.get(PeDataGridSidebarService);

  constructor(private injector: Injector) {
  }

  setHeader(): void {
/*    const config: PePlatformHeaderConfig = {
      isShowSubheader: false,
      mainDashboardUrl: `/business/${this.integrationsStateService.getBusinessId()}/info/overview`,
      currentMicroBaseUrl: `/business/${this.integrationsStateService.getBusinessId()}/connect`,
      isShowShortHeader: false,
      mainItem: null,
      isShowMainItem: false,
      showDataGridToggleItem: {
        onClick: () => {
          this.dataGridSidebarService.toggleFilters$.next();
        }
      },
      isShowDataGridToggleComponent: true,
      closeItem: {
        title: 'Back to apps',
        icon: '#icon-apps-header',
        iconType: 'vector',
        iconSize: '22px',
        isActive: true,
        class: 'connect-header-close',
        showIconBefore: true,
      },
      isShowCloseItem: true
    } as PePlatformHeaderConfig;

    this.platformHeaderService.assignConfig(config);*/
  }

  setShortHeader(titleKey: string, onCancel: () => void): void {
    const config = {
      shortHeaderTitleItem: this.translateService.translate(titleKey),
      shortHeaderLeftMenuItems: null,
      closeItem: {
        title: this.translateService.translate('actions.close'),
        icon: '#icon-x-24',
        iconType: 'vector',
        iconSize: '14px',
        onClick: () => onCancel(),
      },
      isShowShortHeader: true,
      isShowCloseItem: true,
    };
    this.platformHeaderService?.setConfig(config as any);

    this.platformHeaderService?.setShortHeader({
      title: this.translateService.translate(titleKey),
      isActive: true,
    });
  }

  initCheckoutWelcomeHeader(title: string, snapshot: ActivatedRouteSnapshot) {
    const queryParams = snapshot.queryParams;
    const checkoutUuid: string = queryParams['checkoutUuid'];
    const checkoutWelcomeScreen = queryParams[
    'checkoutWelcomeScreen'] === true || queryParams['checkoutWelcomeScreen'] === 'true';
    if (checkoutWelcomeScreen && checkoutUuid) {
      const isLoadingBack$ = new BehaviorSubject(false);
      const isLoadingContinue$ = new BehaviorSubject(false);
      const isDisabled$ = combineLatest([isLoadingBack$, isLoadingContinue$]).pipe(map(d => d[0] || d[1]));
      this.hideHeader();
      this.simpleStepperService.show(
      this.translateService.hasTranslation(title) ? this.translateService.translate(title) : title, [
        {
          title: this.translateService.translate('actions.go_back'),
          styling: {
            isTransparent: true,
          },
          isLoading$: isLoadingBack$,
          isDisabled$: isDisabled$,
          onClick: () => {
            isLoadingBack$.next(true);
            this.openCheckoutMicro(`checkout/${checkoutUuid}/welcome/payments`); // .subscribe();
          },
        },
        {
          title: this.translateService.translate('actions.continue'),
          isLoading$: isLoadingContinue$,
          isDisabled$: isDisabled$,
          onClick: (event: MouseEvent) => {
            isLoadingContinue$.next(true);
            this.openCheckoutMicro(`checkout/${checkoutUuid}`); // .subscribe();
          },
        },
      ]);

      return true;
    }

    return false;
  }

  hideHeader(): void {
    this.platformHeaderService.setConfig({ isHidden: true } as any);
  }

  private openCheckoutMicro(url: string): void { // : Observable<boolean> {
    /*
    return this.microRegistryService.getRegisteredMicros(this.paymentsStateService.getBusinessUuid()).pipe(flatMap(() => {
      const config: MicroAppInterface = this.microRegistryService.getMicroConfig('checkout') as MicroAppInterface;
      return this.microRegistryService.loadBuild(config).pipe(flatMap(() => timer(500)), map(() => {
        this.platformService.dispatchEvent({
          target: DashboardEventEnum.MicroNavigation as string,
          action: '',
          data: {
            url: url,
            getParams: {}
          }
        });
        return null;
      }));
    }));
     */
    const messageBus: MessageBus = this.injector.get(MessageBus);
    messageBus.emit('connect.navigate-to-app', url);
  }
}
