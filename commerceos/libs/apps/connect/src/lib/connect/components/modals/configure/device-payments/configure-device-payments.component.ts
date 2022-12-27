import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IntegrationsStateService, PaymentsStateService, NavigationService } from '../../../../../shared';

@Component({
  selector: 'integration-configure-device-payments',
  templateUrl: './configure-device-payments.component.html',
})
export class ConfigureDevicePaymentsComponent implements OnInit { // TODO Remove

  constructor(private activatedRoute: ActivatedRoute,
              private integrationsStateService: IntegrationsStateService,
              private paymentsStateService: PaymentsStateService,
              private navigationService: NavigationService) {}

  ngOnInit(): void {
    this.navigationService.returnBack();
  }

  handleClose(): void {
    this.navigationService.returnBack();
  }
}
