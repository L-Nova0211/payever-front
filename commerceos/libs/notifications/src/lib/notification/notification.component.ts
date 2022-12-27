import { Component, EventEmitter, HostListener, Input, OnInit, Output, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessState } from '@pe/business';
import { TranslatePipe } from '@pe/i18n';

import { notificationConfig } from '../notification.config';

@Component({
  selector: 'pe-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
  @SelectSnapshot(BusinessState.businessUuid) businessUuid;

  @Output() hide = new EventEmitter();

  @Input() set notification(value) {
    this.#notification = value;
    const { message } = value;
    this.#message = this.translatePipe.transform(
      message.replace('notification', 'info_boxes.notifications.messages'),
    );
  }

  get notification() {
    return this.#notification;
  }

  get message() {
    return this.#message;
  }

  get icon(): string {
    return  this.#notification.icon;
  }

  get link(): SafeUrl {
    return this.sanitizer.sanitize(
      SecurityContext.URL,
      `/business/${this.businessUuid}/${notificationConfig[this.#notification.message]?.routerLink.replace(
        '{id}',
        this.notification.entity,
      )}`,
    );
  }

  hovered = false;

  #notification: any;
  #message: string;

  constructor(private translatePipe: TranslatePipe, private sanitizer: DomSanitizer) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.hovered = true;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hovered = false;
  }

  ngOnInit(): void {
    /** Remove hovered state because virtual scroll reuses components */
    this.hovered = false;
  }
}
