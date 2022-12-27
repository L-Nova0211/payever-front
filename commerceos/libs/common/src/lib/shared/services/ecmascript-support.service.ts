import { Injectable } from '@angular/core';
import * as Supports from 'es-checker';

const ES6_SUPPORT_THRESHOLD = 0.95;

@Injectable()
export class ECMAScriptSupportService {

  get isEs6Supported(): boolean {
    const values: boolean[] = Object.values(Supports);
    const percentSupported = values.reduce((acc: number, curr: boolean) => curr ? ++acc : acc, 0);

    return percentSupported / values.length > ES6_SUPPORT_THRESHOLD;
  }
}
