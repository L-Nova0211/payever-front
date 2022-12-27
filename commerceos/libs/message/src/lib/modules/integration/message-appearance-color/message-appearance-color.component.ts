import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'pe-message-appearance-color',
  templateUrl: './message-appearance-color.component.html',
  styleUrls: ['./message-appearance-color.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageAppearanceColorComponent {

  @Input() messagesBottomColor = '';
  @Input() accentColor = '';
  @Input() selected = false;
  @Input() addNewColorSet = false;

}
