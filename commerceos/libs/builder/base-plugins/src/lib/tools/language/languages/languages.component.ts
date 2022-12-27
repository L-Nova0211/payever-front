import { Component, Input } from '@angular/core';

import { PebLanguage } from '@pe/builder-core';

@Component({
  selector: 'peb-shop-editor-languages',
  templateUrl: 'languages.component.html',
  styleUrls: ['./languages.component.scss'],
})
export class PebEditorLanguagesComponent {

  PebLanguage = PebLanguage;

  @Input() language: PebLanguage;

}
