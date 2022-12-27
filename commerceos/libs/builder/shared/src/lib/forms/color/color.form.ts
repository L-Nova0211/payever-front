import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'peb-color-form',
  template: `
    <peb-editor-sidebar-tabs>
      <peb-editor-sidebar-tab title="Preset">
        <peb-fill-preset [control]="formControl" (colorSelected)="blurred.emit()"></peb-fill-preset>
      </peb-editor-sidebar-tab>

      <peb-editor-sidebar-tab title="Color">
        <peb-picker [formControl]="formControl" (change)="blurred.emit()"></peb-picker>
      </peb-editor-sidebar-tab>
    </peb-editor-sidebar-tabs>
  `,
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebColorForm implements OnDestroy {
  @Input() formControl: FormControl;
  @Output() blurred = new EventEmitter<void>();

  readonly destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
