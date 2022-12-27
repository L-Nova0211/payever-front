import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { AppThemeEnum, MessageBus } from '@pe/common';

@Injectable()
export class DialogService {
  private confirmationSubject$ = new BehaviorSubject(null);
  confirmation$ = this.confirmationSubject$.asObservable();
  theme = this.pebEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    private messageBus: MessageBus,
    private pebEnvService: PebEnvService,
  ) {}

  public open(headings) {
    this.messageBus.emit('open-confirm', headings);
    this.messageBus.listen('confirm').pipe(take(1))
      .subscribe((confirm) => {
        if (confirm) {
          this.confirmationSubject$.next(confirm);
        }
      });
  }
}
