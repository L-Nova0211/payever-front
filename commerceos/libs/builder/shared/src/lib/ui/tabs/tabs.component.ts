import {
  AfterContentInit,
  Component,
  ContentChildren, EventEmitter,
  Input,
  OnChanges, Output,
  QueryList,
  SimpleChanges,
} from '@angular/core';

import { PebEditorTabComponent } from './tab.component';

@Component({
  selector: 'peb-editor-sidebar-tabs',
  template: `
    <div class="tabs">
      <div class="tabs__wrapper">
        <div
          class="tab"
          *ngFor="let tab of tabs; let index = index"
          (click)="selectTab(tab, index)"
          [class.active]="tab.active"
          [hidden]="tab.hidden"
        >
          {{ tab.title }}
        </div>
      </div>
    </div>
    <div class="tab__wrapper">
      <div class="tab-content scrollbar" pebAutoHideScrollBar>
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./tabs.component.scss'],
})
export class PebEditorTabsComponent implements AfterContentInit, OnChanges {

  @Input() activeTabIndex = 0;
  @Output() activeTabIndexChange = new EventEmitter();

  @ContentChildren(PebEditorTabComponent) tabs: QueryList<PebEditorTabComponent>;

  ngAfterContentInit() {
    const activeTabs = this.tabs.filter(tab => tab.active);
    if (activeTabs.length === 0) {
      this.selectTab(this.tabs.toArray()[this.activeTabIndex]);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.activeTabIndex?.currentValue && this.tabs) {
      this.selectTab(this.tabs.toArray()[changes.activeTabIndex.currentValue]);
    }
  }

  selectTab(tab: PebEditorTabComponent, index?: number): void {
    this.tabs.toArray().forEach((t: PebEditorTabComponent) => t.active = false);
    tab.active = true;
    if (index !== undefined) {
      this.activeTabIndexChange.emit(index);
    }
  }
}
