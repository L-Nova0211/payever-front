import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class EventService {
  private editEventSubject$ = new BehaviorSubject(null);
  editEvent$ = this.editEventSubject$.asObservable();

  set editEvent(data) {
    this.editEventSubject$.next(data);
  }
}
