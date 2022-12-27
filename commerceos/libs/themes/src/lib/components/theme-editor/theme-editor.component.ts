import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, filter, map, take, takeUntil, tap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { PeDestroyService } from '@pe/common';
import { Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { PeMediaFileTypeEnum } from '@pe/media';
import { OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeThemeTypesEnum } from '../../enums';
import { ThemesApi, PeThemesGridService } from '../../services';

@Component({
  selector: 'pe-theme-editor',
  templateUrl: './theme-editor.component.html',
  styleUrls: ['./theme-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeThemeEditorComponent implements OnInit {
  
  private readonly cancelBtn = this.translateService.translate('builder-themes.actions.cancel');
  private readonly closeBtn = this.translateService.translate('builder-themes.actions.close');
  private readonly saveBtn = this.translateService.translate('builder-themes.actions.save');
  private readonly savingBtn = this.translateService.translate('builder-themes.actions.saving');

  public readonly businessId = this.pebEnvService.businessId;
  public readonly theme = this.peOverlayConfig.theme;
  
  public loading = false;
  public themeForm = this.formBuilder.group({
    _id: [null],
    isTemplateTheme: [false],
    name: [],
    media: [[]],
    type: [],
  })

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,

    private pebEnvService: PebEnvService,
    @Inject(PE_OVERLAY_CONFIG) public peOverlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private themesApi: ThemesApi,
    private peThemesGridService: PeThemesGridService,
  ) {
    this.peThemesGridService.backdropClick = this.closeEditor;
    this.peOverlayConfig.backBtnCallback = this.closeEditor;
    this.peOverlayConfig.doneBtnCallback = () => {
      !this.loading && this.save();
    };
  }

  ngOnInit(): void {
    const themeId = this.peOverlayData.id;
    this.loading = true;
    this.themesApi
      .getThemeById(themeId)
      .pipe(
        tap(theme => {
          const media = theme.picture
            ? [{
                localUrl: null,
                mediaUrl: theme.picture,
                mediaMimeType: PeMediaFileTypeEnum.Image,
              }]
            : [];
          theme.isTemplateTheme = theme.type === PeThemeTypesEnum.Template;
          theme.type = theme.isTemplateTheme
            ? PeThemeTypesEnum.Template
            : PeThemeTypesEnum.Application;
          const themeToSet = {
            ...theme,
            media,
          };
          this.themeForm.patchValue(themeToSet);
          this.themeForm.markAsPristine();
          this.loading = false;
          this.cdr.detectChanges();
        }))
      .subscribe();
  }

  public updatePicture(media: any[]) {
    this.themeForm.controls.media.patchValue(media);
    this.themeForm.markAsDirty();
  }

  public changeThemeType(themeTypeSwitcher: boolean) {
    const themeType = themeTypeSwitcher
      ? PeThemeTypesEnum.Template
      : PeThemeTypesEnum.Application;
    this.themeForm.controls.type.patchValue(themeType);
    this.themeForm.markAsDirty();
  }

  private readonly closeEditor = () => {
    if (this.themeForm.dirty && !this.loading) {
      this.peThemesGridService.confirmation$
        .pipe(
          take(1),
          filter(Boolean),
          tap(() => {
            this.peOverlayWidgetService.close();
          }),
          takeUntil(this.destroy$))
        .subscribe();

      const headingTitle = 'builder-themes.confirm_dialog.cancel.theme_editor.editing.title';
      const headingSubtitle = 'builder-themes.confirm_dialog.cancel.theme_editor.editing.subtitle';
      const config: Headings = {
        title: this.translateService.translate(headingTitle),
        subtitle: this.translateService.translate(headingSubtitle),
        confirmBtnText: this.closeBtn,
        declineBtnText: this.cancelBtn,
      };

      this.peThemesGridService.openConfirmDialog(config);
    } else if (!this.loading) {
      this.peOverlayWidgetService.close();
    }
  }

  private save = () => {
    const { controls } = this.themeForm;
    controls.name.setValidators([Validators.required]);
    controls.name.updateValueAndValidity();
    const { dirty, invalid, valid } = this.themeForm;

    if (dirty && valid) {
      this.peOverlayConfig.doneBtnTitle = this.savingBtn;
      this.peOverlayConfig.isLoading = true;
      this.loading = true;
      this.cdr.detectChanges();

      const themeToUpdate = {
        isTemplateTheme: controls.isTemplateTheme.value,
        name: controls.name.value,
        picture: controls.media.value.length
          ? controls.media.value[0].mediaUrl
          : null,
        type: controls.type.value,
      };

      this.themesApi
        .updateTheme(controls._id.value, themeToUpdate)
        .pipe(
          map(theme => this.peOverlayData.applicationScopeElasticId
            ? {
                ...theme,
                applicationScopeElasticId: this.peOverlayData.applicationScopeElasticId,
              }
            : theme),
          tap(theme => {
            this.peOverlayConfig.onSaveSubject$.next(theme);
          }),
          catchError(error => {
            this.peOverlayConfig.doneBtnTitle = this.saveBtn;
            this.peOverlayConfig.isLoading = false;
            this.loading = false;
            this.cdr.detectChanges();

            return of(error);
          }),
          takeUntil(this.destroy$))
        .subscribe();
    } else if (dirty || invalid) {
      this.cdr.detectChanges();
    } else {
      this.peOverlayWidgetService.close();
    }
  }
}
