import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';

import { IntegrationInfoInterface } from '../../interfaces';
import { StorageService } from '../../services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'third-party',
  templateUrl: './third-party.component.html',
})
export class ThirdPartyComponent implements OnInit {
  integration: IntegrationInfoInterface;
  enabledIntegrations: string[];

  constructor(
    @Inject(PE_ENV) private env: EnvInterface,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    // TODO This code is not used?
    const integrationName = this.activatedRoute.snapshot.params['integrationName'];
    this.storageService.getIntegrationInfoOnce(integrationName)
      .subscribe(integration => this.integration = integration);
    this.storageService.getCheckoutEnabledIntegrationsOnce(this.checkoutUuid)
      .subscribe(integrations => this.enabledIntegrations = integrations);
  }

  handleClose(): void {
    this.router.navigate([`../..`], { relativeTo: this.activatedRoute });
  }

  get businessUuid(): string {
    return this.storageService.businessUuid;
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid']
      || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  get baseApiUrl(): string {
    return `${this.env.backend.thirdParty}/api/business/${this.businessUuid}/subscription/${this.integration.integration.name}/call`;
  }

  get baseApiData(): any {
    return {
      connectAppUrl: `/business/${this.storageService.businessUuid}/checkout/connect;action=edit` +
                     `;integrationCategory=${this.integration.integration.category};` +
                     `integrationName=${this.integration.integration.name};checkoutUuid=${this.checkoutUuid}`,
      enabledIntegrations: this.enabledIntegrations,
    };
  }
}
