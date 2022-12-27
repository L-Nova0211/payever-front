import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { CheckoutSharedService, EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';

import { TerminalInterface } from '../pos.types';

import { PosEnvService } from './pos-env.service';


@Injectable()

export class PosConnectService {
  terminal$: BehaviorSubject<TerminalInterface> = new BehaviorSubject(null);
  integration$: BehaviorSubject<any> = new BehaviorSubject(null);

  get integration(): any {
    return this.integration$.value;
  }

  get terminal(): TerminalInterface {
    return this.terminal$.value;
  }

  constructor(
    private http: HttpClient,
    private checkoutSharedService: CheckoutSharedService,
    @Inject(EnvService) private envService: PosEnvService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  get checkoutWrapperCustomerViewLink$(): Observable<string> {
    return combineLatest([
      this.checkoutSharedService.getLocale(this.terminal.channelSet),
      this.terminal$,
    ]).pipe(
      map(([locale, terminal]) => `${this.env.frontend.checkoutWrapper}/${locale}/pay/create-flow-from-qr/channel-set-id/${terminal.channelSet}`)
    );
  }

  requestInitialForm(): Observable<{ form: any }> {
    const url = `${this.integration.extension.url}/app/${this.envService.businessId}/generate`;

    return this.checkoutWrapperCustomerViewLink$.pipe(
      switchMap(checkoutWrapperLink => this.http.post<{ form: any }>(url, {
        businessId: this.envService.businessId,
        businessName: this.envService.businessName,
        url: checkoutWrapperLink,
        id: this.terminal._id,
        avatarUrl: this.terminal.logo,
      }))
    );
  }
}
