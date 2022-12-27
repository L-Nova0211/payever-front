import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { TranslateService } from '@pe/i18n-core';

import { PebSitesApi } from '../../services/site/abstract.sites.api';

@Component({
  selector: 'peb-password-protection',
  templateUrl: './password-protection.component.html',
  styleUrls: ['./password-protection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeSettingsPasswordProtectionComponent implements OnInit {

  form: FormGroup;
  siteDeploy = this.appData.accessConfig;
  loading: boolean;
  errorMessage: string;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private apiSite: PebSitesApi,
    private destroy$: PeDestroyService,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
  ) {
    this.config.doneBtnCallback = () => {
      this.onSubmit();
    }
  }

  ngOnInit() {
    const isPrivate = this.siteDeploy?.isPrivate;
    this.form = this.formBuilder.group({
      privatePassword: [
        '', isPrivate ? [Validators.required, Validators.minLength(8)] : []
      ],
      privateMessage: [
        this.siteDeploy?.privateMessage,
      ],
      isPrivate: [isPrivate, [Validators.required]],
    });

    this.form.get('isPrivate').valueChanges.pipe(
      tap((isPrivate) => {
        this.form.get('privatePassword')
          .setValidators(isPrivate ? [Validators.required, Validators.minLength(8)] : []);
        this.form.get('privatePassword').updateValueAndValidity();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.form.valueChanges.pipe(
      takeUntil(this.destroy$),
      tap(() => {
        const formControl = this.form.get('privatePassword');
        const errorKey = formControl.hasError('minlength')
          ? 'site-app.forms.validator.minlength'
          : formControl.hasError('required')
            ? 'site-app.forms.validator.required'
            : null;
        this.errorMessage = errorKey && this.translateService.translate(errorKey);
        this.cdr.markForCheck();
      })
    ).subscribe();
  }

  onSubmit() {
    if (this.form.untouched) {
      this.overlay.close();
    }

    if (this.form.invalid) {
      return;
    }
    this.form.disable();
    this.loading = true;
    const payload: any = {
      isPrivate: this.form.get('isPrivate').value,
      privateMessage: this.form.get('privateMessage').value,
    }
    if (payload.isPrivate) { payload.privatePassword = this.form.get('privatePassword').value; }

    this.apiSite.updateSiteAccessConfig(
      this.appData.id,
      payload,
    ).pipe(tap(() => {
        this.appData.onSaved$.next({ updateSiteList: true });
        this.overlay.close();
      }, (error) => {
        if (error.error.statusCode === 400) {
          this.errorMessage = error.error.errors[0];
          this.cdr.markForCheck();
          this.form.enable();
        }
      },
    )).subscribe();
  }
}
