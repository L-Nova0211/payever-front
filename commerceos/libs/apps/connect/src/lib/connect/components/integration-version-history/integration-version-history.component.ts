/**
 * Integration version history page
 */


import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil, filter, tap, switchMap } from 'rxjs/operators';

import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import {
  AbstractComponent, IntegrationsStateService, IntegrationsApiService,
  IntegrationInfoWithStatusInterface, IntegrationVersionInterface, NavigationService,
} from '../../../shared';


@Component({
  selector: 'connect-integration-version-history',
  templateUrl: './integration-version-history.component.html',
  styleUrls: ['./integration-version-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationVersionHistoryComponent extends AbstractComponent implements OnInit {

  integration: IntegrationInfoWithStatusInterface;
  versions: IntegrationVersionInterface[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private integrationsStateService: IntegrationsStateService,
    private integrationsApiService: IntegrationsApiService,
    private cdr: ChangeDetectorRef,
    private navigationService: NavigationService,
    private router: Router,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
  ) {
    super();
  }

  /**
   * Load current integration
   */
  ngOnInit(): void {
    const integrationName = this.overlayData.integrationName;
    this.integrationsStateService.getIntegration(integrationName).pipe(
      takeUntil(this.destroyed$),
      filter(d => !!d),
      tap(integration => this.integration = integration),
      switchMap(() => this.integrationsApiService.getIntegrationVersions(integrationName))
    ).subscribe((versions) => {
      this.versions = versions;
      this.cdr.detectChanges();
    });
  }

  /**
   * Handle close button click from header
   */
  handleClose(): void {
    this.navigationService.returnBack();
  }

  /**
   * Back to the app page
   */
  back() {
    const businessId = this.integrationsStateService.getBusinessId();
    this.router.navigate([
      `business/${businessId}/connect/${this.integration.category}/integrations/${this.integration.name}/fullpage`]);
  }

}
