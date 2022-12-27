import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { fromEvent, ReplaySubject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

// import { PebAbstractEditor } from '@pe/builder-abstract';
// import { PebEditorElement } from '@pe/builder-main-renderer';
// import { PebEditorAccessorService } from '@pe/builder-services';

// import { PebElementBorderRadiusControl } from '../element-border-radius';


@Component({
  selector: 'peb-editor-controls-shape-corners',
  template: `<input #input [class.hidden]="hidden" [style.opacity]="component.animating? 0 : 1" type="range" class="shape-corners"/>`,
  styleUrls: ['shape-corners.control.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShapeCornersControl {

  private destroyed$ = new ReplaySubject<boolean>(1);

  @Input() component: any; // PebEditorElement
  @Input() hidden: boolean;

  @HostBinding('style.opacity')
  hostStyleOpacity = 1;

  @ViewChild('input', { static: true }) private _input: ElementRef;
  get input() { return this._input.nativeElement; }

  // get editor() { return this.editorAccessorService.editorComponent; }

  private get max(): number {
    const { height, width } = this.component.styles;

    return height > width ? width / 2 : height / 2;
  }

  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    // private editorAccessorService: PebEditorAccessorService,
  ) {}

  // static construct(editor: PebAbstractEditor, element: PebEditorElement) {
  //   const control = editor.createControl(PebShapeCornersControl);
  //
  //   control.instance.component = element;
  //   control.instance.init();
  //   control.instance.detectChanges();
  //
  //   return control;
  // }

  @HostListener('mousedown', ['$event']) onMMouseDown(event: MouseEvent) {
    event.stopPropagation();
    // PebElementBorderRadiusControl.construct(this.editor, this.component);
  }

  @HostListener('mouseup') onMouseUp() {
    this.component.controls.borderRadius?.destroy();
    this.component.controls.borderRadius = null;
  }

  @HostListener('change', ['$event.relatedTarget']) onChange(target: HTMLElement) {
    this.component.radius.submit.next();
  }

  init() {
    this.component.animating$.pipe(
      tap(animating => this.hostStyleOpacity = animating ? 0 : 1),
      takeUntil(this.destroyed$),
    ).subscribe();

    const borderRadius = this.component.styles.borderRadius ?? 0;

    this.input.value = typeof borderRadius === 'string'
      ? this.convertToNumber(parseInt(borderRadius.split('%')[0], 10))
      : this.convertToPercent(borderRadius);

    this.component.radius?.form.valueChanges.pipe(
      tap((changes: { borderRadius: number }) => {
        this.input.value = this.convertToPercent(changes.borderRadius);
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    fromEvent(this.input, 'input').pipe(
      filter(() => !!this.component.radius?.form),
      tap(() => {
        const num = this.convertToNumber(this.input.value);
        this.component.radius.form.get('borderRadius').patchValue(num, { emitEvent: true });
        this.component.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  detectChanges() {
    // TODO: check
    if (!this.component?.nativeElement) {
      return;
    }

    this.changeDetectorRef.detectChanges();
  }

  private convertToPercent(borderRadius: number): number {
    return Math.round((borderRadius / this.max) * 100);
  }

  private convertToNumber(percent: number): number {
    return Math.round((percent / 100) * this.max);
  }
}
