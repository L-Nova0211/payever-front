import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, merge } from 'rxjs';
import { filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService, MessageBus, PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';

import { PeSocialNotificationTypesEnum } from '../../enums';
import { PeSocialBusinessIntegrationInterface } from '../../interfaces';
import { PeSocialApiService, PeSocialDialogService, PeSocialEnvService } from '../../services';

@Component({
  selector: 'pe-social-connect-list',
  templateUrl: './connect-list.component.html',
  styleUrls: ['./connect-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeSocialConnectListComponent implements OnInit {

  @Input() notOverlay = false;

  private readonly refreshIntegrations$ = new BehaviorSubject<boolean>(true);
  public readonly theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  private readonly configureIntegration$ = this.messageBus
    .listen('connect.app.integration.configure')
    .pipe(
      tap((integrationName) => {
        this.router.navigateByUrl(
          `business/${this.envService.businessId}/connect/social/configure/${integrationName}`,
        );
      }));
  
  private readonly openConnectApp$ = this.messageBus
    .listen('connect.app.open')
    .pipe(
      tap(() =>{ 
        this.router.navigateByUrl(
          `business/${this.envService.businessId}/connect?integrationName=social`,
        );
      }));

  public readonly integrations$ = this.refreshIntegrations$
    .pipe(
      switchMap(() => this.peSocialApiService.getSocialChannelSet()),
      map(integrations => integrations.filter(integration => integration.installed)));

  constructor(
    private router: Router,

    private confirmScreenService: ConfirmScreenService,
    private envService: EnvService,
    private messageBus: MessageBus,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private peSocialApiService: PeSocialApiService,
    private peSocialDialogService: PeSocialDialogService,
    private peSocialEnvService: PeSocialEnvService,
  ) { }

  ngOnInit(): void {
    merge(
      this.configureIntegration$,
      this.openConnectApp$,
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  public switchChannel(switchedIntegration: PeSocialBusinessIntegrationInterface, switcher: boolean): void {
    const translate = (value: string) => this.translateService.translate(value);
    if (switchedIntegration.channelId) {
      this.peSocialApiService.putSocialBusinessIntegrationSubscriptionsSwitch(switchedIntegration.id, switcher)
        .pipe(
          map(({ integrationSubscriptions }) => integrationSubscriptions
              .find(integration => integration._id === switchedIntegration.id)),
          tap((updatedIntegration) => {
            const currentIntegration = this.peSocialEnvService.businessIntegrations
              .find(integration => integration.id === updatedIntegration._id);
            currentIntegration.enabled = updatedIntegration.enabled;
            this.peSocialEnvService.businessIntegrations = [...this.peSocialEnvService.businessIntegrations];
            const switched = switcher
              ? 'social-app.notify.switched_on'
              : 'social-app.notify.switched_off';
            const notifyIconType = switcher
              ? PeSocialNotificationTypesEnum.Success
              : PeSocialNotificationTypesEnum.Failure;
            const notify = `${switchedIntegration.title.toUpperCase()} ${translate(switched)}`;
            this.showWarning(notify, notifyIconType);
          }),
          takeUntil(this.destroy$))
        .subscribe();
    } else {
      const currentIntegration = this.peSocialEnvService.businessIntegrations
        .find(integration => integration.id === switchedIntegration.id);
      currentIntegration.enabled = false;
      this.peSocialEnvService.businessIntegrations = [...this.peSocialEnvService.businessIntegrations];
      this.refreshIntegrations$.next(true);
      const condition = translate('social-app.notify.not_connected');
      const notify = `${switchedIntegration.title.toUpperCase()} ${condition}`;
      this.showWarning(notify, PeSocialNotificationTypesEnum.Warning);
    }
  }

  public confirmDialog(integrationName?: string) {
    if (this.notOverlay) {
      this.peSocialEnvService.openConnectApp(integrationName);
    } else {
      const translate = (value: string) => this.translateService.translate(value);
      const config: Headings = {
        title: translate('social-app.confirm_dialog.cancel.post_editor.to_connect.title'),
        subtitle: translate('social-app.confirm_dialog.cancel.post_editor.to_connect.subtitle'),
        confirmBtnText: translate('social-app.actions.configure'),
        declineBtnText: translate('social-app.actions.cancel'),
      }
      this.confirmScreenService.show(config, true)
        .pipe(
          take(1),
          filter(Boolean),
          tap(() => {
            this.peSocialEnvService.openConnectApp(integrationName);
            this.peSocialDialogService.closeAfterAction$.next();
          }),
          takeUntil(this.destroy$))
        .subscribe();
    }
  }

  private showWarning(notification: string, notifyIconType: PeSocialNotificationTypesEnum): void {
    this.peSocialEnvService.showWarning(notification, notifyIconType);
  }
}
