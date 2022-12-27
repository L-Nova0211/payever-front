import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'peb-shop-editor-master-changes-banner',
  templateUrl: 'master-changes-banner.component.html',
  styleUrls: ['master-changes-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorMasterChangesBannerComponent {

  @Input() pageName: string;
  @Input() loading = false;

  @Output() apply = new EventEmitter();
  @Output() deny = new EventEmitter();

  onApply() {
    this.apply.emit();
  }

  onDeny() {
    this.deny.emit();
  }

}
