import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PebShopsApi } from '../../services/abstract.shops.api';

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
  errorMsg: string;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    // private apiService: PebActualSitesApi,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private apiShop: PebShopsApi,
    private destroy$: PeDestroyService,
    private cdr: ChangeDetectorRef,
  ) {
    this.config.doneBtnCallback = () => {
      this.onSubmit()
    }
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      privatePassword: [
        '', [Validators.minLength(8)],
      ],
      privateMessage: [
        this.siteDeploy?.privateMessage,
      ],
      isPrivate: [this.siteDeploy?.isPrivate, [Validators.required]],
    });

    this.form.get('isPrivate').valueChanges.pipe(
      tap((isPrivate) => {
        if (isPrivate) {
          this.form.get('privatePassword').setValidators([Validators.required, Validators.minLength(8)]);
          this.form.get('privatePassword').updateValueAndValidity();
        } else {
          this.form.get('privatePassword').setValidators([Validators.minLength(8)]);
          this.form.get('privatePassword').updateValueAndValidity();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
    this.form.valueChanges.pipe(
      takeUntil(this.destroy$),
    ).subscribe(() => {
      if (this.form.invalid) {
        if (this.form.get('privatePassword').hasError('minlength')) {
          this.errorMsg = 'Password should be 8 or more characters';
        }
        if (this.form.get('privatePassword').hasError('required')) {
          this.errorMsg = 'Password is required';
        }
      } else {
        this.errorMsg = null;
      }
      this.cdr.markForCheck();
    });
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
    if (payload.isPrivate) {payload.privatePassword = this.form.get('privatePassword').value;}

    this.apiShop.updateShopAccessConfig(
      this.appData.id,
      payload,
    ).subscribe(
      (data) => {
        this.appData.onSaved$.next({ updateShopList: true });
        this.overlay.close();
      },
      (error) => {
        if (error.error.statusCode === 400) {
          this.errorMessage = error.error.errors[0];
          this.cdr.markForCheck();
          this.form.enable();
        }
      },
    )

  }
}
