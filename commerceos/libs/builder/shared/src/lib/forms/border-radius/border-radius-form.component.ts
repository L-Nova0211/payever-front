import { ChangeDetectionStrategy, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { filter, first, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { PebBorderRadiusFormService } from './border-radius-form.service';


@Component({
  selector: 'peb-border-radius-form',
  templateUrl: './border-radius-form.component.html',
  styleUrls: ['./border-radius-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebBorderRadiusForm implements OnInit {

  borderRadiusForm = this.formBuilder.group({ borderRadius: 0 });

  max$ = new BehaviorSubject<number>(null);

  constructor(
    private readonly borderRadiusFormService: PebBorderRadiusFormService,
    private readonly destroy$: PeDestroyService,
    private readonly formBuilder: FormBuilder,
    private readonly ngZone: NgZone,
  ) {
  }

  ngOnInit(): void {
    this.ngZone.onStable.pipe(
      first(),
      switchMap(() => this.borderRadiusFormService.style$.pipe(
        tap((style) => {
          this.borderRadiusForm.setValue({ borderRadius: style.borderRadius || 0 });
          this.borderRadiusForm.markAsPristine();
          this.borderRadiusForm.markAsUntouched();

          this.max$.next(style.max);
        }),
        switchMap(() => this.borderRadiusForm.valueChanges),
        filter(() => this.borderRadiusForm.dirty),
        tap(() => {
          this.borderRadiusForm.markAsPristine();
        }),
        switchMap(value =>
          this.borderRadiusFormService.setBorderRadius(value.borderRadius, this.borderRadiusForm.touched).pipe(take(1))
        ),
        tap(() => {
          if (this.borderRadiusForm.touched) {
            this.borderRadiusForm.markAsUntouched();
          }
        }),
        takeUntil(this.destroy$),
      )),
    ).subscribe();
  }

  change() {
    this.borderRadiusForm.markAsDirty();
    this.borderRadiusForm.markAsTouched();
    this.borderRadiusForm.patchValue(this.borderRadiusForm.value);
  }
}
