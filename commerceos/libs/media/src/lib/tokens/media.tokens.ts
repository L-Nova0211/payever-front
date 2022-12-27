import { InjectionToken } from '@angular/core';

import { MediaEnv } from '../interfaces';

export const PE_CUSTOM_CDN_PATH = new InjectionToken<string>('PE_CUSTOM_CDN_PATH');
export const PE_MEDIA_API_PATH = new InjectionToken<string>('PE_MEDIA_API_PATH');
export const PE_MEDIA_CONTAINER = new InjectionToken<string>('PE_MEDIA_CONTAINER');

export const MEDIA_ENV = new InjectionToken<MediaEnv>('MEDIA_ENV');
