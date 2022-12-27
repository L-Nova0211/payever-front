import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PebEditorSlot } from '@pe/builder-abstract';
import { PebEditorAccessorService } from '@pe/builder-services';

import { PebRestrictAccessForm } from './restrict-access.form';

@Component({
  selector: 'peb-restrict-access-form',
  templateUrl: './restrict-access-form.component.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './restrict-access-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebRestrictAccessFormComponent {

  private get editor() {
    return this.editorAccessorService.editorComponent;
  }

  constructor(
    private editorAccessorService: PebEditorAccessorService,
  ) { }


  openForm(): void {
    this.editor.detail = { back: 'Page', title: 'Restrict Access' };
    const sidebarCmpRef = this.editor.insertToSlot(PebRestrictAccessForm, PebEditorSlot.sidebarDetail);
  }
}
