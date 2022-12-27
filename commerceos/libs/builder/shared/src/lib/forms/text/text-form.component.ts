import { ChangeDetectionStrategy, Component, Input, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApmService } from '@elastic/apm-rum-angular';
import { EMPTY } from 'rxjs';
import { catchError, filter, first, map, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import { PebTextJustify, PebTextVerticalAlign } from '@pe/builder-core';
import { PebEditorAccessorService } from '@pe/builder-services';
import { PEB_DEFAULT_TEXT_STYLE } from '@pe/builder-text-editor';
import { PeDestroyService } from '@pe/common';

import { RGBA } from '../../form-control/color-picker/formats';
import { PebColorForm } from '../color/color.form';

import { PebFontListComponent } from './font-list.component';
import { PebTextFormService } from './text-form.service';


export interface PebTextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
}

export class PebTextStyleDto {
  fontWeight?: number;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;

  constructor(value: PebTextStyle) {
    Object.entries(value).forEach(([key, val]) => {
      switch (key) {
        case 'bold':
          this.fontWeight = val ? 700 : 400;
          break;
        case 'italic':
          this.italic = val;
          break;
        case 'underline':
          this.underline = val;
          break;
        case 'strike':
          this.strike = val;
          break;
      }
    });
  }
}

@Component({
  selector: 'peb-text-form',
  templateUrl: './text-form.component.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './text-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebTextForm implements OnInit {
  @Input() title = 'Font';

  textForm = this.formBuilder.group(PEB_DEFAULT_TEXT_STYLE);

  fontStyleForm = new FormGroup({
    bold: new FormControl(),
    italic: new FormControl(),
    underline: new FormControl(),
    strike: new FormControl(),
  });

  justify = PebTextJustify;
  align = PebTextVerticalAlign;

  textColor$ = this.textForm.get('color').valueChanges.pipe(
    map(color => ({ backgroundColor: Array.isArray(color) ? null : color })),
  );

  fontFamily$ = this.textForm.get('fontFamily').valueChanges.pipe(
    map(fontFamily => Array.isArray(fontFamily) ? 'Multiple Fonts' : fontFamily),
  );

  // Latest style changes for debug
  latestStyles;

  constructor(
    private readonly editorAccessorService: PebEditorAccessorService,
    private readonly formBuilder: FormBuilder,
    private readonly textFormService: PebTextFormService,
    private readonly destroy$: PeDestroyService,
    private readonly ngZone: NgZone,
    private readonly apmService: ApmService,
  ) {
  }

  ngOnInit() {
    this.ngZone.onStable.pipe(
      first(),
      switchMap(() => this.textFormService.textStyle$.pipe(
        tap((styles) => {
          this.latestStyles = styles;
          this.textForm.setValue(styles);
          this.textForm.markAsPristine();
          this.textForm.markAsUntouched();
        }),
        switchMap(() => this.textForm.valueChanges),
        filter(() => this.textForm.dirty),
        map(value => Object.entries(value).reduce((acc, [key, val]) =>
          this.textForm.get(key).dirty ? { ...acc, [key]: val } : acc, {})),
        tap((value) => {
          this.textForm.markAsPristine();
        }),
        switchMap(value => this.textFormService.setTextStyles(value, this.textForm.touched).pipe(take(1))),
        tap(() => {
          if (this.textForm.touched) {
            this.textForm.markAsUntouched();
          }
        }),
        catchError((err: Error) => {
          console.error(err);
          this.apmService.apm.captureError(
            `Error in text-form component:
            Latest value: ${JSON.stringify(this.latestStyles)}
            Text Form value: ${JSON.stringify(this.textForm.value)}
            Error: ${err}
            Stack: ${err.stack}`,
          );

          return EMPTY;
        }),
        takeUntil(this.destroy$),
      )),
    ).subscribe();

    this.textForm.valueChanges.pipe(
      startWith(this.textForm.value),
      map(({ fontWeight, italic, underline, strike }) => ({
        bold: Array.isArray(fontWeight) ? false : fontWeight > 400,
        italic: Array.isArray(italic) ? false : italic,
        underline: Array.isArray(underline) ? false : underline,
        strike: Array.isArray(strike) ? false : strike,
      })),
      tap((value) => {
        this.fontStyleForm.markAsPristine();
        this.fontStyleForm.patchValue(value, { emitEvent: false });
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.fontStyleForm.valueChanges.pipe(
      filter(() => this.fontStyleForm.dirty),
      map(value => Object.entries(value).reduce((acc, [key, val]) =>
        this.fontStyleForm.get(key).dirty ? { ...acc, [key]: val } : acc, {} as PebTextStyle)),
      map<PebTextStyle, PebTextStyleDto>(value => new PebTextStyleDto(value)),
      tap((value) => {
        Object.keys(value).forEach((key) => {
          const ctrl = this.textForm.get(key);
          ctrl.markAsDirty();
          ctrl.markAsTouched();
        });
        this.fontStyleForm.markAsUntouched();
        this.fontStyleForm.markAsPristine();
        this.textForm.patchValue(value);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  showTextColorForm() {
    const editor = this.editorAccessorService.editorComponent;
    editor.detail = { back: 'Style', title: 'Color' };
    const sidebarCmpRef = editor.insertToSlot(PebColorForm, PebEditorSlot.sidebarDetail);
    const control = new FormControl();
    sidebarCmpRef.instance.formControl = control;
    const color = this.textForm.get('color').value;
    control.patchValue(Array.isArray(color) ? new RGBA(255, 255, 255, 1) : color, { emitEvent: false });

    control.valueChanges.pipe(
      tap((value) => {
        const ctrl = this.textForm.get('color');
        if (control.touched) {
          ctrl.markAsTouched();
          control.markAsUntouched();
        }
        ctrl.markAsDirty();
        ctrl.patchValue(value);
      }),
      takeUntil(sidebarCmpRef.instance.destroy$),
    ).subscribe();
  }

  showFontsList() {
    const editor = this.editorAccessorService.editorComponent;
    editor.detail = { back: 'Style', title: 'Font Family' };
    const sidebarCmpRef = editor.insertToSlot(PebFontListComponent, PebEditorSlot.sidebarDetail);
    const control = new FormControl();
    sidebarCmpRef.instance.formControl = control;
    const formValue = this.textForm.value;
    control.patchValue(formValue, { emitEvent: false });
    control.valueChanges.pipe(
      tap((value) => {
        Object.keys(value).forEach((key) => {
          const ctrl = this.textForm.get(key);
          ctrl.markAsDirty();
          ctrl.markAsTouched();
        });

        this.textForm.patchValue(value);
      }),
      takeUntil(sidebarCmpRef.instance.destroy$),
    ).subscribe();
  }
}
