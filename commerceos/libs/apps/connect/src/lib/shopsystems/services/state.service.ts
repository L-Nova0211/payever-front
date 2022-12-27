import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { BusinessService } from '../../shared';
import {
  PluginInfoInterface,
} from '../types';

import { ShopsystemsApiService } from './api.service';

@Injectable()
export class ShopsystemsStateService {

  private pluginInfoList: {[key: string]: {
      subject: BehaviorSubject<PluginInfoInterface>,
      processed: boolean
    }} = {};

  constructor(
    private businessService: BusinessService,
    private apiService: ShopsystemsApiService,
    private translateService: TranslateService,
    private snackBarService: SnackbarService,
  ) {}

  getPluginInfo(name: string, reset: boolean = false): Observable<PluginInfoInterface> {
    if (!this.pluginInfoList[name]) {
      this.pluginInfoList[name] = {
        subject: new BehaviorSubject<PluginInfoInterface>(null),
        processed: false,
      };
    }
    if (!this.pluginInfoList[name].processed || reset) {
      this.pluginInfoList[name].processed = true;
      this.pluginInfoList[name].subject.next(null);

      this.apiService.getPluginInfo(name)
        .subscribe((data: PluginInfoInterface) => this.pluginInfoList[name].subject.next(data));
    }

    return this.pluginInfoList[name].subject.asObservable();
  }

  handleError(error: any, showSnack?: boolean): void { // TODO Remove copypaste
    if (!error.message) {
      error.message = this.translateService.translate('errors.unknown_error');
    }
    if (error.status === 403 || error.statusCode === 403 || error.code === 403) {
      error.message = this.translateService.translate('errors.forbidden');
    }
    if (showSnack) {
      this.snackBarService.toggle(true, error.message || this.translateService.translate('errors.unknown_error'), {
        data: {
          duration: 5000,
          iconId: 'icon-alert-24',
          iconSize: 24,
        },
      });
    }
  }
}
