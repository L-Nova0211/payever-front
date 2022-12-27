import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'editor-expandable-panel',
  templateUrl: './expandable-panel.component.html',
  styleUrls: ['./expandable-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorExpandablePanelComponent {
  @Input() set opened(opened: boolean) {
    this.openedSubject$.next(opened);
  }

  @Output() toggleOpened = new EventEmitter<boolean>();

  readonly openedSubject$ = new BehaviorSubject<boolean>(true);

  toggle() {
    this.openedSubject$.next(
      !this.openedSubject$.value,
    );
    this.toggleOpened.emit(this.openedSubject$.value);
  }
}
