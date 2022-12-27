import { ChangeDetectorRef, Component, Inject, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { assign, cloneDeep, forEach, isEqual, uniq, values } from 'lodash-es';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { IntegrationCategory } from '@pe/finexp-app';
import { SnackbarService } from '@pe/snackbar';
import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import {
BusinessNotificationSettingsInterface,
CronUpdateIntervalEnum,
ErrorNotificationTypesEnum,
IntegrationInfoInterface,
TimeFramesInterface,
} from '../../../interfaces';
import { StorageService } from '../../../services';

export interface SettingsOptionsInterface {
  value: string | number;
  label: string;
}

interface GroupedSettingsInterface {
  key: string;
  integrationInfo?: IntegrationInfoInterface;
  apiKeysInvalid?: BusinessNotificationSettingsInterface;
  paymentNotificationFailed?: BusinessNotificationSettingsInterface;
  paymentOptionCredentialsInvalid?: BusinessNotificationSettingsInterface;
  pspApiFailed?: BusinessNotificationSettingsInterface;
  lastTransactionTime?: BusinessNotificationSettingsInterface;
}

@Component({
  selector: 'notifications-settings',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    PeDestroyService,
  ],
})
export class NotificationsComponent implements OnInit {

  ErrorNotificationTypesEnum = ErrorNotificationTypesEnum;

  updateIntervalOptions: SettingsOptionsInterface[] = [
    {
      value: CronUpdateIntervalEnum.never,
      label: this.translateService.translate('settings.notifications.settings.updateInterval.options.never'),
    },
    {
      value: CronUpdateIntervalEnum.every5minutes,
      label: this.translateService.translate('settings.notifications.settings.updateInterval.options.every5minutes'),
    },
    {
      value: CronUpdateIntervalEnum.everyHour,
      label: this.translateService.translate('settings.notifications.settings.updateInterval.options.everyHour'),
    },
    {
      value: CronUpdateIntervalEnum.every24Hours,
      label: this.translateService.translate('settings.notifications.settings.updateInterval.options.every24Hours'),
    },
  ];

  repeatFrequencyIntervalOptions: SettingsOptionsInterface[] = this.getRepeatFrequencyIntervalOptions();

  formStorageKey = 'checkout-settings-notifications';
  checkoutUuid = this.overlayData.checkoutUuid;

  integrations: IntegrationInfoInterface[] = null;
  onSave$ = this.overlayData.onSave$.pipe(takeUntil(this.destroyed$));
  onClose$ = this.overlayData.onClose$.pipe(takeUntil(this.destroyed$));

  businessSettings: BusinessNotificationSettingsInterface[] = null;
  initialBusinessSettings: BusinessNotificationSettingsInterface[] = null;
  groupedBusinessSettings: GroupedSettingsInterface[] = [];

  isSaving$ = new BehaviorSubject(false);

  protected snackBarService: SnackbarService = this.injector.get(SnackbarService);
  protected checkoutStorageService: StorageService = this.injector.get(StorageService);
  protected cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);
  protected router: Router = this.injector.get(Router);

  constructor(
    private injector: Injector,
    private destroyed$: PeDestroyService,
    public translateService: TranslateService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
  ) {
  }

  ngOnInit() {
    this.overlayConfig.isLoading$ = this.isSaving$.asObservable();
    this.overlayConfig.doneBtnCallback = () => {
      this.saveAndGoBack();
    }
    this.initBusinessNotifications();
    this.onClose$.subscribe(() => {
      if (this.businessSettings) {
        this.overlayData.close();
      }
    });
  }

  saveAndGoBack(): void {
    if (this.businessSettings && !this.isSaving$.value) {
      const settingsToSave: BusinessNotificationSettingsInterface[] = [];
      for (let i = 0; i < this.businessSettings.length; i++) {
        if (!isEqual(this.businessSettings[i], this.initialBusinessSettings[i])) {
          settingsToSave.push(this.businessSettings[i]);
        }
      }
      this.isSaving$.next(true);
      this.checkoutStorageService.saveCheckoutNotificationSettings(settingsToSave).subscribe(() => {
        this.overlayData.close();
        this.isSaving$.next(false);
      }, (error) => {
        error = error?.rawError || error;
        const errMessages: string[] = [];
        this.extractErrors(error?.message, errMessages);
        if (errMessages.length > 0) {
          this.snackBarService.toggle(true, { content: errMessages.join(',<br>') });
        } else {
          // TODO Translations
          this.snackBarService.toggle(true, { content: error.code === 400 ?
            'Not possible to pass backend validation' : 'Not possible to save data' });
        }
        this.isSaving$.next(false);
      });
    }
  }

  addTimeFrame(settings: BusinessNotificationSettingsInterface) {
    settings.timeFrames = settings.timeFrames ? settings.timeFrames : [];
    settings.timeFrames.push({
      startDayOfWeek: 1,
      startHour: 0,
      startMinutes: 0,
      endDayOfWeek: 7,
      endHour: 23,
      endMinutes: 59,
      repeatFrequencyInterval: 0,
      sendEmailAfterInterval: 0,
    } as any);
  }

  deleteFrame(frames: TimeFramesInterface[], index: number) {
    frames.splice(index, 1);
  }

  updateFrame(frames: TimeFramesInterface[], index: number, data: TimeFramesInterface) {
    assign(frames[index], data);
  }

  private initBusinessNotifications(): void {
    combineLatest([
      this.checkoutStorageService.getIntegrationsInfoOnce(),
      this.checkoutStorageService.getCheckoutNotificationSettingsOnce(),
    ]).subscribe((data) => {
      this.integrations = data[0];
      this.businessSettings = data[1];
      this.initialBusinessSettings = this.businessSettings.map(a => cloneDeep(a));
      this.prepareGroupedSettings();
      this.cdr.detectChanges();
    });
  }

  private prepareGroupedSettings(): void {
    this.groupedBusinessSettings = [];
    const result: {[key: string]: GroupedSettingsInterface} = {};
    const availableIntegrations = this.integrations.filter(
      ig => ig && ig.installed && ig.integration.category === IntegrationCategory.Payments
    ).map(ig => ig.integration.name);
    const integrationKeys = uniq(this.businessSettings.map(a =>
      a.integration || null).filter(a => !a || availableIntegrations.indexOf(a) >= 0));

    forEach (integrationKeys, (key) => {
      const integration = this.integrations.find(a => (a.integration.name || null) === key);
      if (integration && integration.installed) {
        result[key] = {
          key: key,
          integrationInfo: integration,
        };
      } else if (!integration) { // General
        result[key] = {
          key: key,
          integrationInfo: null,
        };
      }
    });
    forEach (this.businessSettings, (setting: BusinessNotificationSettingsInterface) => {
      const key = setting.integration || null;
      if (result[key]) {
        if ( setting.type === ErrorNotificationTypesEnum.paymentNotificationFailed ) {
          result[key].paymentNotificationFailed = setting;
        } else if ( setting.type === ErrorNotificationTypesEnum.pspApiFailed ) {
          result[key].pspApiFailed = setting;
        } else if ( setting.type === ErrorNotificationTypesEnum.paymentOptionCredentialsInvalid ) {
          result[key].paymentOptionCredentialsInvalid = setting;
        } else if ( setting.type === ErrorNotificationTypesEnum.apiKeysInvalid ) {
          result[key].apiKeysInvalid = setting;
        } else if ( setting.type === ErrorNotificationTypesEnum.lastTransactionTime ) {
          result[key].lastTransactionTime = setting;
        }
      }
    });
    this.groupedBusinessSettings = values(result);
  }

  private getRepeatFrequencyIntervalOptions(): SettingsOptionsInterface[] {
    const options: SettingsOptionsInterface[] = [];
    const values = [0, 5, 10, 20, 30, 40, 50, 60];
    for (let i in values) {
      options.push({
        value: values[i],
        label: this.translateService.translate(
        `settings.notifications.settings.repeatFrequencyInterval.options.${values[i]}`),
      });
    }

    return options;
  }

  private extractErrors(messages: any[], result: string[]) {
    for (const message of messages) {
      if (message?.constraints && values(message?.constraints)?.length > 0) {
        result.push(...values(message?.constraints));
      }
      if (message?.children && message?.children?.length > 0) {
        this.extractErrors(message?.children, result);
      }
    }
  }
}
