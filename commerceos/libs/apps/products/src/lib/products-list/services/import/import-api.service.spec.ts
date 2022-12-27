import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EnvService, PE_ENV } from '@pe/common';

import { ImportApiService } from './import-api.service';

describe('ImportApiService', () => {
  let importApiService: ImportApiService;
  let httpTestingController: HttpTestingController;

  const peEnvMock = {
    backend: {
      productFiles: 'https://product-files-backend.test.devpayever.com',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ImportApiService, EnvService, { provide: PE_ENV, useValue: peEnvMock }],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    importApiService = TestBed.inject(ImportApiService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be defined', () => {
    expect(importApiService.importFromFile).toBeDefined();
    expect(importApiService).toBeDefined();
  });

  it('should return correct data from importFromFile', () => {
    importApiService.importFromFile('businessId', 'fileUrl').subscribe();
    httpTestingController.expectOne({ method: 'PUT' });
  });
});
