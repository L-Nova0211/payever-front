
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { BackdropActionsEnum, MicroContainerTypeEnum } from '../enums/common.enum';
import { LoaderStateEnum } from '../enums/loader.enum';
import { DashboardEventEnum, EventEnum } from '../enums/platform-event.enum';
import { ProfileMenuEventInterface } from '../interfaces';

import { PlatformService } from './platform.service';

describe('PlatformService', () => {

  let platformService: PlatformService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        PlatformService,
      ],
    });

    platformService = TestBed.get(PlatformService);
  });

  it('backToCheckout$ should pass only DashboardEventEnum.CheckoutBack event target', () => {
    let count = 0;
    const subject = new Subject();
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(subject);

    platformService.backToCheckout$.subscribe(() => {
      count++;
    }, null, () => {
      expect(count).toBe(1);
    });

    let event = {
      target: DashboardEventEnum.CheckoutBack,
    };
    subject.next(event);

    event = {
      target: null,
    };
    subject.next(event);

    subject.complete();
  });

  it('backToDashboard$ should pass only DashboardEventEnum.DashboardBack event target', () => {
    let count = 0;
    const subject = new Subject();
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(subject);

    platformService.backToDashboard$.subscribe(() => {
      count++;
    }, null, () => {
      expect(count).toBe(1);
    });

    let event = {
      target: DashboardEventEnum.DashboardBack,
    };
    subject.next(event);

    event = {
      target: null,
    };
    subject.next(event);

    subject.complete();
  });

  it('backToSwitcher$ should pass only DashboardEventEnum.SwitcherBack event target', () => {
    let count = 0;
    const subject = new Subject();
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(subject);

    platformService.backToSwitcher$.subscribe(() => {
      count++;
    }, null, () => {
      expect(count).toBe(1);
    });

    let event = {
      target: DashboardEventEnum.SwitcherBack,
    };
    subject.next(event);

    event = {
      target: null,
    };
    subject.next(event);

    subject.complete();
  });

  it('blurryBackdrop$ should pass only DashboardEventEnum.BlurryBackdrop event target', () => {
    let count = 0;
    const subject = new Subject();
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(subject);

    platformService.blurryBackdrop$.subscribe((value: boolean) => {
      expect(value).toBeTruthy();
      count++;
    }, null, () => {
      expect(count).toBe(1);
    });

    let event = {
      target: DashboardEventEnum.BlurryBackdrop,
      action: BackdropActionsEnum.Show,
    };
    subject.next(event);

    event = {
      target: null,
      action: BackdropActionsEnum.Show,
    };
    subject.next(event);

    subject.complete();
  });

  it('localeChanged$ should pass only EventEnum.LocaleChanged event target', () => {
    let count = 0;
    const subject = new Subject();
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(subject);

    platformService.localeChanged$.subscribe(() => {
      count++;
    }, null, () => {
      expect(count).toBe(1);
    });

    let event = {
      target: EventEnum.LocaleChanged,
    };
    subject.next(event);

    event = {
      target: null,
    };
    subject.next(event);

    subject.complete();
  });

  it('microAppReady$ should pass only DashboardEventEnum.AppReady event target', () => {
    let count = 0;
    const subject = new Subject();
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(subject);
    const eventData = 'data';

    platformService.microAppReady$.subscribe((value: any) => {
      expect(value).toBe(eventData);
      count++;
    }, null, () => {
      expect(count).toBe(1);
    });

    let event = {
      target: DashboardEventEnum.AppReady,
      data: eventData,
    };
    subject.next(event);

    event = {
      target: null,
      data: eventData,
    };
    subject.next(event);

    subject.complete();
  });

  it('microContainerType$ should pass only DashboardEventEnum.MicroContainer event target', () => {
    let count = 0;
    const subject = new Subject();
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(subject);

    platformService.microContainerType$.subscribe((action: any) => {
      expect(action).toEqual(BackdropActionsEnum.Show);
      count++;
    }, null, () => {
      expect(count).toBe(1);
    });

    let event = {
      target: DashboardEventEnum.MicroContainer,
      action: BackdropActionsEnum.Show,
    };
    subject.next(event);

    event = {
      target: null,
      action: BackdropActionsEnum.Show,
    };
    subject.next(event);

    subject.complete();
  });

  it('microLoading$ should pass only DashboardEventEnum.MicroLoading event target', () => {
    let count = 0;
    const subject = new Subject();
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(subject);

    platformService.microLoading$.subscribe((action: any) => {
      expect(action).toEqual(BackdropActionsEnum.Show);
      count++;
    }, null, () => {
      expect(count).toBe(1);
    });

    let event = {
      target: DashboardEventEnum.MicroLoading,
      action: BackdropActionsEnum.Show,
    };
    subject.next(event);

    event = {
      target: null,
      action: BackdropActionsEnum.Show,
    };
    subject.next(event);

    subject.complete();
  });

  it('microNavigation$ should pass only DashboardEventEnum.MicroNavigation event target', () => {
    let count = 0;
    const subject = new Subject();
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(subject);
    const eventData = 'data';

    platformService.microNavigation$.subscribe((value: any) => {
      expect(value).toBe(eventData);
      count++;
    }, null, () => {
      expect(count).toBe(1);
    });

    let event = {
      target: DashboardEventEnum.MicroNavigation,
      data: eventData,
    };
    subject.next(event);

    event = {
      target: null,
      data: eventData,
    };
    subject.next(event);

    subject.complete();
  });

  it('submicroNavigation$ should pass only DashboardEventEnum.SubmicroNavigation event target', () => {
    let count = 0;
    const subject = new Subject();
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(subject);
    const eventData = 'data';

    platformService.submicroNavigation$.subscribe((value: any) => {
      expect(value).toBe(eventData);
      count++;
    }, null, () => {
      expect(count).toBe(1);
    });

    let event = {
      target: DashboardEventEnum.SubmicroNavigation,
      data: eventData,
    };
    subject.next(event);

    event = {
      target: null,
      data: eventData,
    };
    subject.next(event);

    subject.complete();
  });

  it('submicroClose$ should pass only DashboardEventEnum.SubmicroClose event target', () => {
    let count = 0;
    const subject = new Subject();
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(subject);

    platformService.submicroClose$.subscribe(() => {
      count++;
    }, null, () => {
      expect(count).toBe(1);
    });

    let event = {
      target: DashboardEventEnum.SubmicroClose,
    };
    subject.next(event);

    event = {
      target: null,
    };
    subject.next(event);

    subject.complete();
  });

  it('profileMenuChanged$ should pass only DashboardEventEnum.ProfileMenuChange event target', () => {
    let count = 0;
    const subject = new Subject();
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(subject);
    const eventData = 'data';

    platformService.profileMenuChanged$.subscribe((value: any) => {
      expect(value).toBe(eventData);
      count++;
    }, null, () => {
      expect(count).toBe(1);
    });

    let event = {
      target: DashboardEventEnum.ProfileMenuChange,
      data: eventData,
    };
    subject.next(event);

    event = {
      target: null,
      data: eventData,
    };
    subject.next(event);

    subject.complete();
  });

  it('blurryBackdrop should call dispatchEvent with params', () => {
    spyOn(platformService, 'dispatchEvent').and.stub();

    platformService.blurryBackdrop = true;

    expect(platformService.dispatchEvent).toHaveBeenCalledWith({
      target: DashboardEventEnum.BlurryBackdrop,
      action: BackdropActionsEnum.Show,
    });
  });

  it('microContainerType should call dispatchEvent with params', () => {
    spyOn(platformService, 'dispatchEvent').and.stub();
    const type = 'type' as MicroContainerTypeEnum;
    platformService.microContainerType = type;

    expect(platformService.dispatchEvent).toHaveBeenCalledWith({
      target: DashboardEventEnum.MicroContainer,
      action: type,
    });
  });

  it('microLoaded should call dispatchEvent with params', () => {
    spyOn(platformService, 'dispatchEvent').and.stub();

    platformService.microLoaded = true;

    expect(platformService.dispatchEvent).toHaveBeenCalledWith({
      target: DashboardEventEnum.MicroLoading,
      action: LoaderStateEnum.NoLoading,
    });
  });

  it('microAppReady should call dispatchEvent with params', () => {
    spyOn(platformService, 'dispatchEvent').and.stub();
    const name = 'name';
    platformService.microAppReady = name;

    expect(platformService.dispatchEvent).toHaveBeenCalledWith({
      target: DashboardEventEnum.AppReady,
      action: '',
      data: name,
    });
  });

  it('profileMenuChanged should call dispatchEvent with params', () => {
    spyOn(platformService, 'dispatchEvent').and.stub();
    const data = 'data' as ProfileMenuEventInterface;
    platformService.profileMenuChanged = data;

    expect(platformService.dispatchEvent).toHaveBeenCalledWith({
      target: DashboardEventEnum.ProfileMenuChange,
      action: '',
      data,
    });
  });

  it('backToDashboard should call dispatchEvent with params', () => {
    spyOn(platformService, 'dispatchEvent').and.stub();
    platformService.backToDashboard();

    expect(platformService.dispatchEvent).toHaveBeenCalledWith({
      target: DashboardEventEnum.DashboardBack,
      action: '',
    });
  });

  it('submicroNavigationForMicro$ should pass only DashboardEventEnum.SubmicroNavigation event target', (done) => {
    let count = 0;
    const subject = new Subject();
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(subject);
    const micro = 'micro';

    platformService.submicroNavigationForMicro$(micro).subscribe((data: any) => {
      expect(data).toEqual({
        rootMicro: micro,
      });
      count++;
    }, null, () => {
      expect(count).toBe(1);
      done();
    });

    let event = {
      target: DashboardEventEnum.SubmicroNavigation,
      data: {
        rootMicro: micro,
      },
    };
    subject.next(event);

    event = {
      target: null,
      data: {
        rootMicro: micro,
      },
    };
    subject.next(event);

    subject.complete();
  });
});
