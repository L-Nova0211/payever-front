import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, merge, Observable, of, Subject } from 'rxjs';
import {
  concatMap,
  debounceTime,
  filter,
  map,
  startWith,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { MediaService } from '@pe/builder-api';
import { MediaItemType, PebMediaItem, PebMediaSidebarCollectionFilters } from '@pe/builder-core';
import {
  MenuSidebarFooterData,
  PeDataGridFilter,
  PeDataGridItem,
  PeDataGridLayoutType,
  PeDataGridListOptions,
  PeDataGridSingleSelectedAction,
  PeDataGridSortByAction,
  PeDataGridTheme,
  TreeFilterNode,
} from '@pe/common';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { TreeSidebarFilterComponent } from '@pe/sidebar';

type MediaCategory = string;
export interface MediaDataInterface {
  types?: MediaItemType[];
}

@Component({
  selector: 'peb-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebMediaComponent implements OnInit, OnDestroy {

  @ViewChild('studioTreeFilter', { read: TreeSidebarFilterComponent }) studioTreeFilter: TreeSidebarFilterComponent;

  private destroy$ = new Subject<void>();
  private headerConfig: PePlatformHeaderConfig;

  private readonly pageLimit = 30;

  readonly refresh$ = new BehaviorSubject(true);

  readonly PeDataGridLayoutType = PeDataGridLayoutType;

  readonly formGroup = this.formBuilder.group({
    categoriesTree: [[]],
    stylesTree: [[]],
    formatsTree: [[]],
    hasPeopleTree: [[]],
  });

  readonly sortByOptions: PeDataGridSortByAction[] = [
    { label: 'Popularity', callback: () => this.sortSubject$.next({ sort: 'popularity', emitValue: true }) },
    { label: 'Relevance', callback: () => this.sortSubject$.next({ sort: 'relevance', emitValue: true }) },
  ];

  private readonly sortSubject$ = new Subject<{ sort: string, emitValue: boolean }>();
  private readonly sort$ = this.sortSubject$.asObservable().pipe(
    filter(value => value.emitValue),
    map(value => value.sort),
  );

  readonly categorySingleSelectedAction: PeDataGridSingleSelectedAction = {
    label: 'Open',
    callback: (id: string) => {
      const treeNode = this.categoriesTreeNodesSubject$.getValue()[id];
      this.formGroup.get('categoriesTree').setValue(
        treeNode ? [treeNode] : [],
      );
    },
  };

  readonly itemSingleSelectedAction: PeDataGridSingleSelectedAction = {
    label: 'Select',
    callback: (selectedId: string): void => {
      const media = this.mediasSubject$.getValue().find(m => m.sourceUrl === selectedId);
      this.dialogRef.close({
        thumbnail: media?.thumbnail ?? PebMediaComponent.sourceUrlToThumbnail(media?.sourceUrl),
        sourceUrl: media?.sourceUrl,
      });
    },
  };

  readonly sidebarFooterData: MenuSidebarFooterData = {
    menuItems: [
      {
        title: 'Add New Category',
        onClick: () => {
          const album = {
            name: '',
            // parentId: this.formGroup.get('categoriesTree').value.length ?
            //   this.formGroup.get('categoriesTree').value[0]?.id : null,
            children: [],
          };
          this.newCategoryItemSubject$.next(album);
          this.refresh$.next(true);
        },
      },
    ],
  };

  private readonly categoriesSubject$ = new BehaviorSubject<MediaCategory[]>([]);
  readonly categories$ = this.categoriesSubject$.asObservable();
  readonly categoriesItems$: Observable<PeDataGridItem[]> = this.categories$.pipe(
    map(categories => categories?.map(category => ({
      id: category,
      title: category,
      image: null,
      actions: [this.categorySingleSelectedAction],
    })) ?? []),
  );

  private readonly categoriesTreeNodesSubject$ = new BehaviorSubject<{ [key: string]: TreeFilterNode }>({});
  private readonly newCategoryItemSubject$ = new BehaviorSubject<TreeFilterNode>(null);
  readonly categoriesTree$: Observable<TreeFilterNode[]> = combineLatest([
    this.categories$,
    this.newCategoryItemSubject$,
  ]).pipe(
    map(([categories, newCategoryItem]) => {
      const result: TreeFilterNode[] = categories.map(category => ({
        id: category,
        name: category,
        data: category,
        image: 'assets/media/album.svg',
        children: [],
      }));
      if (newCategoryItem) {
        result.push(newCategoryItem);
      }

      return result;
    }),
    tap((nodes: TreeFilterNode[]) => this.categoriesTreeNodesSubject$.next(nodes.reduce(
      (acc, node) => {
        acc[node.id] = node;

        return acc;
      },
      {},
    ))),
  );

  private readonly stylesSubject$ = new BehaviorSubject<string[]>([]);
  readonly styles$ = this.stylesSubject$.asObservable();
  readonly stylesTree$: Observable<TreeFilterNode[]> = this.styles$.pipe(
    map(styles => styles?.map(style => ({
      id: style,
      name: style,
      data: style,
      image: 'assets/media/album.svg',
      children: [],
    })) ?? []),
  );

  private readonly formatsSubject$ = new BehaviorSubject<string[]>([]);
  readonly formats$ = this.formatsSubject$.asObservable();
  readonly formatsTree$: Observable<TreeFilterNode[]> = this.formats$.pipe(
    map(formats => formats?.map(style => ({
      id: style,
      name: style,
      data: style,
      image: 'assets/media/album.svg',
      children: [],
    })) ?? []),
  );

  readonly hasPeopleTree: TreeFilterNode[] = [
    {
      name: 'Include',
      data: true,
      image: 'assets/icons/includepeople-icon-filter.png',
    },
    {
      name: 'Exclude',
      data: false,
      image: 'assets/icons/excludepeople-icon-filter.png',
    },
  ];

  private readonly mediasSubject$ = new BehaviorSubject<PebMediaItem[]>([]);
  private readonly mediaTotalCountSubject$ = new BehaviorSubject(0);
  readonly medias$ = this.mediasSubject$.asObservable();
  readonly mediasItems$: Observable<PeDataGridItem[]> = this.medias$.pipe(
    map(medias => medias?.map(media => ({
      id: media.sourceUrl,
      title: media.mongoId,
      image: media.thumbnail || PebMediaComponent.sourceUrlToThumbnail(media.sourceUrl),
      actions: [],
    })) ?? []),
  );

  private readonly mediaFilters$: Observable<PebMediaSidebarCollectionFilters> = combineLatest([
    this.formGroup.get('categoriesTree').valueChanges.pipe(
      startWith(this.formGroup.get('categoriesTree').value),
      map(nodes => nodes.map(node => node.id)),
    ),
    this.sort$.pipe(
      startWith(undefined),
    ),
    this.formGroup.get('stylesTree').valueChanges.pipe(
      startWith(this.formGroup.get('stylesTree').value),
      map(nodes => nodes.map(node => node.id)),
    ),
    this.formGroup.get('formatsTree').valueChanges.pipe(
      startWith(this.formGroup.get('formatsTree').value),
      map(nodes => nodes.map(node => node.id)),
    ),
    this.formGroup.get('hasPeopleTree').valueChanges.pipe(
      startWith(this.formGroup.get('hasPeopleTree').value),
      map(nodes => nodes.map(node => node.data)),
    ),
  ]).pipe(
    map(([categories, sortBy, styles, formats, hasPeople]) => ({
      categories,
      styles,
      formats,
      hasPeople: hasPeople ?? undefined,
      sortBy: sortBy ?? undefined,
      type: this.types,
    })),
  );

  private readonly gridScrollBottomOn$ = new Subject<void>();

  theme = PeDataGridTheme.Dark;

  types: MediaItemType[] = [MediaItemType.Image];
  data: PeDataGridItem[] = [];

  dataGridListOptions: PeDataGridListOptions = {
    nameTitle: 'Item',
    descriptionTitle: 'Type',
  };

  readonly filters: PeDataGridFilter[] = [];

  private static sourceUrlToThumbnail(sourceUrl: string): string {
    return sourceUrl && !/-thumbnail$/i.test(sourceUrl) ? `${sourceUrl}-thumbnail` : sourceUrl;
  }

  constructor(
    private formBuilder: FormBuilder,
    private mediaService: MediaService,
    private cdr: ChangeDetectorRef,
    private platformHeader: PePlatformHeaderService,
    public dialogRef: MatDialogRef<PebMediaComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: MediaDataInterface,
  ) { }

  ngOnInit(): void {
    if (this.dialogData?.types?.length) {
      this.types = this.dialogData.types;
    }

    this.createHeader();

    merge(
      this.mediaService.getCategories(this.types).pipe(
        tap(categories => this.categoriesSubject$.next(categories)),
      ),
      this.mediaService.getStyles(this.types).pipe(
        tap(styles => this.stylesSubject$.next(styles)),
      ),
      this.mediaService.getFormats(this.types).pipe(
        tap(formats => this.formatsSubject$.next(formats)),
      ),

      this.mediaFilters$.pipe(
        switchMap((filters) => {
          this.mediasSubject$.next([]);

          return this.mediaService.getCollection({
            filters,
            pagination: { limit: this.pageLimit, offset: 0 },
          }).pipe(
            map((item) => {
              this.mediaTotalCountSubject$.next(item.total);

              return item.list;
            }),
          );
        }),
        tap(medias => this.mediasSubject$.next(medias)),
      ),

      this.gridScrollBottomOn$.pipe(
        debounceTime(100),
        withLatestFrom(this.mediaFilters$),
        concatMap(([, filters]) => of(undefined).pipe(
          withLatestFrom(this.mediasItems$),
          filter(([, mediaItems]) => mediaItems.length < this.mediaTotalCountSubject$.getValue()),
          switchMap(([, mediasItems]) => this.mediaService.getCollection({
            filters,
            pagination: { limit: this.pageLimit, offset: mediasItems.length },
          })),
          map(item => item.list),
          tap(items => this.mediasSubject$.next([...this.mediasSubject$.getValue(), ...items])),
        )),
      ),
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    if (this.headerConfig) {
      this.platformHeader.setConfig(this.headerConfig);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  gridItemTrackBy(el: PeDataGridItem) {
    return el.id;
  }

  scrollBottomOn() {
    this.gridScrollBottomOn$.next();
  }

  private createHeader(): void {
    this.headerConfig = this.platformHeader.config;
    this.platformHeader.setConfig({
      mainDashboardUrl: null,
      currentMicroBaseUrl: null,
      isShowShortHeader: false,
      mainItem: null,
      isShowMainItem: false,
      closeItem: {
        title: 'Close',
        onClick: () => this.dialogRef.close(),
      },
      isShowCloseItem: true,
      businessItem: null,
      isShowBusinessItem: false,
      isShowBusinessItemText: false,
    });
  }
}
