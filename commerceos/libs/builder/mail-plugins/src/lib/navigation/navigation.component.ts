import {
  ChangeDetectionStrategy,
  ChangeDetectorRef, Component,
  EventEmitter,
  Injector,
  Input,
  Output, TemplateRef,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { PageSnapshot, PebEditorAbstractNavigation } from '@pe/builder-abstract';
import { PebScreen, PebThemeShortPageInterface } from '@pe/builder-core';
import { PebEditorOptionsState } from '@pe/builder-renderer';
import { PebEditorStore } from '@pe/builder-services';

@Component({
  selector: 'peb-shop-editor-navigation',
  templateUrl: 'navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorMailNavigationComponent implements PebEditorAbstractNavigation {

  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  @Input() pages: PebThemeShortPageInterface[];

  @Output() execCommand = new EventEmitter<any>();

  @Input() loading: boolean;
  @Input() activePageSnapshot: PageSnapshot;

  @ViewChild('pageMenu') pageMenu: TemplateRef<any>;

  cdr = this.injector.get(ChangeDetectorRef);
  sanitizer = this.injector.get(DomSanitizer);
  editorStore = this.injector.get(PebEditorStore);

  constructor(private injector: Injector) {
  }

}
