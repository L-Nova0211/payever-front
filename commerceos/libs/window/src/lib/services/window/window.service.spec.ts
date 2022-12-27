import { EventEmitter } from 'events';

import { fakeAsync, flush } from '@angular/core/testing';

import { DeviceType } from '../../interfaces';

import { WindowService } from './window.service';

type FakeWindow = EventEmitter & {
  [key: string]: any;
};

interface ScrollCoordinates {
  x: number;
  y: number;
}

function fakeWindowFixture(
  width: number = 1280,
  height: number = 726,
): FakeWindow {
  return Object.assign(new EventEmitter(), {
    innerWidth: width,
    innerHeight: height,
    screen: {
      availLeft: 0,
      availTop: 0,
      availHeight: height,
      availWidth: width,
    },
    document: Object.assign(new EventEmitter(), {
      scrollingElement: {
        scrollHeight: window.document.scrollingElement.scrollHeight || 100,
        scrollLeft: window.document.scrollingElement.scrollLeft || 100,
        scrollTop: window.document.scrollingElement.scrollTop || 100,
        scrollWidth: window.document.scrollingElement.scrollWidth || 100,
      },
    }),
    scrollTo(this: EventEmitter, x: number, y: number): void {
      const evt: ScrollCoordinates = { x, y };
      // tslint:disable-next-line no-invalid-this
      this.emit('scroll', evt);
    },
  });
}

describe('WindowService', () => {
  let service: WindowService;
  let fakeWindow: FakeWindow;

  const desktopWidth = 1280;

  beforeEach(() => {
    fakeWindow = fakeWindowFixture(desktopWidth);
    service = new WindowService(fakeWindow as any, null, DeviceType.Desktop);
  });

  it('should initialize service', () => {
    expect(service).toBeTruthy();
  });

  it('should provide values from given Window object', fakeAsync(() => {
    service.height$.subscribe(val => expect(val).toBe(fakeWindow.innerHeight), fail);
    service.width$.subscribe(val => expect(val).toBe(fakeWindow.innerWidth), fail);
    service.availHeight$.subscribe(val => expect(val).toBe(fakeWindow.screen.availHeight), fail);
    service.availWidth$.subscribe(val => expect(val).toBe(fakeWindow.screen.availWidth), fail);
    service.availLeft$.subscribe(val => expect(val).toBe(fakeWindow.screen.availLeft), fail);
    service.availTop$.subscribe(val => expect(val).toBe(fakeWindow.screen.availTop), fail);
    service.scrollHeight$.subscribe(val => expect(val).toBe(fakeWindow.document.scrollingElement.scrollHeight), fail);
    service.scrollLeft$.subscribe(val => expect(val).toBe(fakeWindow.document.scrollingElement.scrollLeft), fail);
    service.scrollTop$.subscribe(val => expect(val).toBe(fakeWindow.document.scrollingElement.scrollTop), fail);
    service.scrollWidth$.subscribe(val => expect(val).toBe(fakeWindow.document.scrollingElement.scrollWidth), fail);

    let flushed = false;
    expect(flushed).toBe(false, 'self-check');
    service.height$.subscribe(() => flushed = true, fail);
    expect(flushed).toBe(true, 'self-check');
  }));

  it('should scrollTop on window', () => {
    let emitted: ScrollCoordinates;
    fakeWindow.once('scroll', (evt: ScrollCoordinates) => {
      emitted = evt;
    });
    const x = 100;
    service.scrollTop = x;
    expect(emitted).toBeDefined();
    expect(emitted.x).toBe(x);
    expect(emitted.y).toBe(0);
  });

  it('should catch message event', fakeAsync(() => {
    let message: any;
    const initialMessage = '[test-initial-message]';
    const newMessage = '[test-new-message]';

    message = initialMessage;
    service.messageEvent$.subscribe(
      evt => message = evt,
      fail
    );
    expect(message).not.toBe(initialMessage);
    expect(message).not.toBe(newMessage, 'self-test');

    fakeWindow.emit('message', newMessage);
    expect(message).toBe(newMessage);

    // check last subscriber
    let lastMessage: any;
    service.messageEvent$.subscribe(
      evt => lastMessage = evt,
      fail
    );
    expect(lastMessage).toBe(newMessage);

    flush();
  }));

  it('should catch document click event', fakeAsync(() => {
    let clickEvent: any;
    const initialClickEvent: MouseEvent = new MouseEvent('click');
    const newClickEvent: MouseEvent = new MouseEvent('click');

    clickEvent = initialClickEvent;
    service.documentClickEvent$.subscribe(
      evt => clickEvent = evt,
      fail
    );
    expect(clickEvent).not.toBe(initialClickEvent);
    expect(clickEvent).not.toBe(newClickEvent, 'self-test');

    fakeWindow.document.emit('click', newClickEvent);
    expect(clickEvent).toBe(newClickEvent);

    // check last subscriber
    let lastClickEvent: any;
    service.documentClickEvent$.subscribe(
      evt => lastClickEvent = evt,
      fail
    );
    expect(lastClickEvent).toBe(newClickEvent);

    flush();
  }));

  describe('several device types', () => {
    it('should be DeviceType.DesktopLg by default', () => {
      let deviceType: DeviceType;
      service.deviceType$.subscribe(dType => deviceType = dType, fail);
      expect(fakeWindow.innerWidth).toBeGreaterThanOrEqual(1280, 'self-test');
      expect(deviceType).toBe(DeviceType.DesktopLg);
    });

    it(`check "Mobile" device detection with width "360px"`, fakeAsync(async () => {
      let deviceType: DeviceType;
      service.deviceType$.subscribe(val => deviceType = val, fail);

      let flag: boolean;
      service.isMobile$.subscribe(val => flag = val, fail);

      fakeWindow.innerWidth = 360;
      fakeWindow.emit('resize');
      expect(flag).toBe(true);
      expect(deviceType).toBe(DeviceType.Mobile);
    }));

    it(`check "Tablet" device detection with width "760px"`, fakeAsync(() => {
      let deviceType: DeviceType;
      service.deviceType$.subscribe(val => deviceType = val, fail);

      let flag: boolean;
      service.isTablet$.subscribe(val => flag = val, fail);

      fakeWindow.innerWidth = 760;
      fakeWindow.emit('resize');
      expect(flag).toBe(true);
      expect(deviceType).toBe(DeviceType.Tablet);
    }));

    it(`check "Desktop" device detection with width "1024px"`, fakeAsync(() => {
      let deviceType: DeviceType;
      service.deviceType$.subscribe(val => deviceType = val, fail);

      let flag: boolean;
      service.isDesktop$.subscribe(val => flag = val, fail);

      fakeWindow.innerWidth = 1024;
      fakeWindow.emit('resize');
      expect(flag).toBe(true);
      expect(deviceType).toBe(DeviceType.Desktop);
    }));

    it(`check "DesktopLg" device detection with width "1280px"`, fakeAsync(() => {
      let deviceType: DeviceType;
      service.deviceType$.subscribe(val => deviceType = val, fail);

      let flag: boolean;
      service.isDesktopLg$.subscribe(val => flag = val, fail);

      fakeWindow.innerWidth = 1280;
      fakeWindow.emit('resize');
      expect(flag).toBe(true);
      expect(deviceType).toBe(DeviceType.DesktopLg);
    }));

    it(`check "DesktopLg" device detection with width "1920px"`, fakeAsync(() => {
      let deviceType: DeviceType;
      service.deviceType$.subscribe(val => deviceType = val, fail);

      let flag: boolean;
      service.isDesktopLg$.subscribe(val => flag = val, fail);

      fakeWindow.innerWidth = 1920;
      fakeWindow.emit('resize');
      expect(flag).toBe(true);
      expect(deviceType).toBe(DeviceType.DesktopLg);
    }));
  });
});
