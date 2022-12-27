import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';

import { EnvService, PeDestroyService } from '@pe/common';
import { OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { ContactStatusAction } from '../../interfaces';
import { StatusGQLService } from '../../services';

@Component({
  selector: 'pe-contacts-status',
  template: `<form 
  [formGroup]="statusForm" 
  [class.loading]="isLoading" 
  [ngClass]="theme">
    <peb-form-background>
      <peb-form-field-input
        appearance="label"
        [label]="'contacts-app.actions.status.form.status_name' | translate"
      >
        <input formControlName="name" type="text">
      </peb-form-field-input>
    </peb-form-background>
    <div *ngIf="editMode" style="margin-top: 12px;">
      <peb-form-background>
        <button pe-form-button peb-base-button
          (click)="deleteStatus()"
          color="warn"
          >
            {{ 'contacts-app.actions.status.form.delete' | translate }}
        </button>
      </peb-form-background>
    </div>
  </form>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class ContactStatusComponent {
  public isLoading = false;
  public statusForm: FormGroup

  public editMode = this.peOverlayData.action === ContactStatusAction.Edit;

  public readonly theme = this.peOverlayConfig.theme;

  constructor(
    private statusGQLService: StatusGQLService,
    private formBuilder: FormBuilder,
    private destroyed$: PeDestroyService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private envService: EnvService,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
  ) {
    this.statusForm = this.formBuilder.group({
      name: [this.peOverlayData.value?.name, Validators.required],
    });
    this.peOverlayData.sendSubject$.pipe(
      tap(() => this.submit()),
      takeUntil(this.destroyed$)
    )
    .subscribe()
  }
  
  public submit() {
    let payload;
    if (!this.statusForm.invalid) {
      const { name } = this.statusForm.value;
      payload = { name };
      const businessId = this.envService.businessId;

      if (this.editMode) {
        this.statusGQLService
          .updateContactStatus({ ...payload, id: this.peOverlayData.value.id, businessId })
          .subscribe(response => 
            this.peOverlayData.onSavedSubject$.next({ edit: true, value: response })
          );
      } else {
        this.statusGQLService
          .createContactStatus({ ...payload })
          .subscribe(response => 
            this.peOverlayData.onSavedSubject$.next({ create: true, value: response })
          );
      }
      this.peOverlayWidgetService.close();
    } else {
      payload = { errors: this.statusForm.errors };
    }
  }

  public deleteStatus() {
    const businessId = this.envService.businessId;
    this.statusGQLService
      .deleteContactStatus( this.peOverlayData.value.id, businessId)
      .subscribe(response => 
        this.peOverlayData.onSavedSubject$.next({ delete: true, value: response })
      );
    this.peOverlayWidgetService.close();
  }
}
