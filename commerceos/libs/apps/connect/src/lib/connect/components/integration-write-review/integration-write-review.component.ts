/**
 * Integration Write review page
 */


import { Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Injector,
  TemplateRef,
  ViewChild,
  Inject,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil, filter, take } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { FormSchemeField, FormAbstractComponent, FormScheme } from '@pe/forms';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import {
  IntegrationsStateService, NavigationService, IntegrationInfoWithStatusInterface,
} from '../../../shared';

interface WriteReviewFormInterface {
  reviewFieldSet: {
    title: string;
    text: string;
  };
}

@Component({
  selector: 'connect-integration-write-review',
  templateUrl: './integration-write-review.component.html',
  styleUrls: ['./integration-write-review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationWriteReviewComponent extends FormAbstractComponent<WriteReviewFormInterface> implements OnInit {

  @ViewChild('confirmCancel', { static: true }) confirmCancelRef: TemplateRef<any>;
  @ViewChild('confirmReview', { static: true }) confirmReviewRef: TemplateRef<any>;
  @ViewChild('confirmRating', { static: true }) confirmRatingRef: TemplateRef<any>;

  integration: IntegrationInfoWithStatusInterface;
  reviewFieldSet: FormSchemeField[];
  protected formStorageKey = 'reviewForm';
  cancelDialogRef: MatDialogRef<TemplateRef<any>>;
  confirmDialogRef: MatDialogRef<TemplateRef<any>>;
  currentUserRating = 0;
  formScheme: FormScheme = {
    fieldsets: {
      reviewFieldSet: [
        {
          name: 'title',
          type: 'input',
          fieldSettings: {
            required: true,
            classList: 'col-xs-12 col-sm-12 opacity-03',
          },
          inputSettings: {
            placeholder: 'Title',
            maxLength: 250,
            autocompleteAttribute: 'off',
          },
        },
        {
          name: 'text',
          type: 'textarea',
          fieldSettings: {
            required: true,
            classList: 'col-xs-12 col-sm-12 opacity-03 border-bottom',
          },
          textareaSettings: {
            placeholder: 'Description',
            maxRows: 10,
            minRows: 6,
          },
        },
      ],
    },
  };


  constructor(
    injector: Injector,
    private activatedRoute: ActivatedRoute,
    private integrationsStateService: IntegrationsStateService,
    private navigationService: NavigationService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private router: Router,
    private authService: PeAuthService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
  ) {
    super(injector);
  }

  /**
   * Load current integration, prefill rating and review
   */
  ngOnInit(): void {
    const integrationName = this.overlayData.integrationName;
    this.integrationsStateService.getIntegration(integrationName, true).pipe(
      takeUntil(this.destroyed$),
      filter(d => !!d)
    ).subscribe((integration) => {
      this.integration = integration;

      if (this.integration.reviews) {
        const currentUserId = this.authService.getUserData().uuid;
        this.integration.reviews.forEach((review) => {
          if (review.userId === currentUserId) {
            this.currentUserRating = review.rating ? review.rating : 0;
            this.form.patchValue({
              title: review.title,
              text: review.text,
            });
          }
        });
      }

      this.cdr.detectChanges();
    });
  }

  handleClose(): void {
    this.navigationService.returnBack();
  }

  /**
   * Calls cancel review dialog
   */
  cancelReview() {
    this.cancelDialogRef = this.dialog.open(this.confirmCancelRef, {
      panelClass: 'mat-dialog-micro',
    });

    this.cancelDialogRef.afterClosed().pipe(take(1)).subscribe((result) => {
      if (!result) {
        return;
      }

      const businessId = this.integrationsStateService.getBusinessId();
      this.router.navigate([
        `business/${businessId}/connect/${this.integration.category}/integrations/${this.integration.name}/fullpage`]);
    });
  }

  /**
   * Calls confirm review dialog
   */
  confirmReview() {
    const reviewObject = { ...this.form.value };
    reviewObject.rating = this.currentUserRating;
    this.integrationsStateService.addIntegrationReview(this.integration.name, reviewObject).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this.confirmDialogRef = this.dialog.open(this.confirmReviewRef, {
        panelClass: 'mat-dialog-micro',
      });

      this.confirmDialogRef.afterClosed().pipe(take(1)).subscribe(() => {
        const businessId = this.integrationsStateService.getBusinessId();
        this.router.navigate(
          [`business/${businessId}/connect/${this.integration.category}/integrations/${this.integration.name}/fullpage`]
        );
      });
    });
  }

  /**
   * Cancel review. Redirecting to app page
   */
  closeCancelDialog(confirm: boolean) {
    this.cancelDialogRef.close(confirm);
  }

  /**
   * Cancel review. Redirecting to app page
   */
  closeReviewDialog(confirm: boolean) {
    this.confirmDialogRef.close(confirm);
  }

  /**
   * Select rating and call confirmation dialog
   */
  selectRating(rating: number) {
    this.currentUserRating = rating;
  }

  /**
   * Implementing FormAbstractComponent method, creates the form
   */
  protected createForm(): void {
    this.form = this.formBuilder.group({
      title: [null, Validators.required],
      text: [null, Validators.required],
    });

    this.changeDetectorRef.detectChanges();
  }

  /**
   * Implementing FormAbstractComponent method
   */
  protected onUpdateFormData(formValues: any): void {
  }

  /**
   * Implementing FormAbstractComponent method, handle submit button click
   */
  protected onSuccess(): void {
    this.confirmReview();
  }

  /**
   * Implementing FormAbstractComponent method
   */
  protected onFormInvalid(): void {
  }
}

