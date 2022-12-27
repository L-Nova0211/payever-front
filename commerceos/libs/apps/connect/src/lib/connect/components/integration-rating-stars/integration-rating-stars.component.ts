/**
 * Component of rating selection
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';

import { AbstractComponent } from '../../../shared';

@Component({
  selector: 'connect-integration-rating-stars',
  templateUrl: './integration-rating-stars.component.html',
  styleUrls: ['./integration-rating-stars.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationRatingStarsComponent extends AbstractComponent implements OnChanges {

  EMPTY_STAR = '#icon-empty-star';
  FILLED_STAR = '#icon-filled-star';

  @Input() decimalMode = false;
  @Input() currentRating = 0;
  @Input() maxRating = 5;
  @Input() readonly = false;
  @Input() iconClass = 'icon-16';
  @Output() selectRating: EventEmitter<number> = new EventEmitter<number>();

  private starsElement: ElementRef;

  @ViewChild('stars', { read: ElementRef }) set stars(stars: ElementRef) {
    setTimeout(() => {
      this.starsElement = stars;
      if (stars) {
        this.filledInStarsContainerWidth =
        this.currentRating / this.maxRating * this.starsElement.nativeElement.clientWidth;
      }

      this.cdr.detectChanges();
    }, 0);
  }

  filledInStarsContainerWidth = 0;
  starsArray: string[] = Array(this.maxRating).fill(this.EMPTY_STAR);
  hoverHelperArray: string[] = [];

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.currentRating && changes.currentRating.currentValue) {
      this.fillArray();
    } else if (changes.maxRating && changes.maxRating.currentValue) {
      this.fillArray();
    }
  }

  /**
   * Handle mouseover event from stars
   * @param value - selected star
   */
  onMouseover(value: number) {
    return !this.readonly && this.drawRating(value);
  }

  /**
   * Handle mouseleave event from stars container
   */
  onMouseleave() {
    return !this.readonly && this.resetDrawnRating();
  }

  /**
   * Handle click on star
   * @param value - clicked star index
   */
  onItemClick(value: number) {
    return !this.readonly && this.setRating(value);
  }

  /**
   * Set rating by clicking on star
   * @param value - clicked star index
   */
  setRating(value: number): void {
    this.currentRating = value + 1;
    this.fillArray();
    this.hoverHelperArray = [...this.starsArray];
    this.selectRating.emit(this.currentRating);
  }

  /**
   * Fill stars on mouseover events
   * @param value - selected rating
   */
  drawRating(value: number) {
    if (!this.hoverHelperArray.length) {
      this.hoverHelperArray = [...this.starsArray];
    }
    this.fillArray(value + 1);
  }

  /**
   * Resets rating to real value after it was drawn
   */
  resetDrawnRating() {
    if (!this.hoverHelperArray.length) {
      this.fillArray(this.currentRating);
    } else {
      this.starsArray = [...this.hoverHelperArray];
    }
    this.hoverHelperArray = [];
  }

  /**
   * Fill displayed stars array
   * @param rating - how much stars need to be filled
   */
  fillArray(rating: number = null) {
    if (rating === null) {
      rating = this.currentRating;
    }
    this.starsArray = [];
    for (let i = 0; i < this.maxRating; i++) {
      if (i < rating) {
        this.starsArray.push(this.FILLED_STAR);
      } else {
        this.starsArray.push(this.EMPTY_STAR);
      }
    }
  }
}
