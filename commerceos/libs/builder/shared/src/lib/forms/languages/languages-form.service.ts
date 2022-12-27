import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select } from '@ngxs/store';
import { difference } from 'lodash';
import { merge, Observable } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { PebLanguage, PebShopDataLanguage, PebThemeDetailInterface } from '@pe/builder-core';
import { PebEditorOptionsState } from '@pe/builder-renderer';
import { PebActionType, pebCreateAction, PebEditorStore } from '@pe/builder-services';
import { PeDestroyService } from '@pe/common';


@Injectable()
export class PebLanguagesFormService {

  @Select(PebEditorOptionsState.language) locale$!: Observable<PebLanguage>;

  languageForm: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly editorStore: PebEditorStore,
    private readonly destroyed$: PeDestroyService,
  ) {

    this.initFormGroup();

    merge(
      this.watchLanguage$,
      this.watchLanguageControl$,
      this.watchLanguagesControl$,
      this.watchDefaultLanguageControl$,
    )
    .pipe(
      takeUntil(this.destroyed$),
    )
    .subscribe();
  }

  private get watchLanguage$() {
    return this.editorStore.snapshot$.pipe(
      tap((snapshot) => {
        this.setLanguages(snapshot);
        this.setDefaultLanguages(snapshot);
      }),
    )
  }

  private get watchLanguageControl$() {
    return this.languageForm.get('language').valueChanges
    .pipe(
      filter((language) => {
        const hasLanguage = this.editorStore
        .snapshot.application?.data?.languages?.find(element => element.language === language);

        return !!language && !hasLanguage;
      }),
      tap((value) => {
        const languages = this.editorStore.snapshot.application?.data?.languages ?? [];
        this.changeLanguages([
          ...languages,
          { language: value, active: true },
        ]);
      }),
    );
  }

  private get watchDefaultLanguageControl$() {
    return this.languageForm.get('defaultLanguage').valueChanges
    .pipe(
      filter(language => {
        const defaultLanguage = this.editorStore.snapshot.application?.data?.defaultLanguage;

        return !!language && defaultLanguage !== language;
      }),
      tap((value) => {
        this.changeDefaultLanguage(value);
      }),
    );;
  }

  private get watchLanguagesControl$() {
    return this.languageForm.get('languages').valueChanges
    .pipe(
      filter(languages => {
        const languagesSnapshot = this.editorStore.snapshot.application?.data?.languages;
        const isChangedLanguages = difference(languages, languagesSnapshot).length !== 0;

        return isChangedLanguages;
      }),
      tap((value) => {
        this.changeLanguages(value);
      }),
    );
  }

  public changeLanguageActive(language: PebLanguage, active: boolean) {
    const languages = this.languageForm.get('languages').value;
    const changeActiveLanguages = languages.map((element) => {
      if (element.language !== language) { return element; }

      return { language, active };
    });

    this.languageForm.patchValue(
      { languages: changeActiveLanguages },
      { emitEvent: true },
    );
  }

  public getFormatLanguages(): Array<{ title: string, value: any }> {
    const languages = this.languageForm.get('languages').value;
    const defaultLanguage = this.languageForm.get('defaultLanguage')?.value

    return  languages
    .filter(element => {
      return element.language !== defaultLanguage;
    })
    .map(element => ({
      title: this.toTitleCase(element.language),
      value: element.language,
    }));
  }

  public getOtherLanguage(): Array<{ title: string, value: any }> {
    const languages = this.languageForm.get('languages').value;

    const otherLanguages = Object
    .values(PebLanguage)
    .filter(language => {
      const hasLanguageInLanguages = languages.find(element => element.language === language);

      return language !== PebLanguage.Generic && !hasLanguageInLanguages;
    })
    .map(language => ({
      title: this.toTitleCase(language),
      value: language,
    }));

    return otherLanguages;
  }

  private toTitleCase(s: string): string {
    return s.split(' ').map(part => part.charAt(0).toUpperCase() + part.substr(1).toLowerCase()).join(' ');
  }

  private setLanguages(snapshot: PebThemeDetailInterface) {
    const languages = snapshot.application.data?.languages ?? [];
    this.languageForm.patchValue({ languages }, { emitEvent: false });
  }

  private setDefaultLanguages(snapshot: PebThemeDetailInterface) {
    const defaultLanguage = snapshot.application.data?.defaultLanguage;
    this.languageForm.patchValue({ defaultLanguage }, { emitEvent: false });
  }

  private initFormGroup() {
    this.languageForm = this.formBuilder.group({
      languages: [],
      language: [null],
      defaultLanguage: [null],
    }, { updateOn: 'blur' });
  }

  private changeLanguages(languages: PebShopDataLanguage[]) {
    const updateAction = pebCreateAction(
      PebActionType.UpdateShopData,
      { languages },
    );
    this.editorStore.commitAction(updateAction);
  }

  private changeDefaultLanguage(defaultLanguage: PebLanguage) {
    const updateAction = pebCreateAction(
      PebActionType.UpdateShopData,
      { defaultLanguage },
    );
    this.editorStore.commitAction(updateAction);
  }

}
