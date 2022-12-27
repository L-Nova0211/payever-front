import { ChangeDetectionStrategy, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import cloneDeep from 'lodash/cloneDeep';
import { of } from 'rxjs';
import { catchError, switchMap, take, tap } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { AbstractComponent, CosEnvService } from '@pe/base';
import { BusinessInterface, BusinessState } from '@pe/business';
import {
  AppSetUpStatusEnum,
  EnvironmentConfigInterface,
  MicroAppInterface,
  MicroRegistryService,
  PE_ENV,
} from '@pe/common';
import { DockerState, SetDockerItems } from '@pe/docker';
import { TranslateService } from '@pe/i18n';
import { WallpaperService } from '@pe/wallpaper';
@Component({
  selector: 'welcome-screen',
  templateUrl: 'welcome-screen.component.html',
  styleUrls: ['./welcome-screen.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeOverlayScreenComponent extends AbstractComponent implements OnInit {
  @Output() detachOverlay = new EventEmitter<void>();

  isLoading: boolean;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  @SelectSnapshot(DockerState.dockerItems) apps:any[];

  readonly defaultPricingLink = 'https://getpayever.com/';
  readonly defaultTermsLink = 'https://getpayever.com/';

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private translateService: TranslateService,
    private wallpaperService: WallpaperService,
    private microRegistryService: MicroRegistryService,
    private domSanitizer: DomSanitizer,
    private store: Store,
    private envService: CosEnvService,
    private authService: PeAuthService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.wallpaperService.showDashboardBackground(false);
  }

  onGetStarted(): void {
    this.isLoading = true;
    this.toggleInstall().pipe(
      switchMap(() => {
        let appName = this.params.appName;
        const runApp = () => {
          this.detachOverlay.emit();

          return null;
        };

        return this.envService.isPersonalMode
          ? of(runApp())
          : this.apiService.startTrial(appName, this.businessData._id).pipe(
            tap(() => runApp()),
            catchError(() => of(runApp())),
          );
      }),
      take(1),
    ).subscribe();
  }

  get icon() {
    let url = '';
    if (
      [
        'affiliates',
        'appointments',
        'blogs',
        'checkout',
        'commerceos',
        'connect',
        'contacts',
        'coupons',
        'invoices',
        'marketing',
        'message',
        'pos',
        'products',
        'settings',
        'shipping',
        'shop',
        'site',
        'social',
        'statistics',
        'studio',
        'subscriptions',
        'transactions',
      ].includes(this.appName)
    ) {
      url = this.env.custom.cdn + '/images/welcome-icons/' + this.appName + '.png';
    }

    return this.domSanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }

  private get params(): { businessId: string; appName: string; microPath: string } {
    const businessId: string = this.businessData._id;
    const appName: string = this.appName;
    const microPath: string = this.activatedRoute.snapshot.queryParams['path'];

    return { businessId, appName, microPath };
  }

  get appName(): string {
    const app = this.router.url.includes('welcome/')
      ? this.router.url.split('welcome/')[1]?.split('/')[0]
      : this.router.url.split('business/')[1]?.split('/')[1]
        || this.router.url.split('personal/')[1]?.split('/')[1];

      return app === 'info' || !app ? 'commerceos' : (app.includes('?') ? app.split('?')[0] : app);
  }

  get title(): string {
    return this.translateService.translate(`welcome.${this.appName}.title`);
  }

  get message(): string {
    return this.translateService.translate(`welcome.${this.appName}.message`);
  }

  get getStarted(): string {
    return this.translateService.translate(`welcome.get-started`);
  }

  get herebyConfirm(): string {
    return this.translateService.translate(`welcome.hereby-confirm`, {
      appName: this.appName,
      pricingLink: this.pricingLink,
      termsLink: this.termsLink,
    });
  }

  get pricingLink(): string {
    const key = `welcome.${this.appName}.pricing_link`;

    return this.translateService.hasTranslation(key) ? this.translateService.translate(key) : this.defaultPricingLink;
  }

  get termsLink(): string {
    const key = `welcome.${this.appName}.terms_link`;

    return this.translateService.hasTranslation(key) ? this.translateService.translate(key) : this.defaultTermsLink;
  }

  navigateToDashboard() {
    const url = this.envService.isPersonalMode
      ? `personal/${this.authService.getUserData().uuid}/info/overview`
      : `business/${this.businessData._id}/info/overview`;
    this.router.navigate([url]);
    this.detachOverlay.emit();
  }

  toggleInstall() {
    const app = this.microRegistryService.getMicroConfig(this.appName) as MicroAppInterface;
    const data = {
      installed: true,
      setupStatus: AppSetUpStatusEnum.Completed,
    };

    if (this.appName === 'commerceos') {
      return of(null);
    } else {
      if (this.envService.isPersonalMode) {
        return this.apiService.userToggleInstalledApp(app._id, data).pipe(
          tap(() => { this.setApp(app); })
        );
      } else {
        return this.apiService.toggleInstalledApp(this.businessData._id, app._id, data).pipe(
          tap(() => { this.setApp(app); })
        );
      }
    }
  }

  setApp(app) {
    let dockerApps = cloneDeep(this.apps);
    dockerApps = dockerApps.map((a) => {
      if (a.microUuid === app._id) {
        a.setupStatus=AppSetUpStatusEnum.Completed;

        return a;
      }

      return a;
    });
    this.store.dispatch(new SetDockerItems(dockerApps));
  }

}
