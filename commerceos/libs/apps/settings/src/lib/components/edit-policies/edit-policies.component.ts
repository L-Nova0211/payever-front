import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Inject,
  OnInit, Renderer2,
  ViewChild,
} from '@angular/core';
import { trim } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';

import { AppThemeEnum } from '@pe/common';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';
import {
  ExecuteCommandAction,
  TextEditorComponent,
  TextEditorService,
  TextEditorToolbarComponent,
} from '@pe/text-editor';

import { PoliciesTypes } from '../../misc/interfaces';
import { BusinessEnvService } from '../../services';
import { AbstractComponent } from '../abstract';

const TOOLBAR_PADDING = 15;
const EDITOR_SIZE = {
  focusedCompactHeight: 120,
  focusedHeight: 180,
  compactHeight: 160,
  height: 220,
};

@Component({
  selector: 'peb-edit-policies',
  templateUrl: './edit-policies.component.html',
  styleUrls: ['./edit-policies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPoliciesComponent extends AbstractComponent implements OnInit, AfterViewInit {
  @ViewChild('editorToolbar') editorToolbar: TextEditorToolbarComponent;
  @ViewChild('editorToolbar', { read: ElementRef }) editorToolbarElement: ElementRef;
  @ViewChild('textEditor') textEditor: TextEditorComponent;

  @HostBinding('id') hostId = 'editor-description';

  type: PoliciesTypes;
  content: string;
  theme = AppThemeEnum.default;
  editorFocused: boolean;
  hasDescriptionText: boolean;
  toolbarHeight = 0;
  placeholder = 'info_boxes.panels.policies';

  private _description = '';
  private _compactSize: boolean;

  get businessId() {
    return this.envService.businessUuid;
  }

  constructor(
    private envService: BusinessEnvService,
    private peOverlayRef: PeOverlayRef,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private textEditorService: TextEditorService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
  ) {
    super();
  }

  @HostListener('document:mousedown', ['$event']) onClick(event: any): void {
    if (!event.target.closest(`#${this.hostId}`)) {
      this.editorFocused = false;
      this.recalculateHeight();
    }
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this.hasDescriptionText = value && !!value.length;
    this._description = value;
  }

  get compactSize(): boolean {
    return this._compactSize;
  }

  set compactSize(value: boolean) {
    this.recalculateHeight();
    this._compactSize = value;
  }

  ngAfterViewInit() {
    this.renderer.setStyle(this.textEditor.textArea.nativeElement, 'overflow-y', 'auto');
    this.renderer.setStyle(this.textEditor.textArea.nativeElement, 'transition', 'height 0.2s ease');

    this.editorFocus();
  }

  ngOnInit() {
    this.description = '';
    if (this.overlayData.data.type) {
      this.type = this.overlayData.data.type;
    }

    if (this.overlayData.data.content) {
      this.content = this.overlayData.data.content;
      this.description = this.content;
      this.cdr.detectChanges();
    }
    this.theme = this.overlayData.theme;

    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.onSave();
    });
  }

  editorFocus(): void {
    this.editorFocused = true;
    this.recalculateHeight();
  }

  onTextEditorAction(action: ExecuteCommandAction): void {
    this.textEditorService.triggerCommand$.next(action);
  }

  onDescriptionChange(text: string): void {
    this.description = trim(text) || '';
    const hasText = !!trim(this.textEditor.textArea.nativeElement.innerText).length;
    this.content = hasText ? this.description : '';
  }

  onSave() {
    if (this.content) {
      this.peOverlayRef.close({
        data: {
          text: this.content,
          type: this.type,
          businessId: this.businessId,
        },
      });
    }
  }

  private recalculateHeight(): void {
    if (this.textEditor) {
      const height: number =  EDITOR_SIZE.focusedCompactHeight;
      this.renderer.setStyle(this.textEditor.textArea.nativeElement, 'height', `${height}px`);
    }
    if (this.editorToolbarElement) {
      const toolbarHeight = this.editorToolbarElement.nativeElement.getBoundingClientRect().height;
      this.toolbarHeight = this.editorFocused ? toolbarHeight + TOOLBAR_PADDING : 0;
    }
  }
}
