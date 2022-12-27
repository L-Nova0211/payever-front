import { Component, Input } from '@angular/core';

import { PebLanguage } from '@pe/builder-core';

@Component({
  selector: 'peb-editor-language-icon',
  template: `
    <ng-container [ngSwitch]="language">
      <peb-editor-language-english-icon *ngSwitchCase="PebLanguage.English" class="icon"></peb-editor-language-english-icon>
      <peb-editor-language-german-icon *ngSwitchCase="PebLanguage.German" class="icon"></peb-editor-language-german-icon>
      <peb-editor-language-italian-icon *ngSwitchCase="PebLanguage.Italian" class="icon"></peb-editor-language-italian-icon>
      <peb-editor-language-spanish-icon *ngSwitchCase="PebLanguage.Spanish" class="icon"></peb-editor-language-spanish-icon>
      <peb-editor-language-chinese-icon *ngSwitchCase="PebLanguage.Chinese" class="icon"></peb-editor-language-chinese-icon>
      <ng-container *ngSwitchDefault>{{ language }}</ng-container>
    </ng-container>
  `,
})
export class PebEditorLanguageComponent {
  @Input() language: PebLanguage;
  PebLanguage = PebLanguage;
}
