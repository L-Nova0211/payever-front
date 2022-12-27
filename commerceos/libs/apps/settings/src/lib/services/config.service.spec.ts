import { TestBed } from '@angular/core/testing';

import * as settings from '../misc/constants/settings';

import { CoreConfigService } from './config.service';

describe('CoreConfigService', () => {
  let service: CoreConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoreConfigService],
    }).compileComponents();
  });

  beforeEach(() => {
    service = TestBed.get(CoreConfigService);
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should get CURRENCIES', () => {
    expect(service.CURRENCIES).toEqual(settings.CURRENCIES);
  });

  it('should get INDUSTRY_SECTORS', () => {
    expect(service.INDUSTRY_SECTORS).toEqual(settings.INDUSTRY_SECTORS);
  });

  it('should get LEGAL_FORMS', () => {
    expect(service.LEGAL_FORMS).toEqual(settings.LEGAL_FORMS);
  });

  it('should get EMPLOYEES', () => {
    expect(service.EMPLOYEES).toEqual(settings.EMPLOYEES);
  });

  it('should get SALES', () => {
    expect(service.SALES).toEqual(settings.SALES);
  });

  it('should get externalLinks', () => {
    expect(service.externalLinks).toEqual(settings.externalLinks);
  });

  it('should get getHelpLink', () => {
    expect(service.getHelpLink('test')).toEqual(settings.helpLink('test'));
  });

  it('should get EMAIL_NOTIFICATIONS_PERIODS', () => {
    expect(service.EMAIL_NOTIFICATIONS_PERIODS).toEqual(
      settings.EMAIL_NOTIFICATIONS_PERIODS
    );
  });

  it('should get APPS_NOTIFICATIONS_OPTIONS', () => {
    expect(service.APPS_NOTIFICATIONS_OPTIONS).toEqual(
      settings.APPS_NOTIFICATIONS_OPTIONS
    );
  });
});
