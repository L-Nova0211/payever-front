import { Inject, Injectable, OnDestroy } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Actions, Store } from '@ngxs/store';
import { BehaviorSubject, Subject } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

import { PeAuthService } from '@pe/auth';
import { BusinessState } from '@pe/business';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { MessageNameEnum } from './notification.interfaces';
import { NotificationsResponseInterface } from './notification.interfaces'
import { PE_AUTH_TOKEN } from './token';

@Injectable({
  providedIn: 'any',
})
export class NotificationService implements OnDestroy {

  notificationsSocket = webSocket(this.env.backend.notificationsWs);

  @SelectSnapshot(BusinessState.businessUuid) businessUuid: string;
  private notificationsSubject$ = new BehaviorSubject<NotificationsResponseInterface>({ notifications:[],total:0,name:'',result:false })
  notofications = this.notificationsSubject$.asObservable()

  private readonly destroy$ = new Subject<void>();

  constructor(private store: Store,
              actions$: Actions,
              private authService: PeAuthService,
              @Inject(PE_AUTH_TOKEN) private token: string,
              @Inject(PE_ENV) private env: EnvironmentConfigInterface
  ) {
    // this.notificationsSocket.subscribe((data:any)=>{
    //   if (data.name === MessageNameEnum.EVENT_CONNECTION && data.result) {
    //     const event = {
    //       event:MessageNameEnum.GET_NOTIFICATIONS,
    //       data: {
    //         id: data.id,
    //         kind: 'business',
    //         entity: this.businessUuid,
    //         token: this.token,
    //         app: 'dashboard',
    //       },
    //     };
    //     this.notificationsSocket.next(event)
    //   }
    //   if (data.name === MessageNameEnum.GET_NOTIFICATIONS && data.result) {
    //     this.notificationsSubject$.next(data)
    //   }
    // })

    const event = {
      event: MessageNameEnum.EVENT_CONNECTION,
      data: {
        token: this.authService.token,
      },
    };
    this.notificationsSocket.next(event)
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
