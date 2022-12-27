import { InjectionToken } from '@angular/core';

import { EnvironmentConfigInterface } from '../interfaces/environment-config.interface';

export const PE_ENV = new InjectionToken<EnvironmentConfigInterface>('PE_ENV');
