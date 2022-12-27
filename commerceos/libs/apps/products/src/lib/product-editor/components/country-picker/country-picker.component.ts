import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { first, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { CountryArrayInterface } from '@pe/forms-core';

import { PickerBaseDirective } from '../../../misc/classes/picker-base.class';
import { CountryService } from '../../services/country.service';

@Component({
  selector: 'pe-country-picker',
  templateUrl: './country-picker.component.html',
  styleUrls: ['./country-picker.component.scss'],
  providers: [
    PeDestroyService,
  ],
})

export class CountryPickerComponent extends PickerBaseDirective implements OnInit, AfterViewInit {
  @ViewChild('virtualScroll', { static: false }) virtualScroll: CdkVirtualScrollViewport;

  countries: CountryArrayInterface[] = [];
  selected: CountryArrayInterface = null;

  constructor(
    private countryService: CountryService,
    private destroy$: PeDestroyService,
    protected injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.countries = this.route.snapshot.parent.data.countries;
    this.selected = this.countryService.country;
  }

  ngAfterViewInit(): void {
    this.virtualScroll.renderedRangeStream.pipe(
      first(),
      tap(() => {
        if (this.countryService.selectedIndex) {
          setTimeout(() => {
            this.virtualScroll.scrollToIndex(this.countryService.selectedIndex);
          })
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  trackByCode(i: number, item: CountryArrayInterface): string {
    return item.code;
  }

  onSubmit(): void {
    this.countryService.saved$.next(this.selected);
    this.closePicker();
  }

  onSelect(item: CountryArrayInterface): void {
    this.selected = item;
  }
}
