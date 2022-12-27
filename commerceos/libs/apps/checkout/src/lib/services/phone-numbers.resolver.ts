import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';

import { ApiService } from '../services/api.service';
import { EnvService } from '../services/env.service';
import { StorageService } from '../services/storage.service';

@Injectable()
export class PhoneNumbersResolver implements Resolve<string[]> {

  constructor(private apiService: ApiService,
              private envService: EnvService,
              private storageService: StorageService) {
  }

  resolve(): Observable<string[]> {
    return this.storageService.fetchPhoneNumbers();
  }
}
