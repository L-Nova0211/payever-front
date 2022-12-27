import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { TranslateService } from '@pe/i18n-core';

import { BaseComponent } from '../../misc/base.component';

@Component({
  selector: 'peb-packaging-slip',
  templateUrl: './packaging-slip.component.html',
  styleUrls: ['./packaging-slip.component.scss'],
})
export class PebPackagingSlipComponent extends BaseComponent {
  business = {
    name: 'Test name',
    companyDetails: {
      legalForm: 'legal form',
    },
    companyAddress: {
      street: 'strrreet',
      zipCode: '123245',
      city: 'ciryts',
      country: 'somecounty',
      brand: 'BRAND LTD',
    },
    contactDetails: {
      phone: '1231245',
    },
  };

  packageSlip = {
    date: new Date(),
    order_id: 13512135,
    count_items: 1,
  };

  data = {
    processedAt: new Date(),
    to: {
      name: 'My name',
      streetNumber: '13',
      streetName: 'Street',
      zipCode: '66666',
      city: 'Test City',
      countryCode: '381',
    },
    billingAddress: {
      name: 'My name',
      streetNumber: '131',
      streetName: 'Street',
      zipCode: '666661',
      city: 'Test City1',
      countryCode: '3811',
    },
    products: [
      {
        image: null,
        name: 'Jacket',
        description: 'This is the description',
        price: '100,00',
      },
    ],
  };

  date = new Date();
  shippingOrderId = 13512135;
  totalPrice = 13;
  taxes = 20;

  shippingAddressSectionTitle = 'Ship to';
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    protected translateService: TranslateService,
  ) {
    super(translateService);
    this.matIconRegistry.addSvgIcon(
      `button-more`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/button-more.svg',
      ),
    );
  }
}
