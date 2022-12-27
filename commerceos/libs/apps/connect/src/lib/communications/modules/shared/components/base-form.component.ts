import { Injector, OnDestroy, Directive } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  ErrorBag,
  FormAbstractComponent,
  ErrorBagDeepData,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { StateService } from '../../../services';

@Directive()
export abstract class BaseFormComponent<T> extends FormAbstractComponent<T> implements OnDestroy {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  errorBag: ErrorBag = this.injector.get(ErrorBag);
  errorsNonFlat$: Observable<ErrorBagDeepData> = this.errorBag.errors$;

  protected stateService: StateService = this.injector.get(StateService);
  protected translateService: TranslateService = this.injector.get(TranslateService);

  abstract createFormDeferred(initialData: T): void;

  constructor(
    injector: Injector
  ) {
    super(injector);
  }

  get snackBarService(): SnackbarService {
    return this.injector.get(SnackbarService);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.flushDataStorage();
  }

  createForm(initialData: T) {
    // Has do add timer() to avoid `ExpressionChangedAfterItHasBeenCheckedError:
    //Expression has changed after it was checked.`
    // It happens when we open whis page second time
    timer(0).pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.createFormDeferred(initialData);
    });
  }

  protected onUpdateFormData(formValues: any): void {
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
