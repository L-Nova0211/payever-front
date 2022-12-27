import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BusinessInterface, PebEnvService } from '@pe/builder-core';

const DEFAULT_BUSINESS_ID = '00d6d43b-4f6f-4d37-ae22-cf5158920e90';
const DEFAULT_SHOP_ID = 'cca262be-05b9-484c-b85a-5f2f8ca55b7e';

@Injectable()
export class SandboxEnv implements PebEnvService {

  protected shopId$: BehaviorSubject<string> = new BehaviorSubject<string>(DEFAULT_SHOP_ID);
  protected terminalId$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  protected businessId$: BehaviorSubject<string> = new BehaviorSubject<string>(DEFAULT_BUSINESS_ID);
  protected businessData$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  applicationId: string;

  get businessId(): string {
    return this.businessId$.value;
  }

  set businessId(value: string) {
    this.businessId$.next(value);
  }

  get businessData(): any {
    return this.businessData$.value;
  }

  set businessData(value: any) {
    this.businessData$.next(value);
  }

  get shopId(): string {
    return this.shopId$.value;
  }

  set shopId(value: string) {
    this.shopId$.next(value);
  }

  get terminalId(): string {
    return this.terminalId$.value;
  }

  set terminalId(value: string) {
    this.terminalId$.next(value);
  }

  get channelId(): string {
    return 'SANDBOX_CHANNEL';
  }

}
