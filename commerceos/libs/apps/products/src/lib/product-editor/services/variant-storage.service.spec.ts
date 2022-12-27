import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';

import { VariantStorageService } from './variant-storage.service';

describe('VariantStorageService', () => {
  let service: VariantStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VariantStorageService, FormBuilder],
    });

    service = TestBed.inject(VariantStorageService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });
});
