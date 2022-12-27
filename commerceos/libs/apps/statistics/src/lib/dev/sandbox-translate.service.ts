import { Injectable } from '@angular/core';

import { PebTranslateService } from '@pe/common';

@Injectable({ providedIn: 'root' })
export class SandboxTranslateService implements PebTranslateService {

  translate(key: string, args?: any): string {
    return key;
  }

  hasTranslation(key: string): boolean {
    return true;
  }

}
