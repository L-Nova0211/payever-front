import { ChangeDetectionStrategy, Component, Injector, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { ErrorBag, FormAbstractComponent, FormScheme } from '@pe/forms';

import { ProductEditorSections } from '../../../../shared/enums/product.enum';
import { ExternalError, VisibilitySection } from '../../../../shared/interfaces/section.interface';
import { SectionsService } from '../../../services';
import { CountryService } from '../../../services/country.service';

@Component({
  selector: 'visibility-section',
  templateUrl: 'editor-visibility-section.component.html',
  styleUrls: ['editor-visibility-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorVisibilitySectionComponent extends FormAbstractComponent<VisibilitySection> {
  @Input() externalError: Subject<ExternalError>;

  readonly section: ProductEditorSections = ProductEditorSections.Visibility;
  visibilitySection: VisibilitySection = this.sectionsService.visibilitySection;
  formScheme: FormScheme;
  formTranslationsScope = 'visibilitySection.form';

  protected formStorageKey = 'visibilitySection.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private sectionsService: SectionsService,
    private countryService: CountryService
  ) {
    super(injector);
  }

  protected createForm(initialData: VisibilitySection): void {
    const data: VisibilitySection = this.visibilitySection;
    this.form = this.formBuilder.group({
      active: [data.active],
    });

    this.countryService.updatedCountry$.pipe(
      tap(() => {
        this.visibilitySection = this.sectionsService.visibilitySection;
        this.form.get('active').setValue(this.visibilitySection.active);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formValues: VisibilitySection): void {
    this.sectionsService.onChangeVisibilitySection(formValues);
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }
}
