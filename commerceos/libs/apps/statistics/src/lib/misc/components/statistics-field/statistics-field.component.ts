import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'peb-statistics-field',
  templateUrl: './statistics-field.component.html',
  styleUrls: ['./statistics-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsFieldComponent {
  /** Statistics field title */
  @Input() title;

  /** Statistics field id */
  @Input() id: number;

  /** Shows options selected */
  @Input() optionsSelected: any;

  /** Shows error message */
  @Input() errorMessage: string;

  /** Opens form field edit */
  @Input() openFieldFunc: (id: number, readonly: boolean) => void;

  /** Whether is readonly */
  @Input() readonly = false;
}
