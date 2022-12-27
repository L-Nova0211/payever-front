import { Component, Injector, OnInit } from '@angular/core';

import { MessageBus } from '@pe/common';

import { BaseListComponent } from '../../../shared';

/** @deprecated TODO Remove when CAF-95 and PSF-57 released **/
@Component({
  template: '',
})
export class BackToMicroComponent extends BaseListComponent implements OnInit {

  micro: string;
  category: string;
  entityUuid: string;
  microPath: string;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.micro = this.clearString(this.activatedRoute.snapshot.params['micro']);
    this.category = this.clearString(this.activatedRoute.snapshot.params['category']);
    this.entityUuid = this.activatedRoute.snapshot.params['entityUuid'];
    this.microPath = this.activatedRoute.snapshot.params['microPath'];
    this.onClose();
  }

  onClose(): void {
    let microPath: string;
    if (this.microPath) {
      microPath = decodeURIComponent(this.microPath);
    } else if (this.category && this.entityUuid) {
      microPath = `${this.entityUuid}/panel-${this.category}`;
    }
    /*
    this.platformService.dispatchEvent({
      target: 'dashboard-micro-navigation',
      action: '',
      data: microPath ? `${this.micro}/${microPath}` : this.micro
    });*/
    const messageBus: MessageBus = this.injector.get(MessageBus);
    messageBus.emit('connect.navigate-to-app', microPath ? `${this.micro}/${microPath}` : this.micro);
  }

  saveReturn(): void {
    return;
  }
}
