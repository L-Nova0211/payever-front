import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'widget-action-button',
  templateUrl: './widget-action-button.component.html',
  styleUrls: ['./widget-action-button.component.scss'],
})
export class WidgetActionButtonComponent {
  @Input() icon: string;
  @Input() iconSize = 24;
  @Input() title: string;
  @Input() loading: boolean;
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  constructor() {
  }
}
