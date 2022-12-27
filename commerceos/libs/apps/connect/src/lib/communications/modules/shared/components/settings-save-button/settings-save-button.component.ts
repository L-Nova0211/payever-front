import { Component, Input, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';

import { SettingsOptionsInterface } from '../base-main.component';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'settings-save-button',
  templateUrl: './settings-save-button.component.html',
  styleUrls: ['./settings-save-button.component.scss'],
})
export class SettingsSaveButtonComponent extends BaseComponent {

  @Input() integrationName: string;
  @Input() data: SettingsOptionsInterface;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(injector: Injector) {
    super(injector);
  }

  onSubmit(): void {
    this.isLoading$.next(true);
    this.stateService.saveSettings(this.integrationName, this.data.settings).pipe(
      delay(200), // For better user UI
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this.isLoading$.next(false);
    }, (error) => {
      this.handleError(error, true);
      this.isLoading$.next(false);
    });
  }

  private handleError(error: any, showSnack?: boolean): void { // TODO Remove copypaste
    if (!error.message) {
      error.message = this.translateService.translate('errors.unknown_error');
    }
    if (error.status === 403 || error.statusCode === 403 || error.code === 403) {
      error.message = this.translateService.translate('errors.forbidden');
    }
    if (showSnack) {
      this.showStepError(error.error || error.message);
    }
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
