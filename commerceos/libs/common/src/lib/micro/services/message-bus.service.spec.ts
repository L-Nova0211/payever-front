import * as acore from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MessageBusService } from './message-bus.service';
import { WindowEventsService } from './window-events.service';

describe('MessageBusService', () => {

  let service: MessageBusService;
  let windowEventsService: jasmine.SpyObj<WindowEventsService>;

  beforeEach(() => {

    const windowEventsServiceSpy = jasmine.createSpyObj<WindowEventsService>('WindowEventsService', ['message$']);

    TestBed.configureTestingModule({
      providers: [
        MessageBusService,
        { provide: WindowEventsService, useValue: windowEventsServiceSpy },
      ],
    });

    service = TestBed.inject(MessageBusService);
    windowEventsService = TestBed.inject(WindowEventsService) as jasmine.SpyObj<WindowEventsService>;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should send message', () => {

    const postSpy = spyOn(window, 'postMessage');

    /**
     * there is no data in message string
     * argument allowOrigins is FALSE as default
     */
    service.send(window, 'channel', 'event');

    expect(postSpy).toHaveBeenCalledWith('pe:os:channel:event', window.location.origin);

    /**
     * data exists in message string
     * typeof data is string
     * argument allowOrigins is TRUE
     */
    service.send(window, 'channel', 'event', 'data', true);

    expect(postSpy).toHaveBeenCalledWith('pe:os:channel:event:data', '*');

    /**
     * typeof data in message string is object
     */
    service.send(window, 'channel', 'event', { test: true }, true);

    expect(postSpy).toHaveBeenCalledWith(`pe:os:channel:event:${JSON.stringify({ test: true })}`, '*');

  });

  it('should observe', () => {

    const messageMock = {
      channel: 'channel',
      event: 'event',
    };
    spyOn<any>(service, 'parseMessage').and.returnValue(messageMock);

    windowEventsService.message$.and.returnValue(of({ test: true }));

    /**
     * arguments channel & event for observe function are both null
     */
    service.observe().subscribe(message => expect(message).toEqual(messageMock));

    /**
     * arguments channel & event for observe function are set and not null
     */
    service.observe('channel', 'evenet').subscribe(message => expect(message).toEqual(messageMock));

  });

  it('should parse message', () => {

    const eventMock = {
      data: null,
    };
    const warnSpy = spyOn(console, 'warn');

    Object.defineProperty(acore, 'isDevMode', {
      value: acore.isDevMode,
      writable: true,
    });
    const devSpy = spyOn(acore, 'isDevMode');

    /**
     * typeof event.data is not string
     * dev mode is FALSE
     */
    devSpy.and.returnValue(false);

    expect(service[`parseMessage`](eventMock)).toBeUndefined();
    expect(warnSpy).not.toHaveBeenCalled();

    /**
     * dev mode is TRUE
     */
    devSpy.and.returnValue(true);

    expect(service[`parseMessage`](eventMock)).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();

    /**
     * typeof event.data is string and is INVALID
     * dev mode is FALSE
     */
    warnSpy.calls.reset();

    devSpy.and.returnValue(false);
    eventMock.data = 'test';

    expect(service[`parseMessage`](eventMock)).toBeNull();
    expect(warnSpy).not.toHaveBeenCalled();

    /**
     * dev mode is TRUE
     */
    devSpy.and.returnValue(true);

    expect(service[`parseMessage`](eventMock)).toBeNull();
    expect(warnSpy).toHaveBeenCalled();

    /**
     * event.data is VALID
     * raw data is null
     */
    eventMock.data = 'pe:os:channel:event';

    expect(service[`parseMessage`](eventMock)).toEqual({
      channel: 'channel',
      event: 'event',
      data: undefined,
    });

    /**
     * raw data is defined
     */
    eventMock.data += ':test';

    expect(service[`parseMessage`](eventMock)).toEqual({
      channel: 'channel',
      event: 'event',
      data: 'test',
    });

  });

});
