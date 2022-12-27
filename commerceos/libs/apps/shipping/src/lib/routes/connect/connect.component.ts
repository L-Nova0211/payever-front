import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { of } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

import { AppThemeEnum, EnvService, MessageBus, PeDestroyService, NavigationService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { SnackBarService } from '@pe/forms-core';

import { BaseComponent } from '../../misc/base.component';

import { PebShippingConnectService } from './connect.service';


@Component({
  selector: 'peb-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PebConnectComponent extends BaseComponent implements OnInit {
  shippingMethods;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  constructor(
    private shippingConnectService: PebShippingConnectService,
    private envService: EnvService,
    private messageBus: MessageBus,
    protected translateService: TranslateService,
    private navigationService: NavigationService,
    private router: Router,
    private apmService: ApmService,
    private snackBarService: SnackBarService,
    private destroyed$: PeDestroyService
  ) {
    super(translateService);
  }

  ngOnInit() {
    this.getShippingMethods();
  }

  getShippingMethods() {
    this.shippingMethods = this.shippingConnectService.getShippingMethods().pipe(
      map((data: any) => {
        return data.integrationSubscriptions;
      }),
      catchError((err) => {
        this.snackBarService.show(
          `Cant get connect from server, reason:\n ${err?.message}`
        );

        return of(null);
      }),
    );
  }

  onToggle(methodId: string, currentState: boolean) {
    if (currentState) {
      this.shippingConnectService.integrationDisable(methodId).pipe(takeUntil(this.destroyed$)).subscribe();
    } else {
      this.shippingConnectService.integrationEnable(methodId).pipe(takeUntil(this.destroyed$)).subscribe();
    }
  }

  addConnection() {
    this.navigationService.saveReturn(this.router.url);
    this.messageBus.emit('connect.app.open', null);
  }

  openIntegrationConfiguration(integrationName) {
    this.navigationService.saveReturn(this.router.url);
    this.messageBus.emit(`connect.app.integration.configure`, integrationName);
  }
}
