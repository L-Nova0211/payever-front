import { Inject, Injectable, Optional } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const initialStore = {
  app: null,
  theme: null,
};

@Injectable({
  providedIn: 'root',
})
export class PebClientStoreService {
  private readonly appSubject$ = new BehaviorSubject(this.appInitial ?? null);
  readonly app$ = this.appSubject$.asObservable();

  get app() {
    return this.appSubject$.getValue();
  }

  set app(value) {
    this.appSubject$.next(value);
  }

  get channelSetId() {
    return this.app.channelSet || this.app.channelSetId;
  }

  private readonly themeSubject$ = new BehaviorSubject(this.themeInitial ?? null);
  readonly theme$ = this.themeSubject$.asObservable();

  get theme() {
    return this.themeSubject$.getValue();
  }

  set theme(value) {
    this.themeSubject$.next(value);
  }

  constructor(
    @Optional() @Inject('APP') private readonly appInitial: any,
    @Optional() @Inject('THEME') private readonly themeInitial: any,
  ) {
  }

  reset(): void {
    this.app = initialStore.app;
    this.theme = initialStore.theme;
  }
}
