import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'peb-editor-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './right-sidebar.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorRightSidebarComponent {

  @Input() sidebarHidden: boolean;
  @Input() isDetail: boolean;
  @Input() detail: { title?: string, back?: string };
  @Input() isOptionList: boolean;
  @Input() optionList: { title?: string, back?: string };
  @Input() tabs: Array<{ title: string, active?: boolean }> = [];

  @Output() backToOn = new EventEmitter<string>();

  @ViewChild('formatSlot', { read: ViewContainerRef, static: true })
  public formatSlot: ViewContainerRef;

  @ViewChild('motionSlot', { read: ViewContainerRef, static: true })
  public motionSlot: ViewContainerRef;

  @ViewChild('pageSlot', { read: ViewContainerRef, static: true })
  public pageSlot: ViewContainerRef;

  @ViewChild('detailSlot', { read: ViewContainerRef, static: true })
  public detailSlot: ViewContainerRef;

  @ViewChild('optionListSlot', { read: ViewContainerRef, static: true })
  public optionListSlot: ViewContainerRef;

  constructor(public cdr: ChangeDetectorRef) {
  }

  backTo(direct: string): void {
    this.backToOn.emit(direct);
  }

  selectTab(activeTab) {
    this.tabs.forEach(tab => tab.active = false);

    activeTab.active = true;
  }

  getActiveTab() {
    return this.tabs.find(tab => tab.active === true);
  }
}
