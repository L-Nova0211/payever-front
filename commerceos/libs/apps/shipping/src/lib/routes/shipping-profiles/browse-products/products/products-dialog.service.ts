import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ProductsDialogService {
  selectedProducts = [];
  private saveStatusSubject = new BehaviorSubject(null);
  currentStatus = this.saveStatusSubject.asObservable();

  changeSaveStatus(isSaved: boolean | null) {
    this.saveStatusSubject.next(isSaved);
  }
}
