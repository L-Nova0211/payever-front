import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PebLanguagesData } from '@pe/builder-core';
import { PebEditorAccessorService } from '@pe/builder-services';
import { PeDestroyService } from '@pe/common';

import { PebLanguagesFormService } from './languages-form.service';

export enum EditControlEnum {
  DefaultLanguage = 'defaultLanguage',
  Language = 'language',
}

@Component({
  selector: 'peb-languages-form',
  templateUrl: './languages-form.component.html',
  styleUrls: ['./languages-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
    PebLanguagesFormService,
  ],
})
export class PebLanguagesFormComponent {

  readonly PebLanguagesData = PebLanguagesData;

  editControl$ = new BehaviorSubject<EditControlEnum>(null);

  options: Array<{ title: string, value: any }> = [];

  constructor(
    readonly languagesFormService: PebLanguagesFormService,
    private readonly editorAccessorService: PebEditorAccessorService,
  ) {}

  private get editor() {
    return this.editorAccessorService.editorComponent;
  }

  pickLanguages(): void {
    if (this.languagesFormService.languageForm.get('languages').value.length <= 1) {
      return;
    }

    this.options = this.languagesFormService.getFormatLanguages();

    if (this.options.length === 0) {
      return;
    }

    this.editControl$.next(EditControlEnum.DefaultLanguage);
  }

  pickLanguagesToAdd() {
    this.options = this.languagesFormService.getOtherLanguage();

    if (this.options.length === 0) {
      return;
    }

    this.editControl$.next(EditControlEnum.Language);
  }

  editLanguage(): void {
    const languages = this.languagesFormService.languageForm.get('languages').value.filter(language => language.active);

    if (languages.length === 0) {
      return;
    }

    this.editor.commands$.next({ type: 'openLanguagesDialog' });
  }

  selectLanguage(title: string) {
    this.languagesFormService.languageForm.get(this.editControl$.value).patchValue(title);
    this.editControl$.next(null);
  }

}
