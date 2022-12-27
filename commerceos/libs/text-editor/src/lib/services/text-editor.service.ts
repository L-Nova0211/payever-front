import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { DEFAULT_FONT_COLOR } from '../text-editor.constants';
import { ExecuteCommandAction, ToggleToolbarAction } from '../text-editor.interface';

@Injectable({ providedIn:'root' })
export class TextEditorService {
  toolbarColor: string = DEFAULT_FONT_COLOR;

  triggerCommand$: Subject<ExecuteCommandAction> = new Subject();
  toggleToolbarAction$: Subject<ToggleToolbarAction> = new Subject();
  placeholderSubject$ = new Subject<string>();

}
