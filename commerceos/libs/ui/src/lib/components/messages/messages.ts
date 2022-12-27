import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'peb-messages',
  templateUrl: './messages.html',
  styleUrls: ['./messages.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebMessagesComponent {
  /** Sets message */
  @Input() message;
  /** Sets message color */
  @Input() color = 'warning';
  /** Show/hide icon */
  @Input() showIcon = true;
}
