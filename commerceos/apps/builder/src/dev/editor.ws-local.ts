import { Injectable, OnDestroy } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { from, merge, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { delay, filter, map, mergeMap, switchMap, takeUntil, tap } from 'rxjs/operators';

import {
  PebEditorAuthTokenService,
  PebEditorWs,
  PebEditorWsEvents,
  PebEditorWsPublishRequestDto,
  PebEditorWsRequestMessage,
  PebEditorWsResponseMessage,
} from '@pe/builder-api';
import { PebAction, PebEnvService, pebGenerateId, PebShapesAlbum, PebShapesShape } from '@pe/builder-core';

import { DatabaseEntity } from './editor.idb-config';
import { SandboxMockBackend } from './editor.api-local';

@Injectable()
export class SandboxMockEditorWs implements PebEditorWs, OnDestroy {

  private readonly requestSubject$ = new Subject<PebEditorWsRequestMessage>();
  private readonly responseSubject$ = new Subject<PebEditorWsResponseMessage>();
  private readonly destroy$ = new ReplaySubject<void>(1);
  readonly messages$: Observable<any> = this.responseSubject$.asObservable();

  constructor(
    private idb: NgxIndexedDBService,
    private envService: PebEnvService,
    private editorAuthTokenService: PebEditorAuthTokenService,
    private mock: SandboxMockBackend,
  ) {
    this.handleMessages().pipe(
      takeUntil(this.destroy$),
    ).subscribe();
    this.responseSubject$.pipe(
      tap(message => console.log('sandbox:ws:response', message)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  close(): void {
  }

  connect(): Promise<void> {
    return Promise.resolve();
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

    return this.sendMessage(PebEditorWsEvents.GetShapeAlbum, {
      ...params,
      applicationId: this.envService.shopId,
    });
  }

  getShapes({ album = null, type = null, pagination = {} } = {}) {
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
      applicationId: this.envService.shopId,
    });
  }

  publish(params: PebEditorWsPublishRequestDto) {
    return this.sendMessage(PebEditorWsEvents.Publish, params);
  }

  addAction(params: { action: PebAction; themeId: string }): Promise<string> {
    return this.sendMessage(PebEditorWsEvents.AddAction, params);
  }

  deleteAction(params: { actionId: string; themeId: string }): Promise<string> {
    return Promise.resolve('');
  }

  on(event: string): Observable<any> {
    return this.messages$.pipe(
      filter(message => message?.name === event && !!message?.result),
    );
  }

  private handleMessages(): Observable<any> {
    return merge(
      this.handleRequestEvent(PebEditorWsEvents.GetShape).pipe(
        switchMap((message) => {
          const params = message?.data?.params ?? {};
          const { limit = 0, offset = 0 } = params.pagination;

          return from(this.idb.getAll<PebShapesShape>(DatabaseEntity.Shapes)).pipe(
            map((shapes) => {
              let result = shapes;
              if (params.album === null || params.album) {
                result = result.filter(s => s.album === params.album);
              }

              return result.slice(offset, offset + limit);
            }),
            map(result => ({
              name: PebEditorWsEvents.GetShape,
              result: true,
              data: { shapes: result },
            } as PebEditorWsResponseMessage)),
          );
        }),
        tap(this.responseSubject$),
      ),
      this.handleRequestEvent(PebEditorWsEvents.GetShapeAlbum).pipe(
        switchMap((message) => {
          const params = message?.data?.params ?? {};
          const { limit = 0, offset = 0 } = params.pagination;

          return from(this.idb.getAll<PebShapesAlbum>(DatabaseEntity.ShapeAlbums)).pipe(
            map((albums) => {
              let result = albums;
              if (params.parent === null || params.parent) {
                result = result.filter(s => s.parent === params.parent);
              }

              return result.slice(offset, offset + limit);
            }),
            map(result => ({
              id: message.data?.id,
              name: PebEditorWsEvents.GetShapeAlbum,
              result: true,
              data: { shapeAlbums: result },
            } as PebEditorWsResponseMessage)),
          );
        }),
        tap(this.responseSubject$),
      ),
      this.handleRequestEvent(PebEditorWsEvents.Publish).pipe(
        mergeMap(message => of(message).pipe(
          delay(300),
          tap(() => this.responseSubject$.next({
            id: message.data?.id,
            name: PebEditorWsEvents.BuilderThemePublished,
            result: true,
            data: {
              status: 'builder-synced',
              theme: message.data.params?.themeId,
              version: '',
            },
          })),
        )),
        mergeMap(message => of(message).pipe(
          delay(300),
          tap(() => this.responseSubject$.next({
            id: message.data?.id,
            name: PebEditorWsEvents.BuilderThemePublished,
            result: true,
            data: {
              status: 'shop-synced',
              theme: message.data.params?.themeId,
              version: '',
            },
          })),
        )),
        mergeMap(message => of(message).pipe(
          delay(300),
          tap(() => this.responseSubject$.next({
            id: message.data?.id,
            name: PebEditorWsEvents.BuilderThemePublished,
            result: true,
            data: {
              status: 'client-synced',
              theme: message.data.params?.themeId,
              version: '',
            },
          })),
        )),
      ),
      this.handleRequestEvent(PebEditorWsEvents.AddAction).pipe(
        mergeMap(message => this.mock.addAction(message.data?.params?.themeId, message.data?.params?.action)),
      ),
      this.handleRequestEvent(PebEditorWsEvents.DeleteAction).pipe(
        mergeMap(message => this.mock.undoAction(message.data?.params?.themeId, message.data?.params?.actionId)),
      ),
    );
  }

  private handleRequestEvent(event: string): Observable<PebEditorWsRequestMessage> {
    return this.requestSubject$.pipe(
      filter(message => message?.event === event),
      tap(message => console.log('sandbox:ws:request', message)),
    );
  }

  private createWsMessage(event: string, id: string, params: any): PebEditorWsRequestMessage {
    return { event, data: { params, id, token: this.editorAuthTokenService.token } };
  }

  sendMessage(event: string, params: any): Promise<string> {
    const id = pebGenerateId();
    this.requestSubject$.next(this.createWsMessage(event, id, params));

    return Promise.resolve(id);
  }

  preInstallFinish(appId: string): Promise<string> {
    return this.sendMessage(PebEditorWsEvents.PreInstallFinished, {});
  }
}
