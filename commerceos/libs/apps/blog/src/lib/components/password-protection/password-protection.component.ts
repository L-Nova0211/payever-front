import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take, takeUntil, tap } from 'rxjs/operators';

import { PebBlogsApi } from '@pe/builder-api';
import { MessageBus, PeDestroyService } from '@pe/common';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

@Component({
  selector: 'peb-password-protection',
  templateUrl: './password-protection.component.html',
  styleUrls: ['./password-protection.component.scss'],
  providers: [ FormBuilder, PeDestroyService ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSettingsPasswordProtectionComponent implements OnInit {

  form: FormGroup;
  siteDeploy = this.appData.accessConfig;
  loading: boolean;
  errorMessage: string;
  constructor(
    private formBuilder: FormBuilder,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private apiBlog: PebBlogsApi,
    private destroy$: PeDestroyService,
    private cdr: ChangeDetectorRef,
    private messageBus: MessageBus,
  ) {
    this.config.doneBtnCallback = () => {
      this.onSubmit()
    }
  }

  ngOnInit() {
    this.messageBus.listen('confirm').pipe(take(1))
    .subscribe((confirm) => {
      if (confirm) {
        this.overlay.close();
      }
    });
    this.form = this.formBuilder.group({
      privatePassword: [
        '',
      ],
      privateMessage: [
        this.siteDeploy?.privateMessage,
      ],
      isPrivate: [this.siteDeploy?.isPrivate, [Validators.required]],
    });

    this.form.get('isPrivate').valueChanges.pipe(
      tap((isPrivate) => {
        if (isPrivate) {
          this.form.get('privatePassword').setValidators([Validators.required]);
          this.form.get('privatePassword').updateValueAndValidity();
        } else {
          this.form.get('privatePassword').clearValidators();
          this.form.get('privatePassword').updateValueAndValidity();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onSubmit() {
    if (this.form.untouched) {
      this.overlay.close();
    }

    if (this.form.invalid) {
      if (this.form.get('privatePassword').hasError('required')) {
        this.errorMessage = 'Password is required';
      }
      this.cdr.markForCheck();

      return;
    }
    this.form.disable();
    this.loading = true;
    const payload: any = {
      isPrivate: this.form.get('isPrivate').value,
      privateMessage: this.form.get('privateMessage').value,
    }
    if (payload.isPrivate) {
      payload.privatePassword = this.form.get('privatePassword').value;
    }

    this.apiBlog.updateBlogAccessConfig(
      this.appData.id,
      payload
    ).subscribe(
      (data) => {
        this.appData.onSved$.next({ updateBlogList: true });
        this.overlay.close();
      },
      (error) => {
        if (error.error.statusCode == 400) {
          this.errorMessage = error.error.errors[0];
          this.cdr.markForCheck();
          this.form.enable();
        }
      }
    )

  }
}
