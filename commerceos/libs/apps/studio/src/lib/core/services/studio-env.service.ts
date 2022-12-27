import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { take, tap } from 'rxjs/operators';

import { BusinessState } from '@pe/business';
import { MessageBus } from '@pe/common';

@Injectable({ providedIn: 'root' })
export class StudioEnvService {
  @SelectSnapshot(BusinessState.businessData) business;

  theme = '';
  businessData$;
  businessId$;

  constructor(private messageBus: MessageBus) {}

  get themeSettings(): string {
    this.messageBus.listen('studio.theme.switch').pipe(
      take(1),
      tap((res: string) => {
        this.theme = res;
      }),
    ).subscribe();

    return this.theme;
  }

  get businessId(): string {
    return this.business._id;
  }

  get businessData(): any {
    return this.business;
  }
}
