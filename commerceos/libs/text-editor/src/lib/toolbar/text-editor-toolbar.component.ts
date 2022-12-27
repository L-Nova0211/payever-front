import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { merge, ReplaySubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import {
  CheckboxChangeEvent,
  CheckboxLabelPosition,
  CheckboxSize,
  ColorPickerFormat,
  ErrorBag,
  FormAbstractComponent,
  FormFieldType as FormFieldEnum,
  FormScheme,
  FormSchemeField,
  InputSettingsInterface,
  InputType,
  SelectChangeEvent,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';


import { PeTextEditorPlaceholderComponent } from '../placeholder/placeholder.component';
import { TextEditorService } from '../services/text-editor.service';
import { DEFAULT_FONT_COLOR, DEFAULT_FONT_SIZE, ExecuteCommands, JustifyContent } from '../text-editor.constants';
import {
  EditorToolbarForm,
  ExecuteCommandAction,
  LinksInterface,
  TextDecorationInterface,
  ToggleToolbarAction,
} from '../text-editor.interface';
import { isValidURL, rgbToHex } from '../text-editor.utils';

@Component({
  selector: 'pe-text-editor-toolbar',
  styleUrls: ['text-editor-toolbar.component.scss'],
  templateUrl: 'text-editor-toolbar.component.html',
  encapsulation:ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextEditorToolbarComponent extends FormAbstractComponent<EditorToolbarForm> implements OnInit, OnDestroy, AfterViewInit {
  formScheme: FormScheme;
  hrefFieldset: FormSchemeField[];
  openInNewTabFieldset: FormSchemeField[];
  fontFieldset: FormSchemeField[];
  fontFamilyFieldset: FormSchemeField[];
  colorFieldset: FormSchemeField[];
  textDecoration: TextDecorationInterface = {
    [ExecuteCommands.BOLD]: false,
    [ExecuteCommands.ITALIC]: false,
    [ExecuteCommands.UNDERLINE]: false,
  };

  justifyContent: JustifyContent = ExecuteCommands.JUSTIFY_LEFT;
  contentList: ExecuteCommands.LIST_ORDERED | ExecuteCommands.LIST_UNORDERED;
  currentFontSize: number;
  currentFontColor: string;
  currentFontFamily: string;
  currentLink: string;

  @Input() hideLink: boolean;
  @Input() hideOpenNewTab: boolean;
  @Input() hideFontSize: boolean;
  @Input() hideFontFamily: boolean;
  @Input() hideColorPicker: boolean;
  @Input() hideDecorations: boolean;
  @Input() hideJustifies: boolean;
  @Input() hideLists: boolean;
  @Input() spreadButtons = true;

  @Input() DEFAULT_FONT_SIZE: number = DEFAULT_FONT_SIZE;
  @Input() DEFAULT_FONT_COLOR: string = DEFAULT_FONT_COLOR;
  @Input() links: LinksInterface[] = [];
  @Input() activeLinks: LinksInterface[] = [];
  @Input() fontFamilies: { label: string, value: string }[] = [];
  @Input() linkPlaceholder = '';
  @Input() linkToText = '';
  @Input() newTabText = '';
  @Input() fontFamilyText = '';

  @Output() actionClicked: EventEmitter<ExecuteCommandAction> = new EventEmitter<ExecuteCommandAction>();
  @Output() setLink: EventEmitter<LinksInterface> = new EventEmitter<LinksInterface>();

  @ViewChild('textArea') textArea: ElementRef<HTMLElement>;
  @ViewChild('textColor') textColor: any;
  @ViewChild('placeholderBtn', { static: false }) placeholderBtnRef: ElementRef<HTMLButtonElement>;

  colorEditing: boolean;
  readonly ExecuteCommands: typeof ExecuteCommands = ExecuteCommands;
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject();
  private fontSizeEditing: boolean;
  constructor(
    protected injector: Injector,
    protected errorBag: ErrorBag,
    public editorService: TextEditorService,
    private translateService: TranslateService,
    private overlay: Overlay,
  ) {
    super(injector);
    this.linkToText = this.translateService.translate('ng-kit.text_editor.link_to');
  }

  ngOnInit(): void {
    this.currentFontSize = this.DEFAULT_FONT_SIZE;
    this.currentFontColor = this.DEFAULT_FONT_COLOR;
  }

  onFormKey(event: KeyboardEvent): void {
    if (event.key.toLowerCase() === 'enter') {
      event.preventDefault();
    }
  }

  handleActions(event: ToggleToolbarAction): void {
    switch (event.action) {
      case 'currentFontSize':
        if (this.currentFontSize !== event.value) {
          this.currentFontSize = event.value as number;
        }
        break;
      case 'currentFontColor':
        let value: string = event.value.toString();
        if (value.indexOf('rgb') > -1) {
          value = rgbToHex(value);
        }
        if (value !== this.currentFontColor && !this.colorEditing) {
          this.currentFontColor = value;
        }
        break;
      default:
        this[event.action] = event.value;
    }
    this.form.reset({
      font: this.currentFontSize || this.DEFAULT_FONT_SIZE,
      fontFamily: this.currentFontFamily,
      color: this.currentFontColor || this.DEFAULT_FONT_COLOR,
      href: this.currentLink,
    });
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit(): void {
    this.createForm(); // TODO Remove
  }

  isActiveLink(link: LinksInterface): boolean {
    return this.activeLinks.findIndex(active => active.id === link.id) > -1;
  }

  /**
   * Decorate text
   * @param action
   */
  decorationClick(action: ExecuteCommands): void {
    this.textDecoration[action] = !this.textDecoration[action];
    this.editorService.triggerCommand$.next({ key: action });
  }

  /**
   * Justify content
   * @param action
   */
  justifyClick(action: JustifyContent): void {
    if (action !== this.justifyContent) {
      this.justifyContent = action;
      // this.editorService.triggerCommand$.next({key: action});
    this.editorService.triggerCommand$.next({ key: action });
    }
  }

  /**
   * List Text
   * @param action
   */
  listClick(action: ExecuteCommands.LIST_ORDERED | ExecuteCommands.LIST_UNORDERED): void {
    this.contentList = action === this.contentList ? null : action;
    this.editorService.triggerCommand$.next({ key: action });
  }

  setCurrentLink(link: LinksInterface): void {
    this.setLink.emit(link);
    this.activeLinks = [link];
    this.editorService.triggerCommand$.next({
      key: ExecuteCommands.INSERT_INTERNAL_LINK, options: {
        link,
        newTab: this.form.get('openInNewTab').value,
      },
    });
    this.form.get('href').setValue(null);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  /**
   * Form builder
   * @param initialData
   */
  protected createForm(initialData?: EditorToolbarForm): void {
    this.form = this.formBuilder.group({
      href: [null],
      openInNewTab: [null],
      font: [this.DEFAULT_FONT_SIZE],
      fontFamily: [null],
      color: [this.currentFontColor || this.DEFAULT_FONT_COLOR],
    });

    this.formScheme = {
      fieldsets: {
        hrefFieldset: [
          {
            name: 'href',
            type: FormFieldEnum.Input,
            fieldSettings: {
              classList: 'col-xs-12',
              label: '',
            },
            inputSettings: {
              placeholder: this.linkPlaceholder || this.translateService.translate('ng-kit.text_editor.custom_link'),
              onBlur: (e: any) => {
                this.currentLink = e.target.value as string;
                if (isValidURL(this.currentLink)) {
                  this.editorService.triggerCommand$.next({ key: ExecuteCommands.INSERT_LINK, value: this.currentLink });
                  // this.actionClicked.emit({ key: ExecuteCommands.INSERT_LINK, value: this.currentLink });
                  this.form.controls['href'].setValue(this.currentLink);
                }
              },
            },
          },
        ],
        openInNewTabFieldset: [
          {
            name: 'openInNewTab',
            type: FormFieldEnum.Checkbox,
            fieldSettings: {
              classList: 'col-xs-12 vertical-padding-0',
              label: this.newTabText || this.translateService.translate('ng-kit.text_editor.open_in_new_tab'),
            },
            checkboxSettings: {
              size: CheckboxSize.Small,
              labelPosition: CheckboxLabelPosition.Before,
              onValueChange: (e: CheckboxChangeEvent) => {
                if (isValidURL(this.currentLink)) {
                  this.editorService.triggerCommand$.next({
                    key: ExecuteCommands.INSERT_LINK,
                    value: this.currentLink,
                    options: e.checked,
                  });
                }
              },
            },
          },
        ],
        fontFieldset: [
          {
            name: 'font',
            type: FormFieldEnum.Input,
            fieldSettings: {
              classList: 'col-xs-18',
              label: '',
            },
            inputSettings: <InputSettingsInterface>{
              type: InputType.Number,
              showNumberControls: true,
              onFocus: () => {
                this.fontSizeEditing = true;
              },
              onValueChange: (e: any) => {
                if (e.value !== this.currentFontSize && !this.fontSizeEditing) {
                  this.editorService.triggerCommand$.next({ key: ExecuteCommands.FONT_SIZE, value: e.value });
                  // this.actionClicked.emit({ key: ExecuteCommands.FONT_SIZE, value: e.value });
                  this.currentFontSize = e.value;
                }
              },
              onBlur: (event: any) => {
                this.fontSizeEditing = false;
                this.editorService.triggerCommand$.next({ key: ExecuteCommands.FONT_SIZE, value: event.target.value });
                // this.actionClicked.emit({ key: ExecuteCommands.FONT_SIZE, value: event.target.value });
              },
            },
          },
        ],
        fontFamilyFieldset: [
          {
            name: 'fontFamily',
            type: FormFieldEnum.Select,
            fieldSettings: {
              classList: 'col-xs-18 toolbar-font-family',
              label: '',
            },
            selectSettings: {
              panelClass: 'mat-select-dark mat-select-horizontal',
              placeholder: this.fontFamilyText,
              disableOptionCentering: true,
              options: this.fontFamilies || [],
              onValueChange: (event: SelectChangeEvent) => {
                this.currentFontFamily = event.value;
                this.editorService.triggerCommand$.next({ key: ExecuteCommands.FONT_FAMILY, value: event.value });
                // this.actionClicked.emit({ key: ExecuteCommands.FONT_FAMILY, value: event.value });
              },
            },
          },
        ],
        colorFieldset: [
          {
            name: 'color',
            type: 'color-picker',
            fieldSettings: {
              classList: 'color-picker-set',
              label: '',
            },
            colorPickerSettings: {
              alpha: false,
              format: ColorPickerFormat.HEX,
              onValueChange: (event: any): void => {
                if (event.value !== this.currentFontColor) {
                  this.editorService.triggerCommand$.next({ key: ExecuteCommands.TEXT_COLOR, value: event.value });
                  // this.actionClicked.emit({ key: ExecuteCommands.TEXT_COLOR, value: event.value });
                  this.currentFontColor = event.value;
                }
              },
            },
          },
        ],
      },
    };
    this.hrefFieldset = this.formScheme.fieldsets['hrefFieldset'];
    this.openInNewTabFieldset = this.formScheme.fieldsets['openInNewTabFieldset'];
    this.fontFieldset = this.formScheme.fieldsets['fontFieldset'];
    this.fontFamilyFieldset = this.formScheme.fieldsets['fontFamilyFieldset'];
    this.colorFieldset = this.formScheme.fieldsets['colorFieldset'];
    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formValues: EditorToolbarForm): void { }

  protected onSuccess(): void { }

  public openPlaceholderMenu(): void {
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      disposeOnNavigation: true,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      minHeight: 400,
      maxHeight: 400,
      minWidth: 300,
      maxWidth: 300,
      positionStrategy: this.overlay.position()
        .flexibleConnectedTo(this.placeholderBtnRef)
        .withFlexibleDimensions(false)
        .withViewportMargin(10)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
          },
        ])
        .withDefaultOffsetY(5),
    });

    const componentPortal = new ComponentPortal(PeTextEditorPlaceholderComponent);
    overlayRef.attach(componentPortal);

    merge(
      overlayRef.backdropClick(),
      this.editorService.placeholderSubject$,
    ).pipe(
      tap(() => {
        overlayRef.dispose();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

}
