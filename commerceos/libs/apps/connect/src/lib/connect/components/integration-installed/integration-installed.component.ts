import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { BehaviorSubject, EMPTY, Observable, Subject } from 'rxjs';
import { catchError, filter, take, tap } from 'rxjs/operators';

import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import {
  IntegrationsStateService, IntegrationInfoWithStatusInterface,
  NavigationService,
} from '../../../shared';

@Component({
  selector: 'integration-installed',
  templateUrl: './integration-installed.component.html',
  styleUrls: ['./integration-installed.component.scss'],
})
export class IntegrationInstalledComponent implements OnInit, OnDestroy {

  name: string = this.overlayData.integrationName;
  onAction: BehaviorSubject<number> = this.overlayData.onAction;
  onDataLoad: BehaviorSubject<number> = this.overlayData.onDataLoad;
  installed: boolean;
  integration: IntegrationInfoWithStatusInterface;

  isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();
  protected destroyed$: Subject<boolean> = new Subject();

  constructor(
    private integrationsStateService: IntegrationsStateService,
    private navigationService: NavigationService,
    private apmService: ApmService,
    private router: Router,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
  ) {}

  ngOnInit(): void {
    this.isLoadingSubject.next(true);
    this.integrationsStateService.getIntegration(this.name)
      .pipe(
        filter(d => !!d),
        take(1),
        tap((integration) => {
          this.integration = integration;
          this.installed = integration.status ? integration.status.installed : false;
          this.isLoadingSubject.next(false);
          this.onDataLoad.next(1);
        }),
        catchError((error) => {
          this.onDataLoad.next(1);
          this.apmService.apm.captureError(
            `Get integration ERROR ms:\n ${JSON.stringify(error)}`
          );

          return EMPTY;
        }),
      ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  handleClose(): void {
    this.onAction.next(1);
  }

  handleOpen(): void {
    this.onAction.next(1);
    const businessId = this.integrationsStateService.getBusinessId();
    this.router.navigate([`business/${businessId}/connect/` +
      `${this.integration.category}/configure/${this.integration.name}/default`]);
  }
}
