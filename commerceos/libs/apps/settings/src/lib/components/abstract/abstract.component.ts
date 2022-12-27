import { Component, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Component({
  template: '',
})

export abstract class AbstractComponent implements OnDestroy {

  protected destroyed$ = new ReplaySubject<boolean>();

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
