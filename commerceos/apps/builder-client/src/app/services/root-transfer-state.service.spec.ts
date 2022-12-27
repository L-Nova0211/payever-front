import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { makeStateKey, TransferState } from '@angular/platform-browser';

import { RootTransferStateService } from './root-transfer-state.service';

describe('RootTransferStateService', () => {

  let service: RootTransferStateService;
  let transferState: jasmine.SpyObj<TransferState>;

  beforeEach(() => {

    const transferStateSpy = jasmine.createSpyObj<TransferState>('TransferState', ['set']);

    TestBed.configureTestingModule({
      providers: [
        RootTransferStateService,
        { provide: TransferState, useValue: transferStateSpy },
        { provide: 'PEB_ENV', useValue: 'env' },
        { provide: 'APP', useValue: 'shop' },
        { provide: 'THEME', useValue: 'theme' },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(RootTransferStateService);
    transferState = TestBed.inject(TransferState) as jasmine.SpyObj<TransferState>;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should set transfer state data', () => {

    // platform != server
    service.setTransferStateData();

    expect(transferState.set).not.toHaveBeenCalled();

    // platform = server
    service[`platformId`] = 'server';
    service.setTransferStateData();

    expect(transferState.set).toHaveBeenCalledTimes(3);
    expect(transferState.set).toHaveBeenCalledWith(makeStateKey('PEB_ENV'), 'env');
    expect(transferState.set).toHaveBeenCalledWith(makeStateKey('APP'), 'shop');
    expect(transferState.set).toHaveBeenCalledWith(makeStateKey('THEME'), 'theme');

  });

});
