import {
  ChangeDetectorRef,
  Component, EventEmitter, Input,
  OnInit, Output,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forEach, assign, keys, reduce } from 'lodash-es';
import { Observable } from 'rxjs';

import { FormSchemeField as BaseFormSchemeField } from '@pe/forms';
import { SnackbarService } from '@pe/snackbar';

import {
  InfoBoxActionInterface,
  InfoBoxSettingsInterface,
  InfoBoxSettingsInfoBoxTypeInterface,
  InfoBoxSettingsConfirmTypeInterface,
  InfoBoxSettingsContentInterface,
  PeListCellType,
  PeListCellToggleInterface,
  ActionInterface, AccordionPanelInterface, HandlePayeverFieldsSaveCallback,
} from '../../interfaces';
import { ThirdPartyGeneratorService } from '../../services';
import {
  DynamicInfoBoxGeneratorFormData,
  InfoBoxGeneratorFormComponent,
} from '../info-box-generator-form/info-box-generator-form.component';

interface FormSchemeField extends BaseFormSchemeField {
  asyncSave?: boolean;
}

@Component({
  selector: 'pe-info-box-generator',
  templateUrl: './info-box-generator.component.html',
  styleUrls: ['./info-box-generator.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InfoBoxGeneratorComponent implements OnInit {
  formLoading: boolean;
  showSpinnerForAction: string;
  settings: InfoBoxSettingsInterface;
  settingsNonFormSaved: InfoBoxSettingsInterface;
  leftActions: InfoBoxActionInterface[];
  rightActions: InfoBoxActionInterface[];
  submittedForm: FormGroup;

  showForm: boolean;
  fieldset: FormSchemeField[];
  fieldsetData: DynamicInfoBoxGeneratorFormData;
  payeverFieldsData: {} = {};
  listCelTypes: typeof PeListCellType = PeListCellType;

  isShowDebugButtonText = false;

  @Input() baseApiUrl: string;
  @Input() baseApiData: any = {};
  @Input() withHeader = true;
  @Input() expandedIndex: number = null;
  @Input() handlePayeverFieldsSaveCallback: HandlePayeverFieldsSaveCallback = null;
  @Input('payeverFieldsData') set setPayeverFieldsData(payeverFieldsData: {}) {
    forEach(payeverFieldsData, (value: any, key: string) => {
      if (key.indexOf('pe_') !== 0) {
        console.error('Keys in payeverFieldsData must start with "pe_"');
        delete payeverFieldsData[key];
      }
    });
    this.payeverFieldsData = payeverFieldsData;
  }

  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

  @ViewChildren(InfoBoxGeneratorFormComponent) infoBoxGeneratorForms: QueryList<InfoBoxGeneratorFormComponent>;
  @ViewChild('infoBoxGeneratorForm') infoBoxGeneratorForm: InfoBoxGeneratorFormComponent;
  // TODO: check if this.form is necessary
  get form(): FormGroup {
    return this.infoBoxGeneratorForm ? this.infoBoxGeneratorForm.form : null;
  }

  private get firstSubmitAction(): InfoBoxActionInterface {
    let resultAction: InfoBoxActionInterface;
    if (this.leftActions) {
      resultAction = this.leftActions.concat(this.rightActions).find((action: InfoBoxActionInterface) =>
      action.isSubmit);
    }

    return resultAction;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBarService: SnackbarService,
    private thirdPartyGeneratorService: ThirdPartyGeneratorService
  ) {
  }

  get infoBoxSettings(): InfoBoxSettingsInfoBoxTypeInterface {
    return this.settings as InfoBoxSettingsInfoBoxTypeInterface;
  }

  get confirmSettings(): InfoBoxSettingsConfirmTypeInterface {
    return this.settings as InfoBoxSettingsConfirmTypeInterface;
  }

  ngOnInit(): void {
    this.startThirdParty();
  }

  startThirdParty(): void {
    this.sendRequest({ actionId: 'start' }, []);
  }

  btnDebug(text: string): string {
    return this.isShowDebugButtonText ? `<strong>&lt;${text}&gt;</strong>` : '';
  }

  updateActions(actions: InfoBoxActionInterface[]): void {
    this.leftActions = actions.filter(action => action.align === 'left');
    this.rightActions = actions.filter(action => action.align === 'right');
  }

  getSearchAction(): InfoBoxActionInterface {
    const searchAction: InfoBoxActionInterface = this.rightActions && this.rightActions[1];

    return searchAction && searchAction.text === 'Search' ? searchAction : null; // TODO need to change 'Search'
  }

  onFormChange(event: any, fieldset: FormSchemeField[], index: number = null): void {
    this.submittedForm = this.getSubmittedFormByIndex(index);
    const accordion = this.infoBoxSettings.content.accordion[index];
    const action: InfoBoxActionInterface = accordion ? accordion.action : null;
    if (this.hasAsyncField(fieldset)) {
      if (action) {
        this.submittedForm = this.getSubmittedForm(action.actionId);
        this.performAction(action, fieldset, true);
      } else {
        const searchAction: InfoBoxActionInterface = this.getSearchAction();
        if (searchAction) {
          // TODO: check if this crunch is necessary
          const data: any = this.form && this.form.value;
          if (data && data.number && data.number.length !== 2 && data.number.length !== 1) {
            this.performAction(searchAction, fieldset, true);
          }
        } else {
          const firstSubmitAction: InfoBoxActionInterface = this.firstSubmitAction;
          if (firstSubmitAction) {
            this.performAction(firstSubmitAction, fieldset, true);
          }
        }
      }
      this.performPayeverAction(fieldset, true);
    }
  }

  onFormSubmit(event: any, fieldset: FormSchemeField[], index: number = null): void {
    this.submittedForm = this.getSubmittedFormByIndex(index);
    const accordion = this.infoBoxSettings.content.accordion[index];
    const action: InfoBoxActionInterface = accordion ? accordion.action : null;
    if (action) {
      this.performAction(action, fieldset);
    } else {
      const searchAction: InfoBoxActionInterface = this.getSearchAction();
      if (searchAction) {
        // TODO: check if this crunch is necessary
        const data: any = this.form && this.form.value;
        if (data && data.number && data.number.length !== 2 && data.number.length !== 1) {
          this.performAction(searchAction, fieldset);
        }
      } else {
        const firstSubmitAction: InfoBoxActionInterface = this.firstSubmitAction;
        if (firstSubmitAction) {
          this.performAction(firstSubmitAction, fieldset);
        }
      }
    }
    this.performPayeverAction(fieldset);
  }

  performRedirectClick(event: any, action: InfoBoxActionInterface): void {
    this.showSpinnerForAction = action.apiUrl;
    window.top.location.href = action.apiUrl;
  }

  performAction(action: ActionInterface, fieldset: FormSchemeField[], onlyForAsyncFields: boolean = false): void {
    this.formLoading = true;
    this.showSpinnerForAction = action.apiUrl || action.actionId;

    if (this.submittedForm) {
      if (action.isSubmit && this.submittedForm.invalid) {
        return;
      }
    } else {
      if (action.isSubmit && this.form && this.form.invalid) {
        return;
      }
    }
    this.sendRequest(action, fieldset, onlyForAsyncFields);
  }

  isAsyncField(key: string, fieldset: FormSchemeField[]): boolean {
    const field: FormSchemeField = fieldset ? fieldset.find(f => f.name === key) : null;

    return field && field.asyncSave;
  }

  hasAsyncField(fieldset: FormSchemeField[]): boolean {
    return !!fieldset.find(f => f.asyncSave);
  }

  performPayeverAction(fieldset: FormSchemeField[], onlyForAsyncFields: boolean = false): void {
    // This is for payever fields, that have 'pe_' prefix.
    let data: {} = this.submittedForm ? this.submittedForm.value : this.form ? this.form.value : {};

    data = reduce(data, (result: {}, value: any, key: string) => {
      if (onlyForAsyncFields && this.isAsyncField(key, fieldset)) {
        result[key] = value;
      } else if (!onlyForAsyncFields && !this.isAsyncField(key, fieldset)) {
        result[key] = value;
      }

      return result;
    }, {});

    data = reduce(data, (result: {}, value: any, key: string) => {
      // Keep only values prefixed with 'pe_'
      if (key.indexOf('pe_') === 0) {
        result[key] = value;
      }

      return result;
    }, {});

    if (keys(data).length > 0) {
      if (this.handlePayeverFieldsSaveCallback) {
        this.handlePayeverFieldsSaveCallback(data).subscribe(() => {
          this.cdr.detectChanges();
        });
      }
    }
  }

  performToggleAction(cell: PeListCellToggleInterface, fieldset: FormSchemeField[]): void {
    if (cell.checked) {
      this.performAction(cell.actionToggleOff, fieldset);
    } else {
      this.performAction(cell.actionToggleOn, fieldset);
    }
  }

  sendRequest({ actionId, apiUrl }: ActionInterface, fieldset: FormSchemeField[], onlyForAsyncFields: boolean = false): void {
    const formValue: {} = this.submittedForm ? this.submittedForm.value : this.form ? this.form.value : {};
    let data: {} = Object.assign({}, this.activatedRoute.snapshot.queryParams, formValue);

    data = reduce(data, (result: {}, value: any, key: string) => {
      if (onlyForAsyncFields && this.isAsyncField(key, fieldset)) {
        result[key] = value;
      } else if (!onlyForAsyncFields && !this.isAsyncField(key, fieldset)) {
        result[key] = value;
      }

      return result;
    }, {});

    // Remove values prefixed with 'pe_'
    data = reduce(data, (result: {}, value: any, key: string) => {
      if (key.indexOf('pe_') < 0) {
        result[key] = value;
      }

      return result;
    }, {});

    const req: {} = {
      actionId,
      apiUrl,
      ...this.baseApiData,
      ...data,
    };

    // baseApiUrl
    this.execThirdPartyApi(req).subscribe((response: InfoBoxSettingsInterface) => {
      if (!this.showForm) {
        this.settingsNonFormSaved = this.settings;
      }
      this.showForm = false;
      this.formLoading = false;
      this.showSpinnerForAction = null;

      if (response && response.type === 'info-box') {
        this.settings = response;
        if (response.actions) {
          this.updateActions(response.actions);
        }

        this.setupForm(response && response.content || {});
      } else if (response && response.type === 'confirm') {
        this.settings = response;
      } else if (response && response.type === 'redirect') {
        window.top.location.href = response.url;
      }
      this.submittedForm = null;
      this.cdr.detectChanges();
    }, (error) => {
      this.showError(error.message);
      this.showSpinnerForAction = null;
      this.formLoading = false;
      this.cdr.detectChanges();
    });
  }

  handleClose(): void {
    if (this.showForm) {
      this.settings = this.settingsNonFormSaved;
      this.showForm = false;
      this.cdr.detectChanges(); // fix 'disabled:null -> disabled:true'
    } else {
      this.onClose.emit();
    }
  }

  getExpandedIndex(): number {
    let result: number = this.expandedIndex || 0;
    if (!this.expandedIndex && this.infoBoxSettings && this.infoBoxSettings.content) {
      const accordion: AccordionPanelInterface[] = this.infoBoxSettings.content.accordion || [];
      for (let i = 0; i < accordion.length; i++) {
        if (!accordion[i].disabled && !accordion[i].hideToggle) {
          result = i;
          break;
        }
      }
    }

    return result;
  }

  prepareFieldsetData(fieldsetData: {}): {} {
    return assign(fieldsetData || {}, this.payeverFieldsData || {});
  }

  private execThirdPartyApi(data: {}): Observable<InfoBoxSettingsInterface> {
    return this.thirdPartyGeneratorService.execThirdPartyApi(this.baseApiUrl, data);
  }

  private getSubmittedForm(actionId: string): FormGroup {
    let currentFormValue;

    if (!this.infoBoxGeneratorForms || !actionId) {
      return null;
    }

    this.infoBoxGeneratorForms.toArray().forEach((f) => {
      if (f.action && actionId === f.action.actionId) {
        currentFormValue = f.form;
      }
    });

    return currentFormValue || null;
  }

  private getSubmittedFormByIndex(index: number): FormGroup {
    if (index === null || index === undefined) {
      return null;
    }

    return this.infoBoxGeneratorForms.toArray()[index].form || null;
  }

  private setupForm({ fieldset, fieldsetData }: InfoBoxSettingsContentInterface): void {
    if (fieldset) {
      this.fieldset = fieldset;
      this.fieldsetData = this.prepareFieldsetData(fieldsetData);
      this.showForm = true;
      this.cdr.detectChanges(); // fix 'disabled:null -> disabled:true'
    } else {
      this.showForm = false;
    }
  }

  private showError(error: string): void {
    this.snackBarService.toggle(true, {
      content: error || 'Unknown error',
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }
}
