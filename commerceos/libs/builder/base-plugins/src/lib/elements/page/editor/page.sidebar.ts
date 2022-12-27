import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { merge, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, filter, finalize, takeUntil, tap } from 'rxjs/operators';

import { MediaService, PebEditorApi } from '@pe/builder-api';
import {
  PebElementStyles,
  pebGenerateId,
  PebPageVariant,
  PebShopRoute,
  PebThemeApplicationInterface,
  PebThemePageInterface,
} from '@pe/builder-core';
import { PebEditorElement } from '@pe/builder-main-renderer';
import { getSelectedOption, PageSidebarDefaultOptions, PageTypes } from '@pe/builder-old';
import { PebEditorAccessorService, PebEditorStore } from '@pe/builder-services';


const linkValidator = (): ValidatorFn => {
  return (control: AbstractControl) => {
    return /^\/(([\w\/:%._+~#=-])*[\w:%._+~#=-])?$/.test(control.value) ? null : { link: true };
  };
};

@Component({
  selector: 'peb-editor-page-sidebar',
  templateUrl: 'page.sidebar.html',
  styleUrls: [
    '../../../../../../styles/src/lib/styles/_sidebars.scss',
    './page.sidebar.scss',
  ],
})
export class PebEditorPageSidebarComponent implements OnInit, OnDestroy {
  @Input() page: PebThemePageInterface;
  @Input() application: PebThemeApplicationInterface;
  @Input() component: PebEditorElement;
  @Input() styles: PebElementStyles;

  @Output() changePageName = new EventEmitter<string>();
  @Output() changePageType = new EventEmitter<any>();
  @Output() changeRootPage = new EventEmitter<boolean>();
  @Output() changePageLink = new EventEmitter<PebShopRoute>();
  @Output() createNewSection = new EventEmitter<boolean>();

  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChild('linkInput') linkInput: ElementRef<HTMLInputElement>;

  form: FormGroup;
  readonly PageTypes: typeof PageTypes = PageTypes;

  private readonly destroy$ = new Subject<void>();

  private get route(): PebShopRoute {
    return this.editorStore.snapshot.application.routing.find(r => r.pageId === this.page.id);
  }

  constructor(
    public api: PebEditorApi,
    public mediaService: MediaService,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private editorStore: PebEditorStore,
    private editorAccessorService: PebEditorAccessorService,
  ) {
  }

  ngOnInit() {
    this.initForm();
    this.watchOnChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  pageNameInputEnterHandler($event: Event) {
    $event.preventDefault();
    this.changePageName.emit(($event.target as HTMLInputElement).value.trim());
  }

  pageLinkInputEnterHandler($event: Event): void {
    $event.preventDefault();
    this.form.get('link').patchValue(($event.target as HTMLInputElement).value.trim());
  }

  setPageNameBeforeDestroy(value: string) {
    this.changePageName.emit(value.trim());
  }

  addSection(after?: boolean): void {
    this.createNewSection.emit(after);
  }

  private initForm() {
    const selected = getSelectedOption(this.PageTypes, this.page.variant, PageSidebarDefaultOptions.PageType);
    this.form = this.formBuilder.group({
      name: [this.page.name, { updateOn: 'blur' }],
      type: [selected.value],
      link: this.formBuilder.control(this.route?.url ?? '', {
        updateOn: 'blur',
        validators: [linkValidator()],
      }),
      root: [this.page.variant === PebPageVariant.Front],
    });
  }

  private watchOnChanges() {
    merge(
      this.form.get('root').valueChanges.pipe(
        tap((value: boolean) => {
          this.changeRootPage.emit(value);
        }),
      ),
      this.form.get('type').valueChanges.pipe(
        tap((value: string) => {
          this.changePageType.emit(value);
        }),
      ),
      this.editorStore.versionUpdated$.pipe(
        tap((value) => {
          this.form.get('root').patchValue(value);
        }),
      ),
      this.form.get('link').valueChanges.pipe(
        filter(() => this.form.get('link').valid),
        distinctUntilChanged(),
        tap((value: string) => this.changePageLink.emit({
          ...(this.route ?? { routeId: pebGenerateId(), pageId: this.page.id }),
          url: value,
        })),
      ),
      this.form.get('name').valueChanges.pipe(
        tap((value: string) => {
          this.changePageName.emit(value);
          if (!value) {
            this.form.patchValue({ name: this.page.name }, { emitEvent: false });
          }
        }),
      ),
    ).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.setPageNameBeforeDestroy(this.nameInput.nativeElement.value)),
      catchError(() => of(null)),
    ).subscribe();
  }

  openSeoSidebar(): void {
    this.editorAccessorService.editorComponent.commands$.next({ type: 'toggleSeoSidebar' });
  }
}
