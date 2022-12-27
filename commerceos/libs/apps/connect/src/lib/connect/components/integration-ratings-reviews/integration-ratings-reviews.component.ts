/**
 * Inner component of integration-full-page, displays the app rating & reviews
 */


import { Component, Input, TemplateRef, ViewChild, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { get } from 'lodash-es';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';

import {
  AbstractComponent, IntegrationsStateService, IntegrationInfoWithStatusInterface, IntegrationReviewInterface,
} from '../../../shared';

@Component({
  selector: 'connect-integration-ratings-reviews',
  templateUrl: './integration-ratings-reviews.component.html',
  styleUrls: ['./integration-ratings-reviews.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationRatingsReviewsComponent extends AbstractComponent implements OnChanges {

  @ViewChild('confirmRating', { static: true }) confirmRatingRef: TemplateRef<any>;
  @Input() integration: IntegrationInfoWithStatusInterface;
  confirmDialogRef: MatDialogRef<TemplateRef<any>>;
  shortReviews: IntegrationReviewInterface[];
  ratingsArray: number[] = [];
  refreshPage$: Observable<any>;
  currentUserRating = 0;

  constructor(
    private router: Router,
    private integrationsStateService: IntegrationsStateService,
    public dialog: MatDialog,
    private authService: PeAuthService
  ) {
    super();
  }

  ngOnChanges() {
    if (this.integration.reviews) {
      this.shortReviews = this.integration.reviews.slice(0, 2);
      const currentUserId = this.authService.getUserData().uuid;
      this.integration.reviews.forEach((review) => {
        if (review.userId === currentUserId) {
          this.currentUserRating = review.rating;
        }
      });
    }

    for (const rating in this.integration.ratingsPerRate) {
      if (this.integration.ratingsPerRate.hasOwnProperty(rating)) {
        this.ratingsArray[Number(rating) - 1] = this.integration.ratingsPerRate[rating];
        this.ratingsArray = [...this.ratingsArray];
      }
    }
  }

  /**
   * Navigate to other page
   * @param route - url
   */
  navigate(route: string) {
    const businessId = this.integrationsStateService.getBusinessId();
    this.router.navigate([
      `business/${businessId}/connect/${this.integration.category}/integrations/${this.integration.name}/${route}`]);
  }

  /**
   * If current integration is installed
   */
  get installed(): boolean {
    return get(this.integration, '_status.installed');
  }


  /**
   * Select rating and call confirmation dialog
   */
  selectRating(rating: number) {
    this.integrationsStateService.rateIntegration(
      this.integration.name, rating).pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.confirmDialogRef = this.dialog.open(this.confirmRatingRef, {
        panelClass: 'mat-dialog-micro',
      });
    });
  }

  /**
   * Confirm rating dialog
   */
  confirmRatingDialog() {
    this.dialog.closeAll();
  }

}
