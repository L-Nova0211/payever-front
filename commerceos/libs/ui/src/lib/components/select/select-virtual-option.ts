import { Component, Input, OnInit } from '@angular/core';

import { VirtualData } from './interfaces';
import { PebSelectComponent } from './select';
import { SelectService } from './select.service';

@Component({
  selector: 'pe-select-virtual-options',
  template: `
    <cdk-virtual-scroll-viewport [itemSize]="20" class="pe-select-viewport">
      <div
        *cdkVirtualFor="let item of virtualData"
        class="pe-virtual-option border"
        [class.selected]="select?.multiple ? false : isOptionSelected(item)"
        (click)="onSelected(item)"
      >
        <span>{{ item.label }}</span>
        <!-- <svg class="applied" *ngIf="isOptionSelected(item)">
          <use xlink:href="#icon-ui-applied"></use>
        </svg> -->
        <div class="check-container" *ngIf="isMultiple">
          <svg class="check-background" *ngIf="!isOptionSelected(item)">
            <use xlink:href="#icon-ui-grid-dark-deselected"></use>
          </svg>
          <svg class="check-background" *ngIf="isOptionSelected(item)">
            <use xlink:href="#icon-ui-checkbox"></use>
          </svg>
          <svg class="check" *ngIf="isOptionSelected(item)">
            <use xlink:href="#icon-ui-check"></use>
          </svg>
        </div>
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styleUrls: ['./virtual-option.scss'],
})
export class SelectVirtualOptionsComponent implements OnInit {
  isMultiple = false;
  constructor(private selectService: SelectService) {
    this.select = this.selectService.getSelect();
  }

  @Input() virtualData: VirtualData[];
  @Input() itemSize: number;

  select: PebSelectComponent;

  isOptionSelected(option) {
    if (this.select?.multiple) {
      return this.select.selectedVirtualOptions.indexOf(option) === -1 ? false : true;
    } else {
      return this.select.selected === option.value;
    }
  }

  onSelected(option) {
    this.select.selectVirtualOption(option);
  }

  ngOnInit(): void {
    this.isMultiple = this.select.multiple;
  }
}
