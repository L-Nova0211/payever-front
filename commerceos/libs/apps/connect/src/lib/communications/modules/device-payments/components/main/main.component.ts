import { Component, Inject, Injector, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, finalize, take, takeUntil, tap } from 'rxjs/operators';

import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { IntegrationInfoWithStatusInterface, NavigationService, UninstallService } from '../../../../../shared';
import { BaseMainComponent, CommunicationMainWrapComponent } from '../../../shared/components';

@Component({
  selector: 'connect-communications-device-payments-main',
  templateUrl: './main.component.html',
  styleUrls: [
    './../../../shared/components/communication-main-wrap/communication-main-wrap-parent.component.scss',
    './main.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class DevicePaymentsMainComponent extends BaseMainComponent implements OnInit {

  integration: IntegrationInfoWithStatusInterface;
  integrationName = 'device-payments';
  integrationInfo$: Observable<IntegrationInfoWithStatusInterface> = null;

  onDataLoad: BehaviorSubject<number> = this.overlayData.onDataLoad;

  @ViewChild('wrap') wrap: CommunicationMainWrapComponent;

  constructor(
    protected injector: Injector,
    protected navigationService: NavigationService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    public uninstallService: UninstallService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.integrationInfo$ = this.integrationsStateService.getIntegration(this.integrationName).pipe(
      filter(d => !!d),
      tap((integration) => {
        this.integration = integration
      }),
      take(1),
      takeUntil(this.destroyed$)
    );
    this.integrationInfo$.pipe(finalize(() => this.onDataLoad.next(1))).subscribe();
  }

  handleClose() {
    this.navigationService.returnBack();
  }
}
