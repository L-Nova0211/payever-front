import { Component, OnInit } from '@angular/core';

import { MessageBus } from '@pe/common';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'marketing-app',
  templateUrl: './marketing-app.component.html',
})
export class MarketingAppComponent implements OnInit {
  constructor(private messageBus: MessageBus) {}


  ngOnInit(): void {
    this.messageBus.emit('checkout.navigate-to-app', 'marketing');
  }
}
