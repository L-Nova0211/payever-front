import { AfterViewInit, ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import moment from 'moment';
import { parseZone } from 'moment';
import { take, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, PeDestroyService } from '@pe/common';
import { PeFilterType } from '@pe/grid';
import { TranslateService } from '@pe/i18n';
import { PeDateTimePickerService } from '@pe/ui';

import {
  RuleConditions,
  RuleFields,
} from '../../models/rules.model';

@Component({
  selector: 'pe-add-rule-when',
  templateUrl: './add-rule-when.component.html',
  styleUrls: ['./add-rule-when.component.scss'],
  providers: [PeDestroyService],
  encapsulation: ViewEncapsulation.None,
})
export class AddRuleWhenComponent implements AfterViewInit {

  @Input() theme: AppThemeEnum = null;
  @Input() ifList: RuleFields[] = [];
  @Input() showErrors = false;
  @Input() allConditions: RuleConditions[] = [];
  @Input() valuesField: AbstractControl = null;
  @Input() ruleForm: FormGroup;

  readonly PeFilterType = PeFilterType;

  typeField = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
    private dateTimePicker: PeDateTimePickerService,
    private translateService: TranslateService,
  ) { }

  get conditionList(): RuleConditions[] {
    const field = this.ifList.find(a => a.fieldName === this.ruleForm.get('field').value);

    return field?.conditions.map(b => this.allConditions.find(c => c.value === b));
  }

  get fieldIsSelected(): boolean {
    return !!this.ruleForm.get('field').value;
  }

  get field(): RuleFields {
    return this.ifList.find(a => a.fieldName === this.ruleForm.get('field')?.value)
  }

  get fieldType(): PeFilterType {
    return this.field?.type;
  }

  get typeOptionsList(): RuleConditions[] {
    return this.field?.options;
  }

  get isFormFieldInput(): boolean {
    return this.fieldType === PeFilterType.String ||
      this.fieldType === PeFilterType.Number ||
      this.fieldType === PeFilterType.Date;
  }

  get isFormFieldSelect(): boolean {
    return this.fieldType === PeFilterType.Option
  }

  ngAfterViewInit(): void {
    this.ruleForm.get('field').valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.ruleForm.get('condition').setValue(null);
      this.ruleForm.get('values').setValue([]);
    });
  }

  onAddValue(): void {
    if (!this.typeField) { return; }
    this.addChip();
    this.typeField = '';
    this.cdr.detectChanges();
  }

  onChipDelete(i: number): void {
    const types: string[] = this.valuesField.value;
    types.splice(i, 1);
    this.valuesField.setValue(types);
    this.cdr.detectChanges();
  }

  openDatepicker(event): void {
    const dialogRef = this.dateTimePicker.open(event, {
      theme: this.theme,
      config: { headerTitle: 'Select date', range: false },
    });

    dialogRef.afterClosed.pipe(
      take(1),
      tap((date) => {
        if (date?.start) {
          const formatedDate = date.start;
          this.typeField = formatedDate;
          this.onAddValue();
        }
      })
    ).subscribe();
  }

  formatValue(value: string): string {
    if (this.fieldType === PeFilterType.Date) {
      return moment(value).format('DD.MM.YYYY');
    }
    if (this.fieldType === PeFilterType.Option) {
      return this.translateService.translate(this.typeOptionsList.find(a => a.value === value)?.label);
    }

    return value;
  }

  private addChip(): void {
    let value = this.typeField.trim();

    if (this.fieldType === PeFilterType.Date) {
      value = this.fixDate(value)
    }

    const values = [...new Set([...this.valuesField.value, value])];
    this.valuesField.setValue(values);
  }

  private fixDate(date: string): string {
    const iso = parseZone(date).toISOString(true);

    return iso.split('T')[0] + 'T00:00:00.000+00:00';
  }
}
