import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private currencyStream$ = new BehaviorSubject<string>(null);

  currency$ = this.currencyStream$.asObservable();

  get currency(): string {
    return this.currencyStream$.value;
  }

  set currency(value: string) {
    this.currencyStream$.next(value);
  }
}
