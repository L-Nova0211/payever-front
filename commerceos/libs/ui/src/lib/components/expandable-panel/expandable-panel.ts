import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'peb-expandable-panel',
  templateUrl: './expandable-panel.html',
  styleUrls: ['./expandable-panel.scss'],
  animations: [
    trigger('panelBody', [
      state(
        'hidden',
        style({
          height: '0',
          overflow: 'hidden',
          padding: '0 12px',
        }),
      ),
      state(
        'visible',
        style({
          height: '*',
        }),
      ),
      transition('visible <=> hidden', [style({ overflow: 'hidden' }), animate('{{transitionParams}}')]),
      transition('void => *', animate(0)),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebExpandablePanelComponent {
  /** Sets header label */
  @Input() headerLabel: string;
  @Input() disabled: boolean;
  /** Sets default opened/closed state */
  @Input() isContentOpen = false;
  /** Sets description */
  @Input() description = '';
  @Input() lightHeader: boolean;

  /** Emits when panel opened */
  @Output() opened = new EventEmitter();
  /** Emits when panes closes */
  @Output() closed = new EventEmitter();

  transitionOptions = '225ms cubic-bezier(0.4,0.0,0.2,1)';

  /** Toggles panel opened/closed */
  toggleContent() {
    this.isContentOpen = !this.isContentOpen;
    this.isContentOpen === false ? this.closed.emit() : this.opened.emit();
  }
}
