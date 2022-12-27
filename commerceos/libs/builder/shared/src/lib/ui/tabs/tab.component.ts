import { Component, Input } from '@angular/core';

@Component({
  selector: 'peb-editor-sidebar-tab',
  styles: [`
    :host { display: block }
    .tab {
      padding: 15px;
    }
  `],
  template: `
    <div *ngIf="active" class="tab">
      <ng-content></ng-content>
    </div>
  `,
})
export class PebEditorTabComponent {
  @Input() title: string;
  @Input() active = false;
  @Input() hidden = false;
}
