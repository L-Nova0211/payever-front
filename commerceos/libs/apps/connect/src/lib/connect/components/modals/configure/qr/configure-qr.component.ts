import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IntegrationsStateService, PaymentsStateService, NavigationService } from '../../../../../shared';

@Component({
  selector: 'integration-configure-qr',
  templateUrl: './configure-qr.component.html',
})
export class ConfigureQrComponent implements OnInit { // TODO Remove

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
