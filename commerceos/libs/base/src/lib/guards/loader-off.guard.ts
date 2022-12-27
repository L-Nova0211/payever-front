import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { LoaderService } from '../services/loader.service';

@Injectable()
export class LoaderOffGuard implements CanActivate {

  constructor(private loaderService: LoaderService) {}

  canActivate(): boolean {
    this.loaderService.hideLoader();

    return true;
  }
}
