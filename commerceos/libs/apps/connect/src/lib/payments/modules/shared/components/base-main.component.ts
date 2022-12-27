import { OnDestroy, Injector, Directive } from '@angular/core';
import { merge } from 'lodash-es';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';

import { PaymentMethodEnum } from '../../../../shared';
import { PaymentsStateService, StepEnum } from '../../../../shared';
import { LoaderService } from '../../shared';

export interface SettingsOptionsInterface {
  settings?: {};
  options?: {};
}

@Directive()
export abstract class BaseMainComponent implements OnDestroy {

  abstract readonly paymentMethod: PaymentMethodEnum;
  protected paymentsStateService: PaymentsStateService = this.injector.get(PaymentsStateService);
  protected translateService: TranslateService = this.injector.get(TranslateService);

  protected destroyed$: Subject<boolean> = new Subject();

  openPanelSubject: Subject<StepEnum> = new Subject<StepEnum>();
  openPanel$ = this.openPanelSubject.asObservable();

  openNextPanelSubject: Subject<StepEnum> = new Subject<StepEnum>();
  openNextPanel$ = this.openNextPanelSubject.asObservable();

  settingsOptionsDataSubject: BehaviorSubject<SettingsOptionsInterface> =
  new BehaviorSubject<SettingsOptionsInterface>({
    settings: {},
    options: {},
  });

  protected loaderService = this.injector.get(LoaderService);
  protected overlayData = this.injector.get(PE_OVERLAY_DATA);

  constructor(
    protected injector: Injector,
  ) {
    this.loaderService.loaderSubject$ = this.overlayData.isLoading;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  get snackBarService(): SnackbarService {
    return this.injector.get(SnackbarService);
  }

  get settingsOptionsData$(): Observable<SettingsOptionsInterface> {
    return this.settingsOptionsDataSubject.asObservable();
  }

  onSettingsOptionsChanged(data: SettingsOptionsInterface): void {
    const current = this.settingsOptionsDataSubject.getValue();
    merge(current, data);
    this.settingsOptionsDataSubject.next(current);
  }

  onAdditionalInfoSaved(): void {
    this.openNextPanelSubject.next();
  }

  onExternalRegisterDone(): void {
    this.openNextPanelSubject.next();
  }

  onDocumentsUploaded(): void {
    this.openNextPanelSubject.next();
  }

  protected showStepError(error: string): void {
    this.snackBarService.toggle(true, {
      content:  error || this.translateService.translate('errors.unknown_error'),
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }
}
