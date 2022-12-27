import { Directive, EventEmitter, Input, Output } from '@angular/core';

@Directive()
export abstract class AbstractWidgetDirective {
  @Input() config: any = {};
  @Input() useDefaultDataSource = false;
  @Input() editMode = false;
  @Output() loadDefaultDataSource = new EventEmitter();

  @Input() onEditMode: () => void = () => {};
}
