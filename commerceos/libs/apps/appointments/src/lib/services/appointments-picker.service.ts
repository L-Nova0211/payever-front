import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class PeAppointmentsPickerService {
  public readonly changeSaveStatus$ = new Subject<boolean>();
}
