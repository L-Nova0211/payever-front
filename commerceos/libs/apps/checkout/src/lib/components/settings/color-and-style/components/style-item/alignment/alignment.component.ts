import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';

import { ALIGNMENTS } from '../../../constants';
import { BaseStyleItemComponent } from '../base-item.component';

@Component({
  selector: 'pe-style-alignment',
  templateUrl: './alignment.component.html',
  styles: [`
    :host {
      display: contents;
    }
    .mat-list-item-flex:hover {
      cursor: pointer;
    }
    .no-padding {
      padding: 0 2px;
    }
    .mat-list-item-col:first-child button{
      padding-left: 10px;
    }
    .mat-list-item-col:last-child{
      padding-right: 10px;
    }
    .arrow-open {
      width: 15px;
      height: 8px;
      color: #fff;
      margin-left: auto;
      margin-right: 12px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleAlignmentComponent extends BaseStyleItemComponent {
  readonly alignmentIcons = ALIGNMENTS;

  constructor(
    protected injector: Injector
  ) {
    super(injector);
  }

  get selectedAlignment(): string {
    return this.control.value;
  }

  setSelectedAlignment(alignment: string): void {
    this.control.setValue(alignment);
  }
}
