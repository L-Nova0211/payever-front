import { ChangeDetectionStrategy, Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { isEqual } from 'lodash';
import { animationFrameScheduler, asyncScheduler, BehaviorSubject, merge, of, ReplaySubject, throwError } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  first,
  map, observeOn,
  switchMap,
  take,
  takeUntil,
  tap,
  throttleTime,
} from 'rxjs/operators';

import { PebInteractionType } from '@pe/builder-core';
import { AppType, PeDestroyService } from '@pe/common';

import { linkFormOptions } from './link-form.constants';
import { PebLinkFormOptions } from './link-form.interface';
import { PebLinkFormService } from './link-form.service';

const pluralAppType: { [appType: string]: string } = {
  [AppType.Pos]: 'POS',
};

@Component({
  selector: 'peb-link-form',
  templateUrl: './link-form.component.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './link-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebLinkForm implements OnInit {

  private readonly optionsSubject$ = new BehaviorSubject<PebLinkFormOptions[]>([]);
  readonly options$ = this.optionsSubject$.asObservable();
  get options() {
    return this.optionsSubject$.getValue();
  }

  customFields = new FormGroup({});
  typeControl = new FormControl('none');

  linkForm = new FormGroup({
    type: this.typeControl,
    payload: this.customFields,
  });

  payload$ = this.options$.pipe(
    filter(options => !!options?.length),
    switchMap(() => this.typeControl.valueChanges),
    filter(type => !!type),
    switchMap((type) => {
      const payload = this.options.find(opt => opt.value === type)?.payload;
      if (payload && [PebInteractionType.OverlayOpenPage, PebInteractionType.NavigateInternal].includes(type)) {

        return this.linkFormService.routes$.pipe(
          map(routes => ([{
            ...payload[0],
            options: routes[type],
          }])),
        );
      }

      return of(payload);
    }),
  );

  email$ = this.typeControl.valueChanges.pipe(
    map(type => type === PebInteractionType.NavigateEmail),
  );

  lastActiveInput$ = new ReplaySubject<HTMLInputElement>(1);

  constructor(
    private readonly linkFormService: PebLinkFormService,
    private readonly destroy$: PeDestroyService,
    private readonly ngZone: NgZone,
  ) {
  }

  ngOnInit() {
    this.linkFormService.applications$.pipe(
      tap((applications) => {
        const options = Object.entries(applications).reduce((acc, [appType, apps]) => {
          if (apps?.length) {
            const label = appType.charAt(0).toUpperCase() + appType.substr(1);
            acc.push({
              name: label,
              value: `${PebInteractionType.NavigateApplicationLink}:${appType}`,
              payload: [
                {
                  label: `All ${pluralAppType[appType] || `${label}s`}`,
                  type: 'select',
                  options: apps.map(app => ({
                    name: app.name,
                    value: app.id,
                  })),
                  controlName: 'application',
                },
                {
                  type: 'input',
                  controlName: 'url',
                  changeType: 'keyup',
                  placeholder: `/url`,
                  valuePrefix: '/',
                },
              ],
            });
          }

          return acc;
        }, []);


        this.optionsSubject$.next([...linkFormOptions, ...options]);
      }),
      catchError((err) => {
        this.optionsSubject$.next(linkFormOptions);

        return throwError(err);
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    const typeChanged$ = this.typeControl.valueChanges.pipe(
      filter(() => this.typeControl.dirty),
      tap((type) => {
        const payload = this.options.find(opt => opt.value === type).payload?.reduce((acc, curr) => {
          acc[curr.controlName] = null;

          return acc;
        }, {});
        this.initForm(payload || {});

        if (type === PebInteractionType.OverlayClose) {
          this.linkForm.get('payload').markAsDirty();
          this.linkForm.get('payload').markAsTouched();

          return;
        }

        this.linkForm.get('payload').markAsPristine();
        this.linkForm.get('payload').markAsUntouched();
      }),
      map(value => ({ type: value, payload: null })),
    );

    const payloadChanged$ = this.linkForm.valueChanges.pipe(
      map(value => value.payload),
      distinctUntilChanged(isEqual),
      tap(() => {
        this.lastActiveInput$.next(document.activeElement as HTMLInputElement);
      }),
      map(value => ({ type: this.typeControl.value, payload: value })),
      filter(() => this.linkForm.get('payload').dirty && this.linkForm.valid),
      filter(({ type, payload }) =>
        // application link change should be emitted if all values are truthy
        type?.split(':')[0] !== PebInteractionType.NavigateApplicationLink ||
        (payload && Object.values(payload).every(v => !!v))),
    );

    const linkChanged$ = merge(typeChanged$, payloadChanged$).pipe(
      map((value) => {
        if (this.typeControl.dirty && value.type === 'none') {
          return { type: 'none', payload: {} };
        }

        if (this.linkForm.get('payload').dirty) {
          return value;
        }

        return undefined;
      }),
      filter(value => value !== undefined),
      tap(() => {
        this.linkForm.markAsTouched();
      }),
    );

    this.ngZone.onStable.pipe(
      first(),
      switchMap(() => this.options$.pipe(
        filter(opts => !!opts.length)),
      ),
      observeOn(asyncScheduler),
      switchMap(() => this.linkFormService.textStyle$.pipe(
        distinctUntilChanged(isEqual),
        tap((link) => {
          this.initForm(link?.payload);
          const value = Array.isArray(link)
            ? { type: null, payload: {} }
            : link
              ? { type: link.type, payload: link.payload ?? {} }
              : { type: 'none', payload: {} };
          this.linkForm.setValue(value);
          this.linkForm.markAsPristine();
          this.linkForm.markAsUntouched();
        }),
        switchMap(() => linkChanged$),
        filter(() => this.linkForm.dirty),
        tap(() => {
          this.linkForm.markAsPristine();
        }),
        map(value => value.type === 'none' ? null : value),
        switchMap(value => this.linkFormService.setTextStyles({ link: value }, this.linkForm.touched).pipe(take(1))),
        tap(() => {
          if (this.linkForm.touched) {
            this.linkForm.markAsUntouched();
          }
        }),
        throttleTime(50, animationFrameScheduler, { leading: false, trailing: true }),
        switchMap(() =>
          this.lastActiveInput$.pipe(
            tap((inputField) => {
              inputField.focus();
            }),
          ),
        ),
        takeUntil(this.destroy$),
      )),
    ).subscribe();
  }

  initForm(payload?: any): void {
    Object.keys(this.customFields.controls).forEach((name) => {
      if (!payload?.hasOwnProperty(name)) {
        this.customFields.removeControl(name);
      }
    });
    if (payload) {
      Object.keys(payload).forEach((value) => {
        const control = this.customFields.get(value);
        if (control) {
          control.patchValue(null);
        } else {
          this.customFields.addControl(
            value,
            new FormControl(
              null
            ),
          );
        }
      });
    }

    this.linkForm.setControl('payload', this.customFields);
  }
}
