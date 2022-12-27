import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable()
export class PeMessageTrackerService {
  private newMessageTrackerSubject = new Subject<void>();

  newMessageTracker$ = this.newMessageTrackerSubject.asObservable();

  newMessageTracker() {
    this.newMessageTrackerSubject.next();
  }
}
