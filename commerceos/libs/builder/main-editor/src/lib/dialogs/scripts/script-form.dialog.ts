import { ChangeDetectionStrategy, Component, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { DEFAULT_TRIGGER_POINT, PebEnvService, pebGenerateId, PebPageId, PebScript, PebScriptTrigger } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-services';
import { AppThemeEnum } from '@pe/common';

export interface PebEditorScriptFormData {
  script?: PebScript;
  page?: string;
}

export interface PebEditorScriptFormValue extends PebScript {
  page: PebPageId;
}

@Component({
  selector: 'peb-script-form',
  templateUrl: './script-form.dialog.html',
  styleUrls: ['./script-form.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorScriptFormDialog implements OnInit {

  @Input() title = 'Add script';
  @Input() script: PebScript;

  @ViewChild('confirmDialogTpl') confirmDialogTpl: TemplateRef<any>;
  confirmDialogRef: MatDialogRef<any>;

  readonly theming = this.pebEnvService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  readonly form = this.fb.group({
    id: [pebGenerateId()],
    name: this.fb.control('', { validators: [Validators.required] }),
    content: this.fb.control('', { validators: [Validators.required] }),
    triggerPoint: this.fb.control(''),
    page: [''],
  });

  readonly pageOptions = [
    { name: 'Global', value: '' },
    ...this.editorStore.snapshot.pages.map(p => ({ name: `Page: "${p.name}"`, value: p.id })),
  ];
  readonly triggerPointOptions = [
    { name: 'Page View', value: PebScriptTrigger.PageView },
    { name: 'DOM Ready', value: PebScriptTrigger.DOMReady },
    { name: 'Window Loaded', value: PebScriptTrigger.WindowLoaded },
  ];

  constructor(
    private dialogRef: MatDialogRef<PebEditorScriptFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: PebEditorScriptFormData,
    private pebEnvService: PebEnvService,
    private editorStore: PebEditorStore,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.form.patchValue({
      ...this.data?.script,
      triggerPoint: this.data?.script?.triggerPoint || DEFAULT_TRIGGER_POINT,
      page: this.data?.page ?? this.editorStore.page?.id ?? '',
    }, { emitEvent: false });
  }

  submitForm(emit = false): void {
    if (!emit) {
      this.confirmDialogRef = this.dialog.open(this.confirmDialogTpl, {
        panelClass: ['scripts-dialog__panel', this.theming],
        maxWidth: '300px',
      });
      this.confirmDialogRef.afterClosed().subscribe((ans) => {
        if (ans) {
          this.dialogRef.close();
        }
        this.confirmDialogRef = undefined;
      });
    } else if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  removeScript(): void {
    const scriptId = this.form.value.id;
    const pageId = this.data?.page;
    const page = this.editorStore.snapshot.pages.find(p => p.id === pageId);
    let action$: () => Observable<any>;
    if (!page) {
      const appData = this.editorStore.snapshot.application.data;

      action$ = () => this.editorStore.updateShop({
        ...appData,
        scripts: (appData.scripts ?? []).filter(s => s.id !== scriptId),
      });
    } else {
      action$ = () => this.editorStore.updatePage(page, {
        data: {
          ...page.data,
          scripts: (page.data?.scripts ?? []).filter(s => s.id !== scriptId),
        },
      });
    }

    action$().pipe(take(1)).subscribe(() => this.dialogRef.close());
  }
}
