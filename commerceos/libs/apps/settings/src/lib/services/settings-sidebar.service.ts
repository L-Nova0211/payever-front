import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SettingsSidebarService {
  private readonly state$ = new Subject<void>();

  constructor() { }

  toggleSettingsSidebar() {
    this.state$.next();
  }

  getHeaderStateObservable$(): Observable<void> {
    return this.state$.asObservable();
  }
}
