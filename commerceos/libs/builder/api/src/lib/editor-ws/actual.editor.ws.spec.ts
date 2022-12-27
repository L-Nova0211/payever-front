import { discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { isEmpty } from 'rxjs/operators';
import * as rxjsWebSocket from 'rxjs/webSocket';

import { PebEnvService } from '@pe/builder-core';
import * as pebCore from '@pe/builder-core';

import { PebEditorAuthTokenService } from '../token';

import { PEB_EDITOR_WS_PATH, PebActualEditorWs } from './actual.editor.ws';
import { PebEditorWsEvents } from './editor.ws.constants';

describe('PebActualEditorWs', () => {

  let api: PebActualEditorWs;
  let generateIdSpy: jasmine.Spy;

  const editorWsPath = 'editor/ws';
  const shopId = 'shop-001';

  beforeAll(() => {

    Object.defineProperty(rxjsWebSocket, 'webSocket', {
      value: rxjsWebSocket.webSocket,
      writable: true,
    });

    Object.defineProperty(pebCore, 'pebGenerateId', {
      value: pebCore.pebGenerateId,
      writable: true,
    });

  });

  beforeEach(() => {

    generateIdSpy = spyOn(pebCore, 'pebGenerateId').and.returnValue('gid-001');

    const editorAuthTokenService = {
      token: 'token',
    };

    const envServiceMock = { shopId };

    TestBed.configureTestingModule({
      providers: [
        PebActualEditorWs,
        { provide: PEB_EDITOR_WS_PATH, useValue: editorWsPath },
        { provide: PebEditorAuthTokenService, useValue: editorAuthTokenService },
        { provide: pebCore.PebEnvService, useValue: envServiceMock },
      ],
    });

    api = TestBed.inject(PebActualEditorWs);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should handle destroy', () => {

    const spy = spyOn(api, 'close');

    api.ngOnDestroy();

    expect(spy).toHaveBeenCalled();

  });

  it('should connect', fakeAsync(() => {

    const logSpy = spyOn(console, 'log');
    const messagesNextSpy = spyOn(api.messages$, 'next');
    const socketSubjectMock = new Subject();
    const webSocketSpy = spyOn(rxjsWebSocket, 'webSocket').and.returnValue(socketSubjectMock as any);

    /**
     * api.socketSubject$ is set but not closed
     */
    api[`socketSubject$`] = new Subject() as any;
    api.connect();

    expect(webSocketSpy).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
    expect(messagesNextSpy).not.toHaveBeenCalled();

    /**
     * api.socketSubject$ is null
     */
    messagesNextSpy.and.throwError('test error');

    api[`socketSubject$`] = null;
    api.connect();

    tick(api[`pingInterval`] + api[`reconnectDelay`]);
    discardPeriodicTasks();

    expect(webSocketSpy).toHaveBeenCalledWith({
      url: editorWsPath,
    });
    expect(messagesNextSpy).toHaveBeenCalledWith('ping' as any);
    expect(logSpy).toHaveBeenCalledWith('retry');

  }));

  it('should close', () => {

    const nextSpy = spyOn(api[`close$`], 'next');
    const socketSubjectMock = {
      complete: jasmine.createSpy('complete'),
      closed: null as boolean,
    };

    api[`socketSubject$`] = socketSubjectMock as any;
    api.close();

    expect(nextSpy).toHaveBeenCalled();
    expect(socketSubjectMock.complete).toHaveBeenCalled();
    expect(socketSubjectMock.closed).toBe(true);

  });

  it('should handle event', () => {

    const messageMock = new BehaviorSubject(null);
    const event = {
      name: 'test',
      result: 'test.result',
    };

    /**
     * api.message$ is null
     */
    api[`messages$` as any] = null;
    api.on(null).pipe(isEmpty()).subscribe(empty => expect(empty).toBe(true));

    /**
     * api.message$ is set
     * api.message$ emits null
     */
    api[`messages$` as any] = messageMock;
    api.on('test').subscribe(result => expect(result).toEqual(event));

    messageMock.next(event);

  });

  it('should create message', () => {

    const event = 'test.event';
    const id = 'test.id';
    const params = { test: 'params' };

    expect(api[`createWsMessage`](event, id, params)).toEqual({
      event,
      data: {
        params,
        id,
        token: 'token',
      },
    });

  });

  it('should get shape albums', async () => {

    const createSpy = spyOn<any>(api, 'createWsMessage').and.callThrough();
    const socketMock = {
      next: jasmine.createSpy('next'),
    };
    const argumentMock = {
      parent: 'test.parent',
      type: 'test.type',
      pagination: {
        offset: 10,
        limit: 5,
      },
    };

    /**
     * argument is {} as default
     */
    api[`socketSubject$`] = socketMock as any;
    api.getShapeAlbums();

    expect(createSpy).toHaveBeenCalledWith(PebEditorWsEvents.GetShapeAlbum, 'gid-001', {
      pagination: {
        limit: 100,
        offset: 0,
      },
      applicationId: shopId,
    });
    expect(socketMock.next).toHaveBeenCalledWith({
      event: PebEditorWsEvents.GetShapeAlbum,
      data: {
        params: {
          pagination: {
            limit: 100,
            offset: 0,
          },
          applicationId: shopId,
        },
        id: 'gid-001',
        token: 'token',
      },
    });
    expect(generateIdSpy).toHaveBeenCalled();

    /**
     * argument is set
     */
    generateIdSpy.calls.reset();

    api[`socketSubject$`] = socketMock as any;
    const id = await api.getShapeAlbums(argumentMock);

    expect(createSpy).toHaveBeenCalledWith(PebEditorWsEvents.GetShapeAlbum, id, {
      pagination: argumentMock.pagination,
      parent: argumentMock.parent,
      type: argumentMock.type,
      applicationId: shopId,
    });
    expect(socketMock.next).toHaveBeenCalledWith({
      event: PebEditorWsEvents.GetShapeAlbum,
      data: {
        params: {
          pagination: argumentMock.pagination,
          parent: argumentMock.parent,
          type: argumentMock.type,
          applicationId: shopId,
        },
        id: 'id-001',
        token: 'token',
      },
    });
    expect(generateIdSpy).not.toHaveBeenCalled();

  });

  it('should get shapes', async () => {

    const createSpy = spyOn<any>(api, 'createWsMessage').and.callThrough();
    const socketMock = {
      next: jasmine.createSpy('next'),
    };
    const argumentMock = {
      id: 'id-001',
      album: 'test.album',
      type: 'test.type',
      pagination: {
        offset: 10,
        limit: 5,
      },
    };

    /**
     * argument is {} as default
     * envService.applicationId is null
     */
    api[`socketSubject$`] = socketMock as any;
    api.getShapes();

    expect(createSpy).toHaveBeenCalledWith(PebEditorWsEvents.GetShape, 'gid-001', {
      pagination: {
        limit: 100,
        offset: 0,
      },
      applicationId: shopId,
    });
    expect(socketMock.next).toHaveBeenCalledWith({
      event: PebEditorWsEvents.GetShape,
      data: {
        params: {
          pagination: {
            limit: 100,
            offset: 0,
          },
          applicationId: shopId,
        },
        id: 'gid-001',
        token: 'token',
      },
    });
    expect(generateIdSpy).toHaveBeenCalled();

    /**
     * argument is set
     * envService.applicationId is set
     */
    generateIdSpy.calls.reset();

    api[`envService`].applicationId = 'app-001';
    api[`socketSubject$`] = socketMock as any;
    const id = await api.getShapes(argumentMock);

    expect(createSpy).toHaveBeenCalledWith(PebEditorWsEvents.GetShape, id, {
      pagination: argumentMock.pagination,
      album: argumentMock.album,
      type: argumentMock.type,
      applicationId: 'app-001',
    });
    expect(socketMock.next).toHaveBeenCalledWith({
      event: PebEditorWsEvents.GetShape,
      data: {
        params: {
          pagination: argumentMock.pagination,
          album: argumentMock.album,
          type: argumentMock.type,
          applicationId: 'app-001',
        },
        id: 'id-001',
        token: 'token',
      },
    });
    expect(generateIdSpy).not.toHaveBeenCalled();

  });

  it('should add action', () => {

    const createSpy = spyOn<any>(api, 'createWsMessage').and.callThrough();
    const socketMock = {
      next: jasmine.createSpy('next'),
    };
    const paramsMock = {
      themeId: 't-001',
      action: 'test.action' as any,
    };

    api[`socketSubject$` as any] = socketMock;
    const id = api.addAction(paramsMock);

    expect(createSpy).toHaveBeenCalledWith(PebEditorWsEvents.AddAction, id, paramsMock);
    expect(socketMock.next).toHaveBeenCalledWith({
      event: PebEditorWsEvents.AddAction,
      data: {
        params: paramsMock,
        id: 'gid-001',
        token: 'token',
      },
    });
    expect(generateIdSpy).toHaveBeenCalled();

  });

  it('should publish', () => {

    const createSpy = spyOn<any>(api, 'createWsMessage').and.callThrough();
    const socketMock = {
      next: jasmine.createSpy('next'),
    };
    const paramsMock = { themeId: 't-001' };

    api[`socketSubject$` as any] = socketMock;
    const id = api.publish(paramsMock);

    expect(createSpy).toHaveBeenCalledWith(PebEditorWsEvents.Publish, id, paramsMock);
    expect(socketMock.next).toHaveBeenCalledWith({
      event: PebEditorWsEvents.Publish,
      data: {
        id,
        params: paramsMock,
        token: 'token',
      },
    });
    expect(generateIdSpy).toHaveBeenCalled();

  });

});
