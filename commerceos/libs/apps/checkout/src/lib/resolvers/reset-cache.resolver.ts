import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { StorageService } from '../services/storage.service';

@Injectable()
export class ResetCacheResolver implements Resolve<void> {

  constructor(
    private storageService: StorageService
  ) {
  }

  resolve(): void {
    this.storageService.resetCache();
  }

}
