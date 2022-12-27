import { Injectable } from '@angular/core';

import { PebTranslateService } from '@pe/builder-core';

@Injectable({ providedIn: 'root' })
export class SandboxTranslateService implements PebTranslateService {

  translate(key: string, args?: any): string {
    return key;
  }

  hasTranslation(key: string): boolean {
    return true;
  }

}
