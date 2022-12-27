import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable, ReplaySubject, Subject, timer } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';

import {
  PebScreen,
  PebShop,
  PebThemeDetailInterface,
  PebThemeShortPageInterface,
} from '@pe/builder-core';
import { PeDataGridFilter, TreeFilterNode } from '@pe/common';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { SidebarFiltersWrapperComponent } from '@pe/sidebar';

import {
  GridExpandAnimation,
  MobileSidebarAnimation,
  newSidebarAnimation,
  SidebarAnimation,
  SidebarAnimationProgress,
  SidebarAnimationStates,
} from './sidebar.animation';

export interface ThemeSnapshot {
  snapshot: PebThemeDetailInterface;
  pages: PebThemeShortPageInterface[];
}

@Component({
  selector: 'peb-review-publish',
  templateUrl: './review-publish.component.html',
  styleUrls: ['./review-publish.component.scss'],
  animations: [newSidebarAnimation, SidebarAnimation, MobileSidebarAnimation, GridExpandAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewPublishComponent implements OnInit, OnDestroy {
  private readonly gridAnimationStateStream$ =
    new BehaviorSubject<SidebarAnimationStates>(SidebarAnimationStates.Default);

  private readonly gridAnimationProgressStream$ = new Subject<SidebarAnimationProgress>();

  readonly gridAnimationState$: Observable<SidebarAnimationStates> = this.gridAnimationStateStream$.asObservable();
  readonly gridAnimationProgress$: Observable<SidebarAnimationProgress> =
    this.gridAnimationProgressStream$.asObservable();

  set gridAnimationProgress(value: SidebarAnimationProgress) {
    this.gridAnimationProgressStream$.next(value);
  }

  destroy$ = new Subject<void>();

  @ContentChildren(SidebarFiltersWrapperComponent) sidebarFilters: QueryList<SidebarFiltersWrapperComponent>;
  isSidebarClosed = window.innerWidth <= 720;

  @ViewChild('draftPreview', { static: false }) draftPreview: ElementRef<HTMLElement>;
  @ViewChild('currentVersionPreview', { static: false }) currentVersionPreview: ElementRef<HTMLElement>;
  @ViewChild('versions', { static: true }) versionsContainer: ElementRef<HTMLElement>;
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  newThemeVersion: ThemeSnapshot;
  pageIds: any = [];
  currentPage: any;
  publishedPage: any;

  themeId: string;
  activeNodeId: string;
  fullscreens: boolean[];
  totalPages: any;
  screen: string | PebScreen = PebScreen.Desktop;

  private headerConfig: PePlatformHeaderConfig;

  filters: PeDataGridFilter[] = [];

  private readonly treeData$ = new BehaviorSubject<TreeFilterNode<any>[]>([]);
  get treeData() {
    return this.treeData$.getValue();
  }

  set treeData(data: TreeFilterNode[]) {
    this.treeData$.next(data);
  }

  formGroup = this.formBuilder.group({
    tree: [[]],
  });

  draftSnapshot: ThemeSnapshot;
  publishedTheme: PebShop;

  readonly preview$: Subject<{ current: ThemeSnapshot, published: PebShop }> = new Subject();
  readonly selectedVersion$ = new ReplaySubject<string>(1);
  readonly screenChanging$ = new Subject<boolean>();

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: any,
    public dialogRef: MatDialogRef<ReviewPublishComponent>,
    private formBuilder: FormBuilder,
    private platformHeader: PePlatformHeaderService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fullscreens = [false, false];

    this.initPages();
    this.createHeader();

    this.selectedVersion$.pipe(
      switchMap((selectedPage: string) => {
        this.currentPage = this.draftSnapshot.pages.find(page => page.id === selectedPage);
        this.publishedPage = this.publishedTheme.pages.find(page => page.id === selectedPage);

        return this.route.queryParams;
      }),
      tap((params: Params) => {
        const preview = {
          current: { ...this.draftSnapshot },
          published: { ...this.publishedTheme },
        };

        if (params.pageId) {
          this.activeNodeId = params.pageId;
        }
        this.preview$.next(preview);
        this.cdr.markForCheck();
      }),
      catchError(err => err),
      takeUntil(this.destroy$),
    ).subscribe();

  }

  createHeader(): void {
    const rightSectionItems = [
      {
        title: 'Close',
        class: 'dialog-btn',
        onClick: () => this.dialogRef.close(null),
      },
      {
        title: 'Publish',
        class: 'dialog-btn active',
        onClick: () => this.dialogRef.close(true),
      },
    ];
    let isShowDataGridToggleComponent = true;

    if (!this.totalPages.length) {
      rightSectionItems.splice(1, 1);
      isShowDataGridToggleComponent = false;
    }

    this.headerConfig = this.platformHeader.config;
    this.platformHeader.setConfig({
      isShowDataGridToggleComponent,
      rightSectionItems,
      mainDashboardUrl: null,
      currentMicroBaseUrl: null,
      isShowShortHeader: undefined,
      isShowSubheader: false,
      mainItem: null,
      isShowMainItem: false,
      closeItem: {
        title: 'Close',
        onClick: () => this.dialogRef.close(null),
      },
      isShowCloseItem: false,
      businessItem: null,
      isShowBusinessItem: false,
      isShowBusinessItemText: false,
      showDataGridToggleItem: {
        iconSize: '24px',
        iconType: 'vector',
        onClick: this.onToggleSidebar.bind(this),
        isActive: true,
        isLoading: true,
        showIconBefore: true,
      },
      leftSectionItems: [
        {
          title: this.screen.charAt(0).toUpperCase() + this.screen.slice(1),
          class: 'dialog-btn screen-btn',
          onClick: () => this.menuTrigger.openMenu(),
        },
      ],
    });

  }

  initPages(): void {
    this.totalPages = this.dialogData.totalPages;

    if (!this.totalPages.length) {
      return;
    }

    this.draftSnapshot = this.dialogData.current;
    this.publishedTheme = this.dialogData.published;

    this.treeData = this.totalPages.map((page) => {
      const fullTime = new Date(page.updatedAt).toLocaleTimeString('en-UK');

      return ({
        name: page.name,
        id: page.id,
        data: {
          date: new Date(page.updatedAt).toLocaleDateString('en-UK'),
          time: fullTime.slice(0, fullTime.length - 3),
        },
      });
    });
    this.cdr.detectChanges();

    this.activeNodeId = this.totalPages[0].id;
    this.selectedVersion$.next(this.activeNodeId);
  }

  ngOnDestroy(): void {
    if (this.headerConfig) {
      this.platformHeader.setConfig(this.headerConfig);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSelectPage(page: TreeFilterNode, event: Event): void {
    event.stopPropagation();
    this.activeNodeId = page.id;
    this.router.navigate([], { relativeTo: this.route, queryParams: { pageId: page.id } });
    this.selectedVersion$.next(this.activeNodeId);
  }

  getActiveNode(node: TreeFilterNode): boolean {
    return node?.id === this.activeNodeId;
  }

  onEdit(node: TreeFilterNode): void {
    console.log('Edit theme', node);
  }

  onFullscreenChange(index: number): void {
    const element = index ? this.draftPreview : this.currentVersionPreview;
    this.screenChanging$.next(true);

    let display = 'flex';
    if (!this.fullscreens[index]) {
      this.onToggleSidebar(true);
      display = 'none';
    } else {
      this.onToggleSidebar(false);
    }

    this.fullscreens[index] = !this.fullscreens[index];
    this.renderer.setStyle(element.nativeElement, 'display', display);

    timer(400).pipe(
      switchMap(() => {
        this.screenChanging$.next(false);
        this.cdr.detectChanges();

        return timer(50);
      }),
      tap(() => {
        // Hack for triggering change detection
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ctrl' }));
      }),
    ).subscribe();
  }

  onToggleSidebar(close?: boolean): void {
    this.screenChanging$.next(true);
    this.isSidebarClosed = close ? close : !this.isSidebarClosed;
    timer(400).pipe(
      tap(() => this.screenChanging$.next(false)),
    ).subscribe();
  }

  isActiveNode(node: TreeFilterNode): boolean {
    return node.id === this.activeNodeId;
  }

  onBack(): void {
    this.dialogRef.close(null);
  }

  onView(screen: string): void {
    const leftSectionItems = [
      {
        title: screen.charAt(0).toUpperCase() + screen.slice(1),
        class: 'dialog-btn screen-btn',
        onClick: () => this.menuTrigger.openMenu(),
      },
    ];

    this.platformHeader.assignConfig({
      ...this.platformHeader.config,
      leftSectionItems,
    });

    this.screen = screen;
    this.cdr.detectChanges();
  }
}
