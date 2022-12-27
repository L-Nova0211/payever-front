import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { PeAuthService } from '@pe/auth';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

interface PricingObj {
  appName: string;
  displayBar: boolean;
  daysLeft: number;
  displayApp: boolean;
}

@Component({
  selector: 'select-plan-bar',
  templateUrl: './select-plan-bar.component.html',
  styleUrls: ['select-plan-bar.component.scss'],
})
export class SelectPlanBarComponent implements OnInit {
  @Input() pricingObj: PricingObj = { appName: '', displayBar: false, daysLeft: 0, displayApp: true };
  @Output() showPricingOverlay: EventEmitter<boolean> = new EventEmitter();
  pricingSrc: any;
  spinner = false;

  get shopUrl(): string {
    return this.env.primary.shopHost;
  }

  get authToken(): string {
    return this.authService.token;
  }

  constructor(
    private authService: PeAuthService,
    private sanitizer: DomSanitizer,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  ngOnInit() {
    this.pricingSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://shopplans.${this.shopUrl}?authToken=${encodeURIComponent(
        this.authToken,
      )}&merchantMode=true&payEverShop=true`,
    );
  }

  showPricing() {
    this.spinner = true;
    this.showPricingOverlay.emit(true);
  }
}
