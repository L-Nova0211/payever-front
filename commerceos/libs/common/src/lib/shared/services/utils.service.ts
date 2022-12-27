import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PeUtilsService {
  debounce(func, delay = 100) {
    let timer;

    return (event) => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(func,delay,event);
    };
  }
}
