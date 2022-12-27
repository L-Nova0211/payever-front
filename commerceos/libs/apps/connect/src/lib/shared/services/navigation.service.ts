import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStorageService } from 'ngx-webstorage';

@Injectable()
export class NavigationService {

  readonly key: string = 'connect-integration-return';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private sessionStorageService: SessionStorageService
  ) {}

  saveReturn(url: string): void {
    const urlsArray = JSON.parse(this.sessionStorageService.retrieve(this.key)) || [];
    urlsArray.push(url);
    this.sessionStorageService.store(this.key, JSON.stringify(urlsArray));
  }

  returnBack(): void {
    let url = '/';
    const urlsArray = JSON.parse(this.sessionStorageService.retrieve(this.key));
    if (urlsArray && urlsArray.length) {
      url = urlsArray.pop();
      this.sessionStorageService.store(this.key, JSON.stringify(urlsArray));
    }

    this.router.navigate([url]);
  }

  getReturnUrl() {
    const urlsArray = JSON.parse(this.sessionStorageService.retrieve(this.key));
    if (urlsArray && urlsArray.length) {
      return urlsArray.pop();
    } else {
      return null;
    }
  }

  resetReturnUrl() {
    this.sessionStorageService.store(this.key, JSON.stringify([]));
  }
}
