import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { AbstractComponent } from '../../../shared';

@Component({
  selector: 'connect-list-layout',
  templateUrl: './list-layout.component.html',
  styleUrls: ['../modals/modals.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListLayoutComponent extends AbstractComponent implements OnInit {

  dataLoaded = false;

  constructor() {
    super();
  }

  ngOnInit(): void {
    /*
    this.platformService.microAppReady = 'connect';
    this.router.events.pipe(
      takeUntil(this.destroyed$),
      filter((event: any) => event instanceof NavigationStart),
      tap((event: NavigationStart) => {
        if (event.url.endsWith('info/dashboard')) {
          this.platformService.dispatchEvent({
            target: 'dashboard-back',
            action: ''
          });
        }
      })
    ).subscribe();
    */
  }
}
