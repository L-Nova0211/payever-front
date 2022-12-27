import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { MessageBus, NavigationService } from '@pe/common';
import { SnackbarService } from '@pe/snackbar';

import { PeSocialChannelsEnum, PeSocialNotificationTypesEnum } from '../enums';
import { PeSocialBusinessIntegrationInterface, PeSocialChannelSetInterface } from '../interfaces';

@Injectable()
export class PeSocialEnvService {
  // Business integrations
  private readonly businessIntegrationsStream$ = new BehaviorSubject<PeSocialBusinessIntegrationInterface[]>([]);
  public readonly businessIntegrations$ = this.businessIntegrationsStream$.asObservable();

  public get businessIntegrations(): PeSocialBusinessIntegrationInterface[] {
    return this.businessIntegrationsStream$.value;
  }

  public set businessIntegrations(businessIntegrations: PeSocialBusinessIntegrationInterface[]) {
    this.businessIntegrationsStream$.next(businessIntegrations);
  }

  constructor(
    private router: Router,

    private messageBus: MessageBus,
    private navigationService: NavigationService,
    private snackbarService: SnackbarService,
  ) { }

  public getBusinessIntegrations(businessIntegrations: any[]): PeSocialBusinessIntegrationInterface[] {
    return businessIntegrations.map((integration): PeSocialBusinessIntegrationInterface => ({
      channelName: PeSocialChannelsEnum[integration.integration.name],
      channelSet: false,
      enabled: integration.enabled,
      id: integration._id,
      installed: integration.installed,
      name: integration.integration.name,
    }));
  }

  public getChannelsSet(channelsSet: any[]): PeSocialChannelSetInterface[] {
    return channelsSet.map(({ channelSet, rules }) => ({
      id: channelSet.id,
      maxlength: rules && rules.length
        ? rules.find((rule: any) => rule.lettersCount !== null && rule.lettersCount !== 0).lettersCount
        : 2000,
      name: channelSet.type.toString(),
    }));
  }

  public openConnectApp(integrationName?: string): void {
    const event = integrationName
      ? 'connect.app.integration.configure'
      : 'connect.app.open';

    this.navigationService.saveReturn(this.router.url);
    this.messageBus.emit(event, integrationName);
  }

  public showWarning(notification: string, type?: PeSocialNotificationTypesEnum): void {
    const notifyIconType = {
      color: '#E2BB0B',
      id: 'icon-alert-24',
    };

    switch (type) {
      case PeSocialNotificationTypesEnum.Failure:
        notifyIconType.color = '#EB4653';
        notifyIconType.id = 'icon-x-rounded-16';
        break;
      case PeSocialNotificationTypesEnum.Success:
        notifyIconType.color = '#00B640';
        notifyIconType.id = 'icon-commerceos-success';
        break;
      case PeSocialNotificationTypesEnum.Warning:
        notifyIconType.color = '#E2BB0B';
        notifyIconType.id = 'icon-alert-24';
        break;
    }

    this.snackbarService.toggle(
      true,
      {
        content: notification,
        duration: 2500,
        iconColor: notifyIconType.color,
        iconId: notifyIconType.id,
        iconSize: 24,
      }
    );
  }
}
