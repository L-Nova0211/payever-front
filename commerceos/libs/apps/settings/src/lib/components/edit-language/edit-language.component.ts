import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';

import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';

import { ApiService } from '../../services';
import { AbstractComponent } from '../abstract';

@Component({
  selector: 'peb-edit-language',
  templateUrl: './edit-language.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditLanguageComponent extends AbstractComponent implements OnInit {
  languages = [];
  theme;
  language;
  languageForm: FormGroup;
  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private peOverlayRef: PeOverlayRef,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.theme = this.overlayConfig.theme;
    if (this.overlayData.data.languages) {
      this.languages = this.overlayData.data.languages;
      this.language = this.overlayData.data.language;
      this.languageForm =  this.formBuilder.group({
        language: [this.languages],
      });
      this.languageForm.get('language').setValue(this.language);
      this.cdr.detectChanges();
    }

    this.languageForm.get('language').valueChanges.subscribe((res) => {
      if (res !== this.language) {
        this.language = res;
      }
    });

    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.onCheckValidity();
    });
  }

  onCheckValidity() {
    const value = this.languageForm.controls;
    value.language.setValidators([Validators.required]);
    value.language.updateValueAndValidity();
    this.cdr.detectChanges();

    if (this.languageForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    if (this.languageForm.valid) {
      this.peOverlayRef.close({ data: this.languageForm.controls.language.value });
    }
  }
}
