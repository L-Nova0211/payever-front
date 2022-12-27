import { TestBed } from '@angular/core/testing';

import { OwnerTypesEnum } from '../misc/enum';

import { BusinessEnvService } from './env.service';

describe('EnvService', () => {
  let service: BusinessEnvService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BusinessEnvService],
    });
  });

  beforeEach(() => {
    service = TestBed.get(BusinessEnvService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should get and set businessUuid', () => {
    service.businessUuid = 'test';
    expect(service.businessUuid).toEqual('test');
  });

  it('should get and set userUuid', () => {
    service.userUuid = 'test';
    expect(service.userUuid).toEqual('test');
  });

  it('should get and set ownerType', () => {
    service.ownerType = OwnerTypesEnum.Business;
    expect(service.ownerType).toEqual(OwnerTypesEnum.Business);
  });
});
