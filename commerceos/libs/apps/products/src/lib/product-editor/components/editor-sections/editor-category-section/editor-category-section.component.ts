import { ChangeDetectionStrategy, Component, Injector, Input, OnInit } from '@angular/core';
import { get, union } from 'lodash-es';
import { merge, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';
import {
  AutocompleteChangeEvent,
  AutocompleteChipsEventType,
  ErrorBag,
  FormAbstractComponent,
  FormScheme,
} from '@pe/forms';

import { ProductEditorSections } from '../../../../shared/enums/product.enum';
import { Category, CategorySection, ExternalError } from '../../../../shared/interfaces/section.interface';
import { ProductsApiService } from '../../../../shared/services/api.service';
import { SectionsService } from '../../../services';
import { LanguageService } from '../../../services/language.service';

const DEFAULT_CATEGORIES: string[] = [
  'Arts & Crafts',
  'Baby',
  'Beauty & Personal Care',
  'Books',
  'Computers',
  'Electronics',
  'Fashion',
  'Health & Household',
  'Home & Kitchen',
  'Luggage',
  'Movies & TV',
  'Music, CDs & Vinyl',
  'Pet Supplies',
  'Sports & Outdoors',
  'Tools & Home Improvement',
  'Toys & Games',
  'Video Games',
];

interface CategoriesSectionFormInterface {
  categories: string[];
}

@Component({
  selector: 'category-section',
  templateUrl: 'editor-category-section.component.html',
  styleUrls: ['editor-category-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorCategorySectionComponent extends FormAbstractComponent<CategorySection> implements OnInit {
  @Input() externalError: Subject<ExternalError>;

  readonly section: ProductEditorSections = ProductEditorSections.Category;

  categories: Category[] = [];
  categoryOptions: string[] = [];
  categorySection: CategorySection = this.sectionsService.categorySection;
  formScheme: FormScheme;
  formTranslationsScope = 'categorySection.form';
  protected formStorageKey = 'categorySection.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private apiService: ProductsApiService,
    private sectionsService: SectionsService,
    private envService: EnvService,
    private languageService: LanguageService,
  ) {
    super(injector);
  }

  // remove
  get _panelOpened$(): Observable<ProductEditorSections> {
    return this.sectionsService.activeSection$.pipe(
      filter((section: ProductEditorSections) => section === this.section),
    );
  }

  get categories$(): Observable<Category[]> {
    const categoriesPerPage = 100;

    return this.apiService
      .getCategories(this.envService.businessId, '', 1, categoriesPerPage)
      .pipe(map(({ data: { getCategories } }) => getCategories));
  }

  ngOnInit(): void {
    merge(
      this.sectionsService.saveClicked$.pipe(
        tap(() => this.doSubmit())
      ),
      this.languageService.updatedLanguage$.pipe(
        tap(() => {
          this.categorySection = this.sectionsService.categorySection;
          this.form.get('categories').setValue(this.categorySection.categories.reduce(
            (acc, item) => [...acc, item.title], []
          ));

          this.changeDetectorRef.detectChanges();
          this.sectionsService.onChangeCategorySection(this.categorySection);
        })
      )
    ).pipe(
      takeUntil(this.destroyed$)
    ).subscribe();

    this.externalError
      .pipe(
        takeUntil(this.destroyed$),
        filter((item: any) => item.section === ProductEditorSections.Category),
      )
      .subscribe((item: any) => {
        const errors: any = {};
        errors[item.field] = item.errorText;
        this.errorBag.setErrors(errors);
        this.changeDetectorRef.detectChanges();
      });
  }

  onCategoryChange({ value, eventType }: AutocompleteChangeEvent): void {
    if (eventType === AutocompleteChipsEventType.Add) {
      const businessId: string = this.envService.businessId;
      const addedCategory: string = value[value.length - 1];
      this.apiService.createCategory(businessId, addedCategory).subscribe((category: Category) => {
        this.sectionsService.allCategories = [
          ...this.sectionsService.allCategories,
          get(category, 'data.createCategory', []),
        ];
        this.categorySection.categories.push(category);
        this.sectionsService.onChangeCategorySection(this.categorySection);
      });
    }
  }

  addCategory(value) {
    const values = [...this.form.value.categories];
    const categoryItem = this.sectionsService.allCategories.find(el => el.title === value);

    if (!value || !value.replace(/\s+/g, '').length || !categoryItem) {
      if (value && value.replace(/\s+/g, '').length > 0) {
        values.push(value);
        this.onCategoryChange({ value: values, eventType: AutocompleteChipsEventType.Add });
      }
    } else {
      const alreadyExists = !!this.categorySection.categories.find(el => el.title === value);

      if (!value || alreadyExists) {
        return;
      }

      values.push(value);

      this.categoryOptions.forEach((el: string, idx: number) => {
        if (el === value) {
          this.categoryOptions.splice(idx, 1);
        }
      });

      this.categorySection.categories.push(categoryItem);
      this.sectionsService.onChangeCategorySection(this.categorySection);
    }

    this.form.get('categories').patchValue(values);
  }

  removeCategory(value) {
    const categoryItem = this.sectionsService.allCategories.find(el => el.title === value);

    this.categorySection.categories.forEach((el: Category, idx: number) => {
      if (el.id === categoryItem.id && el.title === categoryItem.title) {
        this.categorySection.categories.splice(idx, 1);
      }
    });

    this.categoryOptions.push(categoryItem.title);
    this.sectionsService.onChangeCategorySection(this.categorySection);

    this.form.value.categories.forEach((el: string, idx: number) => {
      if (el === categoryItem.title) {
        this.form.value.categories.splice(idx, 1);
      }
    });
  }

  validateInput(val: string): boolean {
    const isDuplicate: boolean = this.form.controls.categories.value.some((category: string) => {
      return category === val;
    });

    return !isDuplicate;
  }

  protected createForm(initialData: CategorySection): void {
    const data: CategorySection = this.categorySection;
    const selectedCategories: string[] = data.categories.filter(c => c).map((category: Category) => category.title);

    this.categories$.subscribe((categories: Category[]) => {
      this.sectionsService.allCategories = categories;

      this.form = this.formBuilder.group({
        categories: [selectedCategories],
      });

      this.categoryOptions = union(
        categories
          .map((category: Category) => category.title)
          .filter(title => !selectedCategories.includes(title)),
        DEFAULT_CATEGORIES.filter(title => !selectedCategories.includes(title)),
      );

      this.changeDetectorRef.detectChanges();
    });
  }

  protected onUpdateFormData(formValues: CategoriesSectionFormInterface): void {
    const categories: Array<{ title: string }> = formValues.categories.map((category: string) => ({ title: category }));

    this.sectionsService.onChangeCategorySection({
      categories,
    });
  }

  protected onSuccess(): void {
    this.sectionsService.prepareCategories();
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }
}
