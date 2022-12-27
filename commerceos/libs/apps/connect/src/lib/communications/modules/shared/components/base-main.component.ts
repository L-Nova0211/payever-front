import { OnDestroy, Injector, Directive } from '@angular/core';
import { merge } from 'lodash-es';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { IntegrationsStateService } from '../../../../shared';
import { StateService } from '../../../services';
import { SettingsInfoInterface } from '../../../types';

export interface SettingsOptionsInterface {
  settings?: SettingsInfoInterface;
}

@Directive()
export abstract class BaseMainComponent implements OnDestroy {

  abstract readonly integrationName: string;
  protected integrationsStateService: IntegrationsStateService = this.injector.get(IntegrationsStateService);
  protected stateService: StateService = this.injector.get(StateService);
  protected translateService: TranslateService = this.injector.get(TranslateService);

  protected destroyed$: Subject<boolean> = new Subject();

  settingsOptionsDataSubject: BehaviorSubject<SettingsOptionsInterface> =
  new BehaviorSubject<SettingsOptionsInterface>({
    settings: {},
  });

  constructor(protected injector: Injector) {}

  get snackBarService(): SnackbarService {
    return this.injector.get(SnackbarService);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  get settingsOptionsData$(): Observable<SettingsOptionsInterface> {
    return this.settingsOptionsDataSubject.asObservable();
  }

  onSettingsOptionsChanged(data: SettingsOptionsInterface): void {
    const current = this.settingsOptionsDataSubject.getValue();
    merge(current, data);
    this.settingsOptionsDataSubject.next(current);
  }

  protected showStepError(error: string): void {
    this.snackBarService.toggle(true, {
      content: error || this.translateService.translate('errors.unknown_error'),
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }
}
