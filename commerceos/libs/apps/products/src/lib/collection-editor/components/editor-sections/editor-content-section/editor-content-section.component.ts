import { AfterViewInit, ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

import { ErrorBag, FormAbstractComponent, FormScheme } from '@pe/forms';

import { CollectionEditorSections } from '../../../enums';
import { ContentSection, MainSection } from '../../../interfaces';
import { CollectionSectionsService } from '../../../services';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'content-section',
  templateUrl: 'editor-content-section.component.html',
  styleUrls: ['editor-content-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorContentSectionComponent extends FormAbstractComponent<ContentSection> implements
  OnInit, AfterViewInit {
  readonly section: CollectionEditorSections = CollectionEditorSections.Content;

  contentSection: ContentSection = this.sectionsService.contentSection;
  formScheme: FormScheme;
  formTranslationsScope = 'contentSection.form';
  protected formStorageKey = 'contentSection.form';
  description: string;

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private sectionsService: CollectionSectionsService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.description = this.contentSection?.description?.split('style=\\').join('style=');
    this.sectionsService.saveClicked$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.doSubmit();
    });
  }

  onDescriptionChange(text: string): void {
    this.form.get('description').setValue(text);
  }

  get descriptionInvalid(): boolean {
    const control: AbstractControl = this.form.get('description');

    return this.isSubmitted && control.invalid;
  }

  protected createForm(initialData: ContentSection): void {
    const data: ContentSection = this.contentSection;

    this.form = this.formBuilder.group({
      description: [data.description],
    });

    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formValues: MainSection): void {
    this.sectionsService.onChangeContentSection(Object.assign({}, this.form.getRawValue()));
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }
}
