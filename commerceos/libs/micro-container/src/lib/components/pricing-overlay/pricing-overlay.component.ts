import { Component, OnInit, Input, AfterViewInit, Inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { PeAuthService } from '@pe/auth';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

export enum appNameEnum {
  Products = 'products',
  Checkout = 'checkout',
  Transactions = 'transactions',
  Settings = 'settings'
}

@Component({
  selector: 'pricing-overlay',
  templateUrl: './pricing-overlay.component.html',
  styleUrls: ['pricing-overlay.component.scss'],
})
export class PricingOverlayComponent implements OnInit, AfterViewInit {
  @Input() selectBarObj: { appName: string, display: boolean } = { appName: '', display: false };
  pricingSrc: any;

  get shopUrl(): string  {
    return this.env.primary.shopHost;
  }

  get authToken(): string {
    return this.authService.token;
  }

  constructor(
    private authService: PeAuthService,
    private sanitizer: DomSanitizer,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) { }

  async ngOnInit() {
    this.pricingSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`https://shopplans.${this.shopUrl}?authToken=${encodeURIComponent(this.authToken)}&merchantMode=true&payEverShop=true`);
  }

  ngAfterViewInit() {
    setTimeout(() => { document.getElementById('pricing-overlay').style.opacity = '1'; }, 1500);
  }
}

