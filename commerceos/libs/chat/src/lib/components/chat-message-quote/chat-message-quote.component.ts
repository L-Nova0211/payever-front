import { ChangeDetectionStrategy, Component, Input } from '@angular/core';


@Component({
  selector: 'pe-chat-message-quote',
  styleUrls: ['./chat-message-quote.component.scss'],
  templateUrl: './chat-message-quote.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeChatMessageQuoteComponent {

  @Input() message: string;
  @Input() sender: string;
  @Input() date: Date;
  @Input() dateFormat = 'shortTime';
  @Input() quote: string;

}
