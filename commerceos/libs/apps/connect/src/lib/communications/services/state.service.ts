import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, flatMap, take, map } from 'rxjs/operators';

import { BusinessService } from '../../shared';
import { SettingsInfoInterface } from '../types';

import { ApiService } from './api.service';

@Injectable()
export class StateService {

  // TODO Reset cache if business id was changed
  settingsSubject: BehaviorSubject<SettingsInfoInterface> = new BehaviorSubject<SettingsInfoInterface>(null)
  settingsProcessed = false;

  constructor(
    private apiService: ApiService,
    private businessService: BusinessService
  ) {}


  getSettings(name: string, reset: boolean = false): Observable<SettingsInfoInterface> {

    if (!this.settingsProcessed || reset) {
      this.settingsProcessed = true;
      this.settingsSubject.next(null);

      this.apiService.getSettings(this.businessService.businessId, name)
        .subscribe((data: SettingsInfoInterface) => this.settingsSubject.next(data));
    }

    return this.settingsSubject.asObservable();
  }

  getSettingsOnce(name: string, reset: boolean = false): Observable<SettingsInfoInterface> {
    return this.getSettings(name, reset).pipe(
      filter(d => !!d),
      take(1),
    );
  }

  saveSettings(name: string, data: SettingsInfoInterface): Observable<SettingsInfoInterface> {
    return this.apiService.saveSettings(this.businessService.businessId, name, data).pipe(
      flatMap(() => {
        return this.getSettingsOnce(name, true).pipe(map((data) => {
          return data;
        }));
      })
    );
  }
}
