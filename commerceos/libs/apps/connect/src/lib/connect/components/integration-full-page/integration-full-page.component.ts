import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';

import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import {
  AbstractComponent, IntegrationsApiService,
  IntegrationInfoWithStatusInterface, IntegrationsStateService, NavigationService,
} from '../../../shared';

@Component({
  selector: 'connect-integration-full-page',
  templateUrl: './integration-full-page.component.html',
  styleUrls: ['./integration-full-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationFullPageComponent extends AbstractComponent implements OnInit {

  integration: IntegrationInfoWithStatusInterface;

  constructor(
    private activatedRoute: ActivatedRoute,
    private integrationsApiService: IntegrationsApiService,
    private integrationsStateService: IntegrationsStateService,
    private navigationService: NavigationService,
    private cdr: ChangeDetectorRef,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
  ) {
    super();
  }

  /**
   * Load current integration to pass it to inner components
   */
  ngOnInit(): void {
    const integrationName = this.overlayData.integrationName;
    this.integrationsStateService.getIntegration(integrationName).pipe(
      takeUntil(this.destroyed$),
      filter(d => !!d)
    ).subscribe((integration) => {
      this.integration = integration;
      this.cdr.detectChanges();
    });
  }

  /**
   * Handle header close button click
   */
  handleClose(): void {
    this.navigationService.returnBack();
  }
}
