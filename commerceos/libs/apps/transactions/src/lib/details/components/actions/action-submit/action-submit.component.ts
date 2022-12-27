import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'pe-action-submit',
  templateUrl: 'action-submit.component.html',
  styleUrls: ['./action-submit.component.scss'],
})
export class ActionSubmitComponent {

  @Input() label: string;
  @Input() isLoading: boolean;
  @Output() clicked: EventEmitter<void> = new EventEmitter<void>();
}
