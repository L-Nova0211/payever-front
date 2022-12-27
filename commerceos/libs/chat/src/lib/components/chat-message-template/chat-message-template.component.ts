import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'pe-chat-message-template',
  styleUrls: ['./chat-message-template.component.scss'],
  templateUrl: './chat-message-template.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeChatMessageTemplateComponent {

  @Input() components: any;

  @Output() action = new EventEmitter<any>();

  templateActivate(event: any, parameter: any): void {
    if (parameter.image.provider) {
      event.preventDefault();

      this.action.emit({
        provider: parameter.image.provider.name,
        code: parameter.action,
      });
    }
  }
}