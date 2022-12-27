import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { ErrorBag, FormAbstractComponent, FormScheme } from '@pe/forms';

import { ProductEditorSections } from '../../../../shared/enums/product.enum';
import { ProductModel } from '../../../../shared/interfaces/product.interface';
import { ContentSection, MainSection } from '../../../../shared/interfaces/section.interface';
import { SectionsService } from '../../../services';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'content-section',
  templateUrl: 'editor-content-section.component.html',
  styleUrls: ['editor-content-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class ProductsEditorContentSectionComponent
  extends FormAbstractComponent<ContentSection>
  implements OnInit, AfterViewInit
{
  readonly section: ProductEditorSections = ProductEditorSections.Content;

  contentSection: ContentSection = this.sectionsService.contentSection;
  formScheme: FormScheme;
  formTranslationsScope = 'contentSection.form';
  blobs: string[] = [];

  description: string;

  protected formStorageKey = 'contentSection.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private sectionsService: SectionsService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef,
    public sanitizer: DomSanitizer,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.description = this.contentSection?.description?.split('style=\\').join('style=');

    merge(
      this.sectionsService.saveClicked$.pipe(
        tap(() => this.doSubmit())
      ),
      this.languageService.updatedLanguage$.pipe(
        tap((model: ProductModel) => {
          this.description = model.description;
          this.cdr.detectChanges();
          this.onDescriptionChange(model.description);
        })
      )
    ).pipe(
      takeUntil(this.destroyed$)
    ).subscribe();
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
    this.sectionsService.onChangeContentSection(Object.assign({}, this.form.getRawValue(), { images: this.blobs }));
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }
}
