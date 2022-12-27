import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  PeMessageSettings,
  PeMessageIntegrationThemeItem,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class PeMessageIntegrationService {
  settingsStream$ = new BehaviorSubject<PeMessageSettings>(null);
  get settings(): PeMessageSettings {
    return this.settingsStream$.value;
  }

  set settings(settings: PeMessageSettings) {
    this.settingsStream$.next(settings);
  }

  private currSettingsStream$ = new BehaviorSubject<PeMessageIntegrationThemeItem>({
    settings: { customPresetColors: [] },
  });

  currSettings$ = this.currSettingsStream$.asObservable();
  get currSettings(): PeMessageIntegrationThemeItem {
    return this.currSettingsStream$.value;
  }

  set currSettings(currSettings: PeMessageIntegrationThemeItem) {
    this.currSettingsStream$.next(currSettings);
  }

  private integrationChannelListStream$ = new BehaviorSubject<any[]>([]);
  integrationChannelList$ = this.integrationChannelListStream$.asObservable();
  get integrationChannelList(): any[] {
    return this.integrationChannelListStream$.value;
  }

  set integrationChannelList(channelList: any[]) {
    this.integrationChannelListStream$.next(channelList);
  }
}
