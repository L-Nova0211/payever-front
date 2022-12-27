import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Injector,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { trim } from 'lodash-es';
import { takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import {
  ExecuteCommandAction,
  TextEditorComponent,
  TextEditorToolbarComponent,
  TextEditorService,
  ToggleToolbarAction,
} from '@pe/text-editor';

const TOOLBAR_PADDING = 15;
const EDITOR_SIZE = {
  focusedCompactHeight: 120,
  focusedHeight: 180,
  compactHeight: 160,
  height: 180,
};

@Component({
  selector: 'editor-description',
  templateUrl: 'editor-description.component.html',
  styleUrls: ['editor-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    PeDestroyService,
  ],
})
export class CollectionEditorDescriptionComponent implements OnInit, AfterViewInit {
  @ViewChild('editorToolbar') editorToolbar: TextEditorToolbarComponent;
  @ViewChild('editorToolbar', { read: ElementRef }) editorToolbarElement: ElementRef;
  @ViewChild('textEditor') textEditor: TextEditorComponent;

  @HostBinding('id') hostId = 'editor-description';

  @Input()
  @HostBinding('class.invalid')
  invalid = false;

  @Input()
  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this.hasDescriptionText = value && !!value.length;
    this._description = value;
  }

  @Input()
  placeholder: string;

  @Input()
  get compactSize(): boolean {
    return this._compactSize;
  }

  set compactSize(value: boolean) {
    this.recalculateHeight();
    this._compactSize = value;
  }

  @Output()
  valueChanged: EventEmitter<string> = new EventEmitter();

  editorFocused: boolean;
  hasDescriptionText: boolean;
  toolbarHeight = 0;

  private _description: string;
  private _compactSize: boolean;

  constructor(
    protected injector: Injector,
    private textEditorService: TextEditorService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private destroyed$: PeDestroyService,
  ) {
  }

  @HostListener('document:mousedown', ['$event']) onClick(event: any): void {
    if (!event.target.closest(`#${this.hostId}`)) {
      this.editorFocused = false;
      this.recalculateHeight();
    }
  }

  ngOnInit(): void {
    this.textEditorService.toggleToolbarAction$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((event: ToggleToolbarAction) => {
        this.editorToolbar.handleActions(event);
        this.cdr.detectChanges();
      });
  }

  ngAfterViewInit() {
    this.renderer.setStyle(this.textEditor.textArea.nativeElement, 'overflow-y', 'auto');
    this.renderer.setStyle(this.textEditor.textArea.nativeElement, 'transition', 'height 0.2s ease');

    this.editorFocus();
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
    const valueWithText = hasText ? this.description : '';
    this.valueChanged.emit(valueWithText);
  }

  private recalculateHeight(): void {
    if (this.textEditor) {
      const height: number = this.editorFocused
        ? this.compactSize
          ? EDITOR_SIZE.focusedCompactHeight
          : EDITOR_SIZE.focusedHeight
        : this.compactSize
        ? EDITOR_SIZE.compactHeight
        : EDITOR_SIZE.height;
      this.renderer.setStyle(this.textEditor.textArea.nativeElement, 'height', `${height}px`);
    }
    if (this.editorToolbarElement) {
      const toolbarHeight = this.editorToolbarElement.nativeElement.getBoundingClientRect().height;
      this.toolbarHeight = this.editorFocused ? toolbarHeight + TOOLBAR_PADDING : 0;
    }
  }
}
