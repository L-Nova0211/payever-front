import { OnInit, OnDestroy, Injector, Directive } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { BehaviorSubject, Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { AuthTokenInterface } from '../interfaces/token.interface';
import { KeysStateService } from '../services/keys-state.service';

@Directive()
export abstract class ApiKeysBaseComponent implements OnInit, OnDestroy {

  protected stateService: KeysStateService = this.injector.get(KeysStateService);
  protected snackBarService: SnackbarService = this.injector.get(SnackbarService);
  protected translateService: TranslateService = this.injector.get(TranslateService);

  protected destroyed$: Subject<boolean> = new Subject();

  private clipboardService: ClipboardService = this.injector.get(ClipboardService);
  private copyKeys: {[key: string]: BehaviorSubject<string>} = {};

  constructor(protected injector: Injector) {}

  ngOnInit(): void {
    return;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  clipboardCopy(text: string, copyText$: BehaviorSubject<string>): void {
    this.clipboardService.copyFromContent(text); // TODO
    copyText$.next('actions.copied');
    timer(1500).pipe(takeUntil(this.destroyed$)).subscribe(() => {
      copyText$.next('actions.copy');
    });
  }

  getCopyText$(authToken: AuthTokenInterface, key: string): BehaviorSubject<string> {
    const id: string = authToken.id + '_' + key;
    if (!this.copyKeys[id]) {
      this.copyKeys[id] = new BehaviorSubject<string>('actions.copy');
    }

    return this.copyKeys[id];
  }

  protected showMessage(message: string): void {
    this.snackBarService.toggle(true, {
      content: message,
      duration: 5000,
      iconId: 'icon-help-24',
      iconSize: 24,
    });
  }

  protected showError(error: string): void {
    this.snackBarService.toggle(true,{
      content: error || this.translateService.translate('errors.unknown_error'),
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }
}
