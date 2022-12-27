import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ActionModel } from '../models/rules.model';

@Injectable({
  providedIn: 'root',
})

export class RuleObservableService {
  private ruleSubject$ = new BehaviorSubject<ActionModel>(null);
  rule$ = this.ruleSubject$.asObservable();

  private actionsSubject$ = new BehaviorSubject(null);
  actions$ = this.actionsSubject$.asObservable();

  get rule(): ActionModel {
    return this.ruleSubject$.getValue();
  }

  set rule(value: ActionModel) {
    this.ruleSubject$.next(value);
  }

  get actions() {
    return this.actionsSubject$.getValue();
  }

  set actions(value: any) {
    this.actionsSubject$.next(value);
  }
}
