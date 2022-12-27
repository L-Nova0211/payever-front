import { InjectionToken } from '@angular/core';

import { PebScreen } from '@pe/builder-core';

export interface PebViewerConfig {
  thresholds?: ScreenThresholds;
}

// TODO: Probably this can go to @pe/builder-core and used across entire builder
export type ScreenThresholds = {
  [screen in PebScreen]: [number, number];
};

export const defaultScreenThresholds: ScreenThresholds = {
  [PebScreen.Mobile]: [320, 748],
  [PebScreen.Tablet]: [748, 1180], // 768 - padding 10px
  [PebScreen.Desktop]: [1180, Infinity], // 1200 - padding 10px
};

export const SCREEN_THRESHOLDS = new InjectionToken<ScreenThresholds>('SCREEN_THRESHOLDS');

export const SCREEN_FROM_WIDTH = new InjectionToken<(width: number) => PebScreen>('SCREEN_FROM_WIDTH');

export const BUILDER_APP_STATE_SERVICE = new InjectionToken<any>('BUILDER_APP_STATE_SERVICE');
