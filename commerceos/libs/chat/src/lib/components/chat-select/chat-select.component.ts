import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'pe-chat-select',
  styleUrls: ['./chat-select.component.scss'],
  templateUrl: './chat-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeChatSelectComponent {

  @Input() image: string;
  @Input() icon: string;
  @Input() label: string;

  @Output() clickLabel = new EventEmitter();
  @Output() clickArrow = new EventEmitter();

}
