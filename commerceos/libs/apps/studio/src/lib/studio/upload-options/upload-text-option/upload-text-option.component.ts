import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  SecurityContext,
  ViewChild,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { trim } from 'lodash-es';
import { merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import {
  ExecuteCommandAction,
  TextEditorComponent,
  TextEditorService,
  TextEditorToolbarComponent,
  ToggleToolbarAction,
} from '@pe/text-editor';

@Component({
  selector: 'pe-studio-upload-text-option',
  templateUrl: './upload-text-option.component.html',
  styleUrls: ['upload-text-option.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeStudioUploadTextOptionComponent {
  @ViewChild('editorToolbar') editorToolbar: TextEditorToolbarComponent;
  @ViewChild('textEditor') textEditor: TextEditorComponent;

  formGroup = this.formBuilder.group({
    title: this.formBuilder.control(this.peOverlayData.title),
    description: this.formBuilder.control(this.peOverlayData.description),
  });

  editorFocused = false;
  description: string = this.peOverlayData.description;
  placeholder = 'Description text';

  constructor(
    private textEditorService: TextEditorService,
    private changeDetectorRef: ChangeDetectorRef,
    private destroy$: PeDestroyService,
    private formBuilder: FormBuilder,
    private domSanitizer: DomSanitizer,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
  ) {
    merge(
      this.peOverlayData.closingSubject$.pipe(
        tap(() => this.submit()),
      ),
      this.textEditorService.toggleToolbarAction$.pipe(
        tap((event: ToggleToolbarAction) => {
          this.editorToolbar.handleActions(event);
          this.changeDetectorRef.detectChanges();
        }),
      ),
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public onTextEditorAction(action: ExecuteCommandAction): void {
    this.textEditorService.triggerCommand$.next(action);
  }

  public editorFocus(): void {
    this.editorFocused = true;
  }

  public onDescriptionChange(text): void {
    this.description = trim(text) || '';
    this.formGroup.get('description').setValue(this.description);
  }

  private submit(): void {
    let payload;
    if (!this.formGroup.invalid) {
      const { title, description } = this.formGroup.value;
      const sanitizedText = this.domSanitizer.sanitize(SecurityContext.HTML, description);
      payload = { title, description: sanitizedText };
    } else {
      payload = { errors: this.formGroup.errors };
    }
    this.peOverlayData.payloadSubject$.next(payload);
  }
}
