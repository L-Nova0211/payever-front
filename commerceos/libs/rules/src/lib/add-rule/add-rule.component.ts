import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { isEqual } from 'lodash-es';
import moment from 'moment';
import { combineLatest, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, skip, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService, PeDestroyService } from '@pe/common';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA, PeOverlayWidgetService } from '@pe/overlay-widget';

import { RuleDatePickerComponent } from '../components/datepicker/rule-datepicker';
import {
  ActionType,
  RuleAppAction,
  RuleChannels,
  RuleConditions,
  RuleFields,
  RuleFolder,
  RuleOverlayData,
  START_LIST,
} from '../models/rules.model';
import { RuleObservableService } from '../services/rule-observable.service';

@Component({
  selector: 'pe-add-rule',
  templateUrl: './add-rule.component.html',
  styleUrls: ['./add-rule.component.scss'],
  providers: [PeDestroyService],
  encapsulation: ViewEncapsulation.None,
})
export class AddRuleComponent implements OnInit {
  ruleForm: FormGroup;
  ifList: RuleFields[] = [];
  conditionList: RuleConditions[] = [];
  actionList: RuleAppAction[] = [];
  channelList: RuleChannels[] = [];
  startList = START_LIST;
  folderList: RuleFolder[] = [];
  type = '';
  showErrors = false;
  theme = this.envService.businessData?.themeSettings?.theme ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme] :
    AppThemeEnum.default;

  timMask = [/\d/, /\d/, ':', /\d/, /\d/];

  dateControl = new FormControl('', {
    validators: Validators.required,
  });

  timeControl = new FormControl('', {
    validators: [Validators.required, Validators.pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)],
    updateOn: 'change',
  });

  private ruleSnapshot = {};
  private startSubscription: Subscription;
  private dateTimeSubscription: Subscription;

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: RuleOverlayData,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    private overlayWidgetService: PeOverlayWidgetService,
    private observableService: RuleObservableService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private envService: EnvService,
    private destroy$: PeDestroyService,
    private matDialog: MatDialog,
  ) { }

  get valuesField(): AbstractControl {
    return this.ruleForm.get('values');
  }

  get actionFiled(): AbstractControl {
    return this.ruleForm.get('action');
  }

  get folderIdField(): AbstractControl {
    return this.ruleForm.get('folderId');
  }

  get startField(): AbstractControl {
    return this.ruleForm.get('start');
  }

  get startTimeField(): AbstractControl {
    return this.ruleForm.get('startTime');
  }

  ngOnInit(): void {
    this.ifList = this.overlayData.fields;
    this.conditionList = this.overlayData.conditions;
    this.folderList = this.overlayData.folders;
    this.actionList = this.overlayData.actions;
    this.channelList = this.overlayData.channels;
    this.buildForm();
    this.saveSubscribe();
    this.cdr.detectChanges();
  }

  onOpenDatepicker(event: MouseEvent): void {
    this.matDialog.open(RuleDatePickerComponent).afterClosed()
      .pipe(
        takeUntil(this.destroy$),
        tap((value) => {
          if (value) {
            const date = moment(value).format('DD/MM/YYYY');
            this.dateControl.setValue(date);
          }
        }),
      ).subscribe();
  }

  onChangeTime(value: string): void {
    this.timeControl.setValue(value);
  }

  private buildForm(): void {
    this.ruleForm = this.fb.group({
      _id: [this.overlayData.rule?._id || null],
      name: [this.overlayData.action === ActionType.Duplicate ? null : this.overlayData.rule?.name || null, Validators.required],
      description: [this.overlayData.rule?.description || null, Validators.required],
      field: [this.overlayData.rule?.field || null, Validators.required],
      condition: [this.overlayData.rule?.condition || null, Validators.required],
      values: [this.overlayData.rule?.values || [], Validators.required],
      action: [this.overlayData.rule?.action || null, Validators.required],
      folderId: [this.overlayData.rule?.folderId || null, Validators.required],
    });

    this.actionSubscribe();
    this.ruleSnapshot = this.ruleForm.value;
  }

  private actionSubscribe(): void {
    this.actionFiled.valueChanges.pipe(
      tap(value => {
        if (value === 'send') {
          this.createSendControls();
          this.folderIdField.reset();
          this.folderIdField.clearValidators();

          this.startSubscribe();
        } else {
          this.removeSendControls();
          this.folderIdField.setValidators(Validators.required);
          this.dateControl.reset();
          this.timeControl.reset();
          this.startSubscription?.unsubscribe();
        }
        this.folderIdField.updateValueAndValidity();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private startSubscribe(): void {
    this.startSubscription = this.startField.valueChanges.pipe(
      tap(value => {
        if (value === 'immediately') {
          this.startTimeField.clearValidators();
          this.dateTimeSubscription?.unsubscribe()
        } else {
          this.startTimeField.setValidators(Validators.required);
          this.dateTimeSubscribe();
        }
        this.startTimeField.updateValueAndValidity();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private dateTimeSubscribe(): void {
    this.dateTimeSubscription = combineLatest([
      this.dateControl.valueChanges.pipe(
        distinctUntilChanged()
      ),
      this.timeControl.valueChanges.pipe(
        distinctUntilChanged()
      ),
    ]).pipe(
      filter(() => this.dateControl.valid && this.timeControl.valid),
      takeUntil(this.destroy$),
    ).subscribe({
      next: (([date, time]) => {
        if (date && time) {
          const [hour, minute] = time.split(':');
          const newDate = date.split('/').reverse().join('/');
          this.startTimeField.setValue(moment(newDate).set({
            hour,
            minute,
          }).toDate())
        }
      }),
    });
  }

  private createSendControls(): void {
    this.ruleForm.addControl('start', new FormControl(this.overlayData.rule?.start || null, Validators.required));
    this.ruleForm.addControl('channel', new FormControl(this.overlayData.rule?.channel || null, Validators.required));
    this.ruleForm.addControl('startTime', new FormControl(this.overlayData.rule?.startTime || null));
  }

  private removeSendControls(): void {
    this.ruleForm.removeControl('start');
    this.ruleForm.removeControl('channel');
    this.ruleForm.removeControl('startTime');
  }

  private saveSubscribe(): void {
    this.overlayConfig.onSave$.pipe(
      skip(1),
      takeUntil(this.destroy$)
    )
      .subscribe(done => {
        if (!done) {
          this.observableService.rule = null;

          return;
        }
        this.ruleForm.updateValueAndValidity();
        if (this.ruleForm.invalid) {
          this.showErrors = true;
        } else {
          if (!isEqual(this.ruleSnapshot, this.ruleForm.value)) {
            this.observableService.rule = {
              ruleData: this.ruleForm.value,
              action: this.overlayData.action,
            };
          }
          this.overlayWidgetService.close()
        }
      })
  }
}
