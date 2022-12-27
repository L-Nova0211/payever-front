import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'editor-dynamic-field',
  styles: [`
    .field {
      padding: 14px 16px;
      cursor: pointer;
      transition: background .2s;
    }

    .field:hover {
      background-color: #424242;
    }

    .field--even {
      background-color: #323232;
    }

    .field--active {
      background-color: #4e4e4e;
    }
  `],
  template: `
    <div
      class="field"
      [class.field--active]="active"
      [class.field--even]="even"
      (click)="selected.emit()"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class PebEditorDynamicFieldComponent {
  @Input() active: boolean;
  @Input() even: boolean;

  @Output() selected = new EventEmitter<void>();
}
