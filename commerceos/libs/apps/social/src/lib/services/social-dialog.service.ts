import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class PeSocialDialogService {
  public readonly closeAfterAction$ = new Subject<boolean>();
}
