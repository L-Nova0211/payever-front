import { InjectionToken } from '@angular/core';

import { PebTimePickerConfig } from '../interfaces';

import { PebColorSet } from './colorset';

export const PE_TIMEPICKER_CONFIG = new InjectionToken<any>('PE_TIMEPICKER_CONFIG');

export const DEFAULT_CONFIG: PebTimePickerConfig = {
  time: '00:00',
  theme: 'dark',
  rangeTime: { start: '0:0', end: '24:0' },
  allowedRanges: [{ from: '0:0', to: '24:0' }],
  arrowStyle: {
    background: PebColorSet.darkActive,
    color: PebColorSet.darkColor,
  },
};
