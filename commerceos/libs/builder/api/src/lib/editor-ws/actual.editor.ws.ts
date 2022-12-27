import { Inject, Injectable, InjectionToken, OnDestroy } from '@angular/core';
import { from, Observable, race, Subject, timer } from 'rxjs';
import { delay, filter, first, repeat, retry, retryWhen, switchMap, takeUntil, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { PebAction, PebEnvService, pebGenerateId } from '@pe/builder-core';

import { PebEditorAuthTokenService } from '../token';

import { PebEditorWs } from './abstract.editor.ws';
import {
  PebEditorWsEvents,
  PebEditorWsPublishRequestDto,
  PebEditorWsRequestMessage,
  PebEditorWsResponseMessage,
} from './editor.ws.constants';

export const PEB_EDITOR_WS_PATH = new InjectionToken<string>('PEB_EDITOR_API_PATH');

@Injectable()
export class PebActualEditorWs implements PebEditorWs, OnDestroy {

  private readonly close$ = new Subject<void>();
  private socketSubject$: WebSocketSubject<any>;
  readonly messages$ = new Subject<PebEditorWsResponseMessage>();
  // private config: WebSocketSubjectConfig<any> = {
  //   url: this.editorWsPath,
  // };

  private readonly reconnectDelay = 2000;
  private readonly pingInterval = 30000; // ws closes connection after 5 min of idle

  private connecting: Promise<void>;

  constructor(
    @Inject(PEB_EDITOR_WS_PATH) private editorWsPath: string,
    private editorAuthTokenService: PebEditorAuthTokenService,
    private envService: PebEnvService,
  ) {
  }

  ngOnDestroy() {
    this.close();
  }

  connect(): Promise<void> {
    if (!this.connecting) {
      this.connecting = new Promise<void>((resolve, reject) => {
        if (!this.socketSubject$ || this.socketSubject$.closed) {
          this.socketSubject$ = webSocket({
            url: this.editorWsPath,
            openObserver: {
              next: () => resolve(),
              error: err => reject(err),
            },
      });
      this.socketSubject$.pipe(
        tap((message) => {
          this.messages$.next(message);
        }),
        retryWhen(errors => errors.pipe(
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
      ).subscribe();} else {
          resolve();
        }
      });
    }

    return this.connecting;
  }

  close(): void {
    this.close$.next();
    if (this.socketSubject$) {
      this.socketSubject$.complete();
      delete this.socketSubject$;
    }
    delete this.connecting;
  }

  on(event: string): Observable<any> {
    return from(this.connect()).pipe(
      switchMap(() => this.messages$?.pipe(
        filter(message => message?.name === event && !!message?.result),
        takeUntil(this.close$),
      )),
    );
  }

  private createWsMessage(event: string, id: string, params: any): PebEditorWsRequestMessage {
    const data: any = { params, id };
    if (this.editorAuthTokenService.token) {
      data.token = this.editorAuthTokenService.token;
    } else if (this.editorAuthTokenService.access) {
      data.access = this.editorAuthTokenService.access;
    }

    return { event, data };
  }

  sendMessage(event: PebEditorWsEvents | string, params: any, id: string = pebGenerateId()): Promise<string> {
    return this.connect().then(() => {
      this.socketSubject$.next(this.createWsMessage(event, id, params));

      return id;
    });
  }

  preInstallFinish(appId: string): Promise<string> {
    return this.sendMessage(PebEditorWsEvents.PreInstallFinished, {}, `pre-install-${appId}`);
  }

  getShapeAlbums({ parent = null, type = null, pagination = {} } = {}): Promise<string> {
    const params: any = {
      pagination: { limit: 100, offset: 0, ...pagination },
    };
    if (parent) {
      params.parent = parent;
    }
    if (type) {
      params.type = type;
    }

    return this.sendMessage(PebEditorWsEvents.GetShapeAlbum,  {
      ...params,
      applicationId: this.envService.applicationId ?? this.envService.shopId,
    });
  }

  getShapes({ album = null, type = null, pagination = {} } = {}): Promise<string> {
    const params: any = {
      pagination: { limit: 100, offset: 0, ...pagination },
    };
    if (album) {
      params.album = album;
    }
    if (type) {
      params.type = type;
    }

    return this.sendMessage(PebEditorWsEvents.GetShape, {
      ...params,
      applicationId: this.envService.applicationId ?? this.envService.shopId,
    });
  }

  deleteShape({ id = pebGenerateId(), shapeId = null } = {}) {
    this.socketSubject$.next(this.createWsMessage(PebEditorWsEvents.DeleteShape, id, {
      shapeId,
      applicationId: this.envService.applicationId ?? this.envService.shopId,
    }));
  }

  getShapesWithFilter({ id = pebGenerateId(), album = null, type = null, filters = [], pagination = {} } = {}) {
    const request = {
      pagination: {
        limit: 20,
        offset: 0,
        ...pagination,
      },
      filters: [ ...filters ],
    }

    if (album) {
      request.filters.push(
        {
          field: 'album',
          condition: 'contains',
          value: album,
        }
      );
    }

    this.socketSubject$.next(this.createWsMessage(PebEditorWsEvents.GetShapeWithFilter, id, {
      ...request,
      applicationId: this.envService.applicationId ?? this.envService.shopId,
    }));
  }

  createMasterPage(params: { themeId: string, action: any }, id = pebGenerateId()): void {
    this.socketSubject$.next(this.createWsMessage(PebEditorWsEvents.CreateMasterPage, id, params));
  }

  publish(params: PebEditorWsPublishRequestDto): Promise<string> {
    return this.sendMessage(PebEditorWsEvents.Publish, params);
  }

  addAction(params: { action: PebAction, themeId: string }): Promise<string> {
    return this.sendMessage(PebEditorWsEvents.AddAction, params);
  }

  deleteAction(params: { actionId: string, themeId: string }): Promise<string> {
    return this.sendMessage(PebEditorWsEvents.DeleteAction, params);
  }
}
