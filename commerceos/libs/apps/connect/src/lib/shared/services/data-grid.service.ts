import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class DataGridService {

  chooseFiltersEmit = new EventEmitter();
  gridItems$: BehaviorSubject<any> = new BehaviorSubject(null);

}
