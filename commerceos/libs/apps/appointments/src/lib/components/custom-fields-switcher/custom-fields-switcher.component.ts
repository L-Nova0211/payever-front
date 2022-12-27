import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

import { PeAppointmentsFieldTypesEnum } from '../../enums';
import { FieldDto } from '../../interfaces';

@Component({
  selector: 'pe-custom-fields-switcher',
  templateUrl: './custom-fields-switcher.component.html',
  styleUrls: ['./custom-fields-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeAppointmentsCutomFieldsSwitcherComponent {

  @HostBinding('class.pe-appointments-custom-fields-switcher') peCutomFieldsSwitcher = true;

  @Input() field!: FieldDto;
  @Input() animated = true;

  @Output() edit = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  public fieldTypesEnum = PeAppointmentsFieldTypesEnum;

  public autoTextareaGrow(textarea): void {
    textarea.style.height = '44px';
    textarea.style.height = (textarea.scrollHeight)+'px';
  }

  public editField(): void {
    this.edit.emit();
  }

  public removeField(): void {
    this.remove.emit();
  }
}
