import { Inject, Injectable, OnDestroy } from '@angular/core';
import { EMPTY, Observable, race, Subject, timer } from 'rxjs';
import { delay, filter, first, repeat, retry, retryWhen, takeUntil, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { PeAuthService } from '@pe/auth';
import {
  PebEditorWsEvents,
  PebEditorWsPublishRequestDto,
  PebEditorWsRequestMessage,
  PebEditorWsResponseMessage,
  PEB_EDITOR_WS_PATH,
} from '@pe/builder-api';
import { pebGenerateId } from '@pe/builder-core';
import { EnvService } from '@pe/common';

import { SiteEnvService } from '../site-env.service';

@Injectable()
export class PebActualSiteEditorWs implements OnDestroy {

  private readonly close$ = new Subject<void>();
  private socketSubject$: WebSocketSubject<any>;
  readonly messages$ = new Subject<PebEditorWsResponseMessage>();
  // private config: WebSocketSubjectConfig<any> = {
  //   url: this.editorWsPath,
  // };

  private readonly reconnectDelay = 2000;
  private readonly pingInterval = 60000; // ws closes connection after 5 min of idle

  constructor(
    @Inject(PEB_EDITOR_WS_PATH) private editorWsPath: string,
    private authService: PeAuthService,
    @Inject(EnvService) private envService: SiteEnvService,
  ) {
  }

  ngOnDestroy() {
    this.close();
  }

  connect(): void {
    if (!this.socketSubject$ || this.socketSubject$.closed) {
      this.socketSubject$ = webSocket({
        url: this.editorWsPath,
      });
      this.socketSubject$.pipe(
        tap(
          message => this.messages$.next(message),
          e => console.log('ws error', e),
        ),
        retryWhen(errors => errors.pipe(
          tap(() => console.log('retry')),
          delay(this.reconnectDelay),
        )),
      ).subscribe();
      race(
        timer(this.pingInterval).pipe(
          tap(() => this.socketSubject$.next('ping')),
        ),
        this.socketSubject$.pipe(first()),
      ).pipe(
        repeat(),
        retry(),
        takeUntil(this.close$),
      ).subscribe();
    }
  }

  close(): void {
    this.close$.next();
    this.socketSubject$?.complete();
    this.socketSubject$.closed = true;
  }

  on(event: string): Observable<any> {
    return this.messages$?.pipe(
      filter(message => message?.name === event && !!message?.result),
    ) ?? EMPTY;
  }

  private createWsMessage(event: string, id: string, params: any): PebEditorWsRequestMessage {
    return { event, data: { params, id, token: this.authService.token } };
  }

  getShapeAlbums({ id = pebGenerateId(), parent = null, type = null, pagination = {} } = {}) {
    const params: any = {
      pagination: { limit: 100, offset: 0, ...pagination },
    };
    if (parent) {
      params.parent = parent;
    }
    if (type) {
      params.type = type;
    }
    this.socketSubject$.next(this.createWsMessage(PebEditorWsEvents.GetShapeAlbum, id, {
      ...params,
      applicationId: this.envService.applicationId,
    }));
  }

  getShapes({ id = pebGenerateId(), album = null, type = null, pagination = {} } = {}) {
    const params: any = {
      pagination: { limit: 100, offset: 0, ...pagination },
    };
    if (album) {
      params.album = album;
    }
    if (type) {
      params.type = type;
    }
    this.socketSubject$.next(this.createWsMessage(PebEditorWsEvents.GetShape, id, {
      ...params,
      applicationId: this.envService.applicationId,
    }));
  }

  createMasterPage(params: { themeId: string, action: any }, id = pebGenerateId()): void {
    this.socketSubject$.next(this.createWsMessage(PebEditorWsEvents.AddAction, id, params));
  }

  publish(params: PebEditorWsPublishRequestDto, id = pebGenerateId()) {
    this.socketSubject$.next(this.createWsMessage(PebEditorWsEvents.Publish, id, params));
  }
}
