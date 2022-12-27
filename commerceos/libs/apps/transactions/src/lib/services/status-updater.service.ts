import { Inject, Injectable, OnDestroy } from '@angular/core';
import { cloneDeep, forEach } from 'lodash-es';
import { Observable, BehaviorSubject, Subject, race, timer, merge } from 'rxjs';
import { delay, first, map, retryWhen, take, takeUntil, tap } from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';

import { PeAuthService } from '@pe/auth';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { StatusType } from '../shared/interfaces/status.type';

interface UpdateStatusInterface {
  status?: StatusType;
  specificStatus?: string;
  isLoading: boolean;
}

interface MessageDataInterface {
  id: string;
  name: string;
  result: boolean;
  status: StatusType;
  specificStatus?: string;
}

const MIN_WIDTH = 50;

@Injectable()
export class StatusUpdaterService implements OnDestroy {

  private readonly RETRY_DELAY = 2000;
  private readonly PING_DELAY = 30000;

  transactions: { [key: string]: BehaviorSubject<UpdateStatusInterface> } = {};

  private readonly updateStatusEventName: string = 'update-status';
  private statusWidth$ = new BehaviorSubject<number>(MIN_WIDTH);

  private socketSubject$ = webSocket<any>({
    url: this.getUrl(),
  });

  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(PE_ENV) private envConfig: EnvironmentConfigInterface,
    private authService: PeAuthService
  ) {
    const connect$ = this.socketSubject$.pipe(
      tap(message => this.onWebSocketMessage(message)),
      retryWhen(error => error.pipe(
        tap(() => this.setLoadingToAll(false)),
        delay(this.RETRY_DELAY),
      )),
    );
    const reconnect$ = race(
      this.socketSubject$.pipe(first()),
      timer(this.PING_DELAY).pipe(
        tap(() => this.socketSubject$.next('ping')),
      ),
    );

    merge(
      connect$,
      reconnect$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.next();
  }

  resetWidth() {
    this.statusWidth$.next(MIN_WIDTH);
  }

  setWidth(val: number) {
    this.statusWidth$.next(Math.max(this.statusWidth$.value, val));
  }

  get width(): number {
    return this.statusWidth$.value;
  }

  getWidth$(): Observable<number> {
    return this.statusWidth$.asObservable();
  }

  isLoading$(id: string): Observable<boolean> {
    return this.getById(id).pipe(map(a => a.isLoading));
  }

  getStatus$(id: string): Observable<StatusType> {
    return this.getById(id).pipe(map(a => {
      return a.status
    }));
  }

  getSpecificStatus$(id: string): Observable<string> {
    return this.getById(id).pipe(map(a => a.specificStatus));
  }

  triggerUpdateStatus(ids: string[]): void {
    forEach(ids, id => {
      this.getById(id).pipe(take(1)).subscribe(data => {
        if (!data.isLoading) {
          data = cloneDeep(data);
          data.isLoading = true;
          this.getById(id).next(data);

          this.send(id);
        }
      });
    });
  }

  private send(id: string): void {
    this.socketSubject$.next({
      event: this.updateStatusEventName,
      data: {
        id: id,
        token: this.authService.token,
      },
    });
  }

  private getUrl(): string {
    return this.envConfig.backend?.transactionsWs
      ? this.envConfig.backend.transactionsWs
      : `${this.envConfig.backend.transactions}/ws`.replace('https://', 'wss://');
  }

  private onWebSocketMessage(msgData: MessageDataInterface): void {
    if (msgData && msgData.id && msgData.name === this.updateStatusEventName) {
      this.getById(msgData.id).pipe(take(1)).subscribe(data => {
        data = cloneDeep(data);
        data.isLoading = false;
        if (msgData.result) {
          data.status = msgData.status || data.status;
          data.specificStatus = msgData.specificStatus || data.specificStatus;
        }
        this.getById(msgData.id).next(data);
      });
    }
  }

  private getById(id: string): BehaviorSubject<UpdateStatusInterface> {
    if (!this.transactions[id]) {
      this.transactions[id] = new BehaviorSubject<UpdateStatusInterface>({ isLoading: false });
    }

    return this.transactions[id];
  }

  private setLoadingToAll(isLoading: boolean): void {
    forEach(this.transactions, (transaction: any, id: string) => {
      this.getById(id).pipe(take(1)).subscribe(data => {
        if (data.isLoading !== isLoading) {
          data = cloneDeep(data);
          data.isLoading = isLoading;
          this.getById(id).next(data);
        }
      });
    });
  }
}
