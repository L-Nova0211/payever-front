import { OnInit, OnDestroy, Injector, Directive } from '@angular/core';
import { Subject } from 'rxjs';

import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { IntegrationsStateService } from '../../../../shared';
import { StateService } from '../../../services';

@Directive()
export abstract class BaseComponent implements OnInit, OnDestroy {

  protected stateService: StateService = this.injector.get(StateService);
  protected integrationsStateService: IntegrationsStateService = this.injector.get(IntegrationsStateService);
  protected translateService: TranslateService = this.injector.get(TranslateService);

  protected destroyed$: Subject<boolean> = new Subject();

  constructor(protected injector: Injector) {}

  get snackBarService(): SnackbarService {
    return this.injector.get(SnackbarService);
  }

  ngOnInit(): void {
    return;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  protected showMessage(message: string): void {
    this.snackBarService.toggle(true, {
      content: message || this.translateService.translate('errors.unknown_error'),
      duration: 5000,
      iconId: 'icon-help-24',
      iconSize: 24,
    });
  }

  protected showError(error: string): void {
    this.snackBarService.toggle(true,  {
      content: error || this.translateService.translate('errors.unknown_error'),
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }
}
