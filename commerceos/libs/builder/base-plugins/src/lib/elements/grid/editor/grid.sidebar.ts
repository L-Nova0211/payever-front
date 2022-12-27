import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Select } from '@ngxs/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

import {
  isIntegrationAction,
  PebEditorState,
  PebElementDef,
  PebElementStyles,
  PebElementType,
  PebIntegrationActionTag,
  PebIntegrationTag,
} from '@pe/builder-core';
import { PebEditor } from '@pe/builder-main-editor';
import { PebEditorElement, PebEditorElementPropertyAlignment } from '@pe/builder-main-renderer';
import { ImageSize } from '@pe/builder-old';
import { PebEditorAccessorService } from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';


@Component({
  selector: 'peb-editor-grid-sidebar',
  templateUrl: './grid.sidebar.html',
  styleUrls: [
    '../../../../../../styles/src/lib/styles/_sidebars.scss',
    './grid.sidebar.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorGridSidebarComponent implements OnInit, OnDestroy {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  selectedElements: PebElementDef[];

  @Input() component: PebEditorElement;
  @Input() element: PebElementDef;
  @Input() styles: PebElementStyles;

  @ViewChild('cellSidebarSlot', { read: ViewContainerRef }) cellSidebarSlot: ViewContainerRef;
  @ViewChild('tabSidebarSlot', { read: ViewContainerRef }) tabSidebarSlot: ViewContainerRef;

  @Output() cellTypeChange = new EventEmitter<PebElementType>();

  form: FormGroup;
  alignment: PebEditorElementPropertyAlignment;
  PebIntegrationTag = PebIntegrationTag;
  limits = new BehaviorSubject<any>({
    height: {
      min: 1,
      max: 100,
    },
  });

  private readonly destroy$ = new Subject<void>();

  get isCellElement$(): Observable<boolean> {
    return this.selectedElements$.pipe(
      map(elements => elements.every(element => element.parent.type === PebElementType.Grid)),
    );
  }

  get showFontForm(): boolean {
    return this.form.get('functionLink.integration').value?.tag !== PebIntegrationTag.Products ||
      !this.form.get('functionLink.action').value?.tags?.some(tag =>
        tag === PebIntegrationActionTag.GetFilters || tag === PebIntegrationActionTag.GetList,
      );
  }

  private get editor() {
    return (this.editorAccessorService.editorComponent as PebEditor);
  }

  constructor(
    private cfr: ComponentFactoryResolver,
    private injector: Injector,
    private fb: FormBuilder,
    private state: PebEditorState,
    private editorAccessorService: PebEditorAccessorService,
    public cdr: ChangeDetectorRef,
  ) {
    this.selectedElements$.pipe(
      tap((elements) => {
        this.selectedElements = elements;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  getFirstCellDimensions(cells: PebElementDef[] = []) {
    // const gridElement = this.component.target as any;
    //
    // return {
    //   firstCellHeight: gridElement.styles.gridTemplateRows[0],
    //   firstCellWidth: gridElement.styles.gridTemplateColumns[0],
    // };

    return {
      firstCellHeight: 0,
      firstCellWidth: 0,
    };
  }

  setDimensionsLimits(): void {
    const rowCount = this.element.data.rowCount;
    const maxHeight = this.component.parent.styles.height - this.component.styles.top;

    this.limits.next({
      height: {
        min: 1,
        max: maxHeight / rowCount,
      },
    });

    this.form.get('dimensions').get('height').setValidators([
      Validators.min(this.limits.value.height.min),
      Validators.max(this.limits.value.height.max),
    ]);
  }

  setDimensions(cells: PebElementDef[]) {
    const { firstCellHeight, firstCellWidth } = this.getFirstCellDimensions(cells);

    this.form?.get('dimensions').patchValue(
      {
        height: firstCellHeight,
        width: firstCellWidth,
      },
      { emitEvent: false },
    );
  }

  ngOnInit(): void {
    const { firstCellHeight, firstCellWidth } = this.getFirstCellDimensions();
    const gridData = this.component.target.data;
    this.form = this.fb.group({
      grid: this.fb.group({
        elType: this.fb.control(null),
      }),
      spacing: this.fb.control(gridData.spacing),
      borderOptions: this.fb.group({
        option: [gridData.borderOption ?? null],
        color: [gridData.borderColor ?? '#000000'],
        width: [gridData.borderWidth ?? 1],
      }),
      functionLink: this.fb.group({
        integration: [gridData.functionLink?.integration ?? null],
        action: [(isIntegrationAction(gridData.functionLink) && gridData.functionLink) ?? null],
        actionData: [(isIntegrationAction(gridData.functionLink) && gridData.functionLink?.actionData) ?? null],
      }),
      cellBorderOptions: this.fb.group({
        option: [null],
        color: ['#000000'],
        width: [1],
      }),
      dimensions: this.fb.group({
        height: [firstCellHeight],
        width: [firstCellWidth],
      }),
      fullHeight: this.fb.control(gridData.fullHeight ?? false),
      openInOverlay: this.fb.control(gridData.openInOverlay ?? false),
      image: this.fb.group({
        size: this.fb.control(gridData.imageSize ?? ImageSize.OriginalSize),
        scale: this.fb.control(gridData.imageScale ?? 100, { updateOn: 'change' }),
      }),
    }, { updateOn: 'blur' });

    this.setDimensionsLimits();

    this.selectedElements$.pipe(
      tap((cells) => {
        this.setDimensions(cells);
        this.editor.backTo('main');
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.editor.state.interactionCompleted$.pipe(
      tap(() => { this.setDimensionsLimits(); }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
