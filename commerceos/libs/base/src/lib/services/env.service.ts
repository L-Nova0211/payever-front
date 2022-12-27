import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { HeaderDataInterface } from '../interfaces';


@Injectable({ providedIn:'root' })
export class CosEnvService {
  protected businessUuidStorage$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  launchPricingOverlay$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  protected isPersonalModeStorage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  get isPersonalMode(): boolean {
    return this.isPersonalModeStorage$.getValue();
  }

  set isPersonalMode(isPersonal: boolean) {
    this.isPersonalModeStorage$.next(isPersonal);
  }

  public isPersonalMode$: Observable<boolean> = this.isPersonalModeStorage$.asObservable();

  protected secondFactorAuthPassedSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  get secondFactorAuthPassed(): boolean {
    return this.secondFactorAuthPassedSubject$.getValue();
  }

  set secondFactorAuthPassed(isPersonal: boolean) {
    this.secondFactorAuthPassedSubject$.next(isPersonal);
  }

  public secondFactorAuthPassed$: Observable<boolean> = this.secondFactorAuthPassedSubject$.asObservable();
}
