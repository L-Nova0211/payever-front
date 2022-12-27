import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { BusinessService, IntegrationsApiService } from '../../services';

@Component({
  selector: 'connect-welcome-modal',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ConnectWelcomeComponent implements OnInit {

  isLoading = false;

  readonly defaultPricingLink = 'https://getpayever.com/';
  readonly defaultTermsLink = 'https://getpayever.com/';

  onAction: BehaviorSubject<number> = this.overlayData.onAction;
  onDataLoad: BehaviorSubject<number> = this.overlayData.onDataLoad;

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private businessService: BusinessService,
    private integrationsApiService: IntegrationsApiService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
  ) {
  }

  get herebyConfirm(): string {
    return this.translateService.translate(`welcome.hereby-confirm`, {
      appName: 'connect',
      pricingLink: this.pricingLink,
      termsLink: this.termsLink,
    });
  }

  get pricingLink(): string {
    const key = `welcome.connect.pricing_link`;

    return this.translateService.hasTranslation(key) ? this.translateService.translate(key) : this.defaultPricingLink;
  }

  get termsLink(): string {
    const key = `welcome.connect.terms_link`;

    return this.translateService.hasTranslation(key) ? this.translateService.translate(key) : this.defaultTermsLink;
  }

  ngOnInit() {
    this.onDataLoad.next(1);
  }

  getStarted() {
    this.isLoading = true;
    this.integrationsApiService.setStatus(this.businessService.businessId)
      .pipe(
        switchMap(() => this.integrationsApiService.startTrial(this.businessService.businessId)),
        finalize(() => {
          this.isLoading = false;
          this.onAction.next(1);
          this.router.navigate([`business/${this.businessService.businessId}/connect`]);
        })
      )
      .subscribe(() => {
      });
  }

  backToDashboard() {
    this.onAction.next(1);
    this.router.navigate([`business/${this.businessService.businessId}/info/overview`]);
  }
}
