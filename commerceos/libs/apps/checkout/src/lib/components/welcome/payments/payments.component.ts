import { Component, Compiler, OnInit, ChangeDetectorRef,
  Injector, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { MessageBus } from '@pe/common';
import { AppSetUpService, MicroRegistryService } from '@pe/common';
import { InstallPaymentsListComponent } from '@pe/apps/connect';
import { TranslateService } from '@pe/i18n';
type IntegrationInfoWithStatusInterface = any; // TODO Take from Connect App SDK
import {
  PeSimpleStepperService,
  PeSimpleStepperActionType,
} from '@pe/stepper';



import { IntegrationInfoInterface, WelcomeStepEnum } from '../../../interfaces';
import { HeaderService, RootCheckoutWrapperService, StorageService } from '../../../services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'welcome-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class WelcomePaymentsComponent implements OnInit {

  integration: IntegrationInfoInterface;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @ViewChild('container', { read: ViewContainerRef }) lazyContainer: ViewContainerRef;

  lazyComponent: InstallPaymentsListComponent = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private appSetUpService: AppSetUpService,
    private compiler: Compiler,
    private cdr: ChangeDetectorRef,
    private peStepperService: PeSimpleStepperService,
    private messageBus: MessageBus,
    private storageService: StorageService,
    private headerService: HeaderService,
    private translateService: TranslateService,
    private wrapperService: RootCheckoutWrapperService,
    private injector: Injector,
    private microRegistryService: MicroRegistryService,
    private router: Router
  ) {
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid']
    || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  ngOnInit(): void {
    this.appSetUpService.setStep(this.storageService.businessUuid, 'checkout', WelcomeStepEnum.Payments).subscribe();
    this.peStepperService.show('stepper.payments.title', [
      {
        type: PeSimpleStepperActionType.Button,
        title: 'actions.skip',
        styling: {
          isTransparent: true,
        },
        isDisabled$: this.isLoading$,
        onClick: (event: MouseEvent) => {
          this.onSuccess();
        },
      },
      {
        type: PeSimpleStepperActionType.Button,
        title: 'actions.continue',
        isLoading$: this.isLoading$,
        isDisabled$: this.isDisabled$,
        onClick: (event: MouseEvent) => {
          this.onSuccess();
        },
      },
    ]);
    // this.platformService.microAppReady = 'checkout';
    this.headerService.hideHeader();
    /*
    import('@pe/apps/connect').then(({SharedModule}) => {
      this.compiler.compileModuleAsync(SharedModule).then(moduleFactory => {
        // Create a moduleRef, resolve an entry component, create the component
        const moduleRef = moduleFactory.create(this.injector);
        const componentFactory = moduleRef.instance.resolveInstallPaymentsListComponent();
        const { instance } = this.lazyContainer.createComponent(componentFactory, null, moduleRef.injector);
        this.lazyComponent = instance;

        instance.onLoadings.pipe(takeUntil(this.destroyed$)).subscribe($event => this.onLoadingsChanged($event));
        instance.onInstalledCount.pipe(takeUntil(this.destroyed$)).subscribe($event =>
          this.onInstalledCountChanged($event));
        instance.onOpenIntegration.pipe(takeUntil(this.destroyed$)).subscribe($event => this.onOpenIntegration($event));

        this.cdr.detectChanges();
      });
    });*/
  }

  onSuccess(): void {
    this.wrapperService.reCreateFlow(); // Refreshing to apply installed payments
    this.navigateToHome();
  }

  navigateToHome(): void {
    const base = this.storageService.getHomeUrl(this.checkoutUuid);
    this.router.navigate([`${base}/panel-checkout`]);
  }

  onLoadingsChanged(count: number): void {
    this.isLoading$.next(count > 0);
  }

  onInstalledCountChanged(count: number): void {
    this.isDisabled$.next(count === 0);
  }

  onOpenIntegration(integration: IntegrationInfoWithStatusInterface): void {
    this.isLoading$.next(true);
    this.messageBus.emit('checkout.navigate-to-app', {
      url: `connect/payments/configure/${integration.name}`,
      getParams: {
        checkoutWelcomeScreen: true,
        checkoutUuid: this.checkoutUuid,
      },
    });
  }
}
