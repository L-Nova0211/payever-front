import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import moment from 'moment';
import { BehaviorSubject, concat, defer, forkJoin, merge, Observable, of, OperatorFunction, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  defaultIfEmpty,
  delay,
  filter,
  map,
  skip,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { EnvService, PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { PeMediaFileTypeEnum, PeMediaInterface, PeMediaService } from '@pe/media';
import {
  PE_OVERLAY_DATA,
  PeOverlayRef,
  PeOverlayWidgetService,
  PeOverlayConfig,
  PE_OVERLAY_CONFIG,
  OverlayHeaderConfig,
} from '@pe/overlay-widget';
import { PeCustomValidators } from '@pe/shared/custom-validators';
import {
  PebTimePickerOverlayConfig,
  PebTimePickerService,
  PeListSectionButtonTypesEnum,
  PeListSectionCategoriesEnum,
  PeListSectionIntegrationInterface,
  PeListSectionTypesEnum,
} from '@pe/ui';

import { PeSocialPostStatusesEnum, PeSocialPostTypesEnum } from '../../enums';
import { PeSocialPostInterface } from '../../interfaces';
import {
  PeSocialApiService,
  PeSocialEnvService,
  PeSocialGridService,
} from '../../services';
import { PeSocialConnectListComponent } from '../connect-list';
import { PeDatepickerComponent } from '../datepicker';

@Component({
  selector: 'pe-social-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeSocialPostEditorComponent implements OnInit, OnDestroy {

  private readonly cancelBtn = this.translateService.translate('social-app.actions.cancel');
  private readonly closeBtn = this.translateService.translate('social-app.actions.close');
  private readonly doneBtn = this.translateService.translate('social-app.actions.done');
  private readonly loadingBtn = this.translateService.translate('social-app.actions.loading');
  private readonly saveBtn = this.translateService.translate('social-app.actions.save');

  private publishedChannelsIds = [];
  private integrationListDialog: PeOverlayRef;

  public readonly integrationListType = PeListSectionTypesEnum.Integrations;
  public readonly integrationsCategory = PeListSectionCategoriesEnum.Social;
  public readonly toggleButtonType = PeListSectionButtonTypesEnum.ToggleWithBeforeLabel;

  public businessId = this.envService.businessId;
  public incorrectFile$ = new BehaviorSubject<number[]>([]);
  public integrationsList$ = new BehaviorSubject<PeListSectionIntegrationInterface[]>([]);
  public loading = false;
  public media: PeMediaInterface[] = [];
  public publishResolver$ = new BehaviorSubject<boolean>(false);
  public readonly theme = this.peOverlayConfig.theme;
  public readonly postTypesEnum = PeSocialPostTypesEnum;
  public readonly postTypes = [
    {
      label: 'media',
      value: PeSocialPostTypesEnum.Media,
    },
    {
      label: 'product',
      value: PeSocialPostTypesEnum.Product,
    },
  ];

  public dateMask = [/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/];
  public timeMask = [/\d/, /\d/, ':', /\d/, /\d/, ' ', /[aApP]/, /[mM]/];

  public postForm: FormGroup = this.formBuilder.group({
    _id: [],
    channelSet: [[]],
    content: [''],
    media: [[]],
    products: [[]],
    setScheduleDate: [false],
    scheduleDate: [],
    scheduleTime: [],
    status: [],
    title: [],
    toBePostedAt: [],
    type: [PeSocialPostTypesEnum.Media],
  });

  public readonly availableIntegrations$ = this.peSocialEnvService
    .businessIntegrations$
    .pipe(
      map((integrations) => {
        const availableIntegrations = integrations
          .filter(integration => integration.enabled && integration.channelId);
        const channelSetControl = this.postForm.controls.channelSet;

        return availableIntegrations
          .map((integration) => {
            const integrationsList = this.integrationsList$.value;
            const isExisting = integrationsList
              .some(enabledIntegration => enabledIntegration._id === integration.channelId);
            const integrationToList = isExisting
              ? integrationsList.find(enabledIntegration => enabledIntegration._id === integration.channelId)
              : {
                  _id: integration.channelId,
                  enabled: integration.enabled,
                  icon: integration.title,
                  title: integration.title,
                  toggleLabel: `${integration.maxlength}`,
                  maxlength: integration.maxlength,
                  mediaRules: integration.mediaRules,
                  wasPosted: this.publishedChannelsIds
                    .some(publishedChennelId => publishedChennelId === integration.channelId),
                };

            this.publishedChannelsIds.some(publishedChennelId => publishedChennelId === integration.channelId)
            &&!channelSetControl.value.some(channel => channel === integration.channelId)
            && channelSetControl.patchValue([...channelSetControl.value, integration.channelId]);

            return integrationToList;
          });
      }),
      tap((integrationsList) => {
        this.integrationsList$.next(integrationsList);
      }));

  private readonly contentChangesListener$ = merge(
    this.postForm.controls.content.valueChanges,
    this.postForm.controls.media.valueChanges,
    this.postForm.controls.status.valueChanges,
  ).pipe(
    map(() => {
      const { controls } = this.postForm;
      const getWarning = (warningMessage: string) => this.translateService
        .translate(`social-app.post_editor.channels.warnings.${warningMessage}`);

      return this.integrationsList$.value
        .map((integration) => {
          const incorrectIndexes: number[] = [];
          let warning: string = null;

          const currentLength = controls.content.value ? controls.content.value.length : 0;
          const maxLength = integration.maxlength;
          const descriptionResolver = currentLength <= maxLength;
          const letterCount = descriptionResolver
            ? `${maxLength - currentLength}`
            : getWarning('letter_limit').replace('{exceededLetters}', `${currentLength - maxLength}`);

          let mediaResolver = true;
          const mediaRules = integration.mediaRules;
          const media = controls.media.value;

          if (media.length) {
            const imagesPerPost = media.length;
            const maxImagesPerPost = mediaRules.image.imagesPerPost;
            if (media[0].mediaMimeType === PeMediaFileTypeEnum.Image && imagesPerPost > maxImagesPerPost) {
              mediaResolver = false;
              warning = maxImagesPerPost === 0
                ? getWarning('only_video')
                : getWarning('images_per_post').replace('{maxImagesPerPost}', maxImagesPerPost);
            } else {
              media.forEach((file: PeMediaInterface, index) => {
                const mimeType = file.mediaMimeType;
                const rules = mediaRules[mimeType];
                const videoRules = mediaRules[PeMediaFileTypeEnum.Video];
                const metadata = file.metadata;

                // General media rules
                const maxFileSize = rules.maxFileSize && metadata.mediaSize
                  ? metadata.mediaSize < rules.maxFileSize : true;
                const minAspectRatio = rules.aspectRatio.min && metadata.aspectRatio
                  ? metadata.aspectRatio > rules.aspectRatio.min : true;
                const maxAspectRatio = rules.aspectRatio.max && metadata.aspectRatio
                  ? metadata.aspectRatio < rules.aspectRatio.max : true;

                if (!maxFileSize) { warning = getWarning('max_file_size'); }
                else if (!minAspectRatio || !maxAspectRatio) { warning = getWarning('aspect_ratio'); }

                // Video rules
                const videoFile = mimeType === PeMediaFileTypeEnum.Video;
                const minDuration = videoFile && videoRules.duration.min && metadata.duration
                  ? metadata.duration > videoRules.duration.min : true;
                const maxDuration = videoFile && videoRules.duration.max && metadata.duration
                  ? metadata.duration < videoRules.duration.max : true;
                const maxWidth = videoFile && videoRules.maxResolution.width && metadata.resolution
                  ? metadata.resolution.width < videoRules.maxResolution.width : true;
                const maxHeight = videoFile && videoRules.maxResolution.height && metadata.resolution
                  ? metadata.resolution.height < videoRules.maxResolution.height : true;

                if (videoFile) {
                  if (!minDuration) { warning = getWarning('min_duration'); }
                  else if (!maxDuration) { warning = getWarning('max_duration'); }
                  else if (!maxWidth) { warning = getWarning('max_width'); }
                  else if (!maxHeight) { warning = getWarning('max_height'); }
                }

                const channelResolver = maxFileSize && minAspectRatio && maxAspectRatio && (videoFile
                  ? minDuration && maxDuration && maxWidth && maxHeight
                  : true);

                if (mediaResolver) { mediaResolver = channelResolver; }
                if (!channelResolver) { incorrectIndexes.push(index); }
              });
            }
          }

          const resolverState = mediaResolver && descriptionResolver;
          const isChannelEnabled = controls.channelSet.value.some(channel => channel === integration._id);
          const directWasPosted = isChannelEnabled
            && integration.wasPosted
            && controls.status.value === PeSocialPostStatusesEnum.PostNow;
          const scheduledWasPosted = isChannelEnabled
            && controls.status.value === PeSocialPostStatusesEnum.Schedule
            && moment(controls.toBePostedAt.value).isBefore(moment(new Date()));
          const wasPosted = directWasPosted || scheduledWasPosted;
          const enabled = resolverState && isChannelEnabled;

          return {
            ...integration,
            disabled: wasPosted || !resolverState,
            enabled: wasPosted || enabled,
            indexes: incorrectIndexes,
            toggleLabel: wasPosted
              ? getWarning('was_published')
              : mediaResolver ? letterCount : warning,
          };
        });
    }),
    tap((integrationsList) => {
      this.integrationsList$.next(integrationsList);
    }));

  public readonly loading$ = new BehaviorSubject<boolean>(false);
  private readonly filterItems$ = new BehaviorSubject<any[]>([]);
  private readonly setFilter$ = new Subject<{ arrayName: string, filter: string }>();
  private readonly getFilteredData$ = this.setFilter$
    .pipe(
      filter(({ filter }) => {
        const filterValid = filter && typeof filter === 'string' && filter !== '' && filter[0] !== ' ';
        !filterValid && this.filterItems$.next([]);
        this.loading$.next(filterValid);

        return filterValid;
      }),
      debounceTime(400),
      switchMap(({ arrayName, filter }) => {
        switch (arrayName) {
          case 'products':
            return this.getProducts(filter);
          default:
            return of([]);
        }
      }),
      tap((arrayToFilter) => {
        this.loading$.value && this.filterItems$.next(arrayToFilter);
        this.loading$.next(false);
      }));

  constructor(
    // Angular
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private matDialog: MatDialog,
    // Pe Services
    private confirmScreenService: ConfirmScreenService,
    private envService: EnvService,
    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
    private pebTimePickerService: PebTimePickerService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private peMediaService: PeMediaService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
    // Social services
    private peSocialApiService: PeSocialApiService,
    private peSocialEnvService: PeSocialEnvService,
    private peSocialGridService: PeSocialGridService,
  ) {
    if (this.peOverlayData?.id) {
      this.loading = true;
      this.peOverlayConfig.doneBtnTitle = this.loadingBtn;
      this.peOverlayConfig.isLoading = true;
    }
    this.peSocialGridService.backdropClick = this.closeEditor;
    this.peOverlayConfig.backBtnCallback = this.closeEditor;
    this.peOverlayConfig.doneBtnCallback = () => {
      !this.peOverlayConfig.isLoading && this.onSave(true);
    };
  }

  ngOnDestroy(): void {
    this.integrationListDialog && this.integrationListDialog.close();
  }

  ngOnInit(): void {
    const postId = this.peOverlayData.id;
    const getPost$ = postId
      ? this.getPost(postId)
      : of(null);
    const initPostForm$ = concat(
      this.availableIntegrations$.pipe(take(1)),
      getPost$,
    ).pipe(
      skip(1),
      tap(() => {
        !postId && this.postForm.controls.channelSet.patchValue(this.integrationsList$.value.map(({ _id }) => _id));
        this.loading = false;
        this.peOverlayConfig.doneBtnTitle = this.saveBtn;
        this.peOverlayConfig.isLoading = false;
        this.cdr.markForCheck();
        this.postForm.markAsPristine();
      }),
      switchMap(() => this.availableIntegrations$),
      tap(() => {
        const { status } = this.postForm.controls;
        status.patchValue(status.value);
      }));

    merge(
      initPostForm$,
      this.contentChangesListener$,
      this.getFilteredData$,
    ).pipe(takeUntil(this.destroy$))
    .subscribe();
  }

  private errorHandler(): OperatorFunction<any, any> {
    return catchError(() => of([]));
  }

  public filteredItems(control: AbstractControl) {
    return this.filterItems$
      .pipe(
        map(arrayToFilter => arrayToFilter
          .filter((item) => {
            const itemId = item?._id ?? item?.id;

            return !control.value
              .some(controlItem => controlItem?._id === itemId || controlItem?.id === itemId);
          })));
  }

  private getProducts(filter: string = ''): Observable<any> {
    return this.peSocialApiService
      .getProducts(filter)
      .pipe(this.errorHandler());
  }

  public addToArray(element: any, control: AbstractControl): void {
    const elementId = element?.id ?? element?._id;

    control.value.length && this.updateContent(null);
    !control.value.some(el => el?.id === elementId || el?._id === elementId) && control.patchValue([element]);
    control.updateValueAndValidity();
    control.markAsDirty();
    this.updateContent(element);
  }

  public removeFromArray(control: AbstractControl, index: number): void {
    control.value.splice(index, 1);
    control.updateValueAndValidity();
    control.markAsDirty();
    this.updateContent(null);
  }

  public setFilter(filter: string, arrayName: string): void {
    this.setFilter$.next({ arrayName, filter });
  }

  private updateContent(product?: {
    currency: string,
    image: string,
    images: string[],
    price: number,
    title: string,
  }): void {
    const { content, media } = this.postForm.controls;
    const postDescription = product
      ? [
          product.title,
          product.price + ' ' + product.currency,
          content.value,
        ].join('\n')
      : content.value.split('\n').splice(2).join('\n');
    content.patchValue(postDescription);
    !product && media.patchValue([]);
    product && product.images.forEach((image) => {
      const mimeType = this.peMediaService.getMediaType(image);
      this.peMediaService.getFileByUrl(image)
        .then(mediaFile => ({
          mediaFile,
          metadata: this.peMediaService.getMediaMetadata(mediaFile, mimeType),
        }))
        .then(({ mediaFile, metadata }) => ({
          file: mediaFile,
          localUrl: null,
          mediaUrl: image,
          mediaMimeType: mimeType,
          metadata: metadata,
          wasLoaded: true,
        }))
        .then((file) => {
          media.patchValue([...media.value, file]);
        });
    });
  }

  private closeEditor = () => {
    if (this.postForm.dirty) {
      const translate = (content: string) => this.translateService.translate(content);
      const programId = this.peOverlayData?._id;
      const headingTitle = programId
        ? 'social-app.confirm_dialog.cancel.post_editor.editing.title'
        : 'social-app.confirm_dialog.cancel.post_editor.creating.title';
      const headingSubtitle = programId
        ? 'social-app.confirm_dialog.cancel.post_editor.editing.subtitle'
        : 'social-app.confirm_dialog.cancel.post_editor.creating.subtitle';
      const config: Headings = {
        title: translate(headingTitle),
        subtitle: translate(headingSubtitle),
        confirmBtnText: this.closeBtn,
        declineBtnText: this.cancelBtn,
      };

      this.confirmScreenService.show(config, true)
        .pipe(
          take(1),
          filter(Boolean),
          tap(() => {
            this.peSocialGridService.postOverlayRef.close();
          }),
          takeUntil(this.destroy$))
        .subscribe();
    } else {
      this.peSocialGridService.postOverlayRef.close();
    }
  }

  public maskRule(currentMask: (string | RegExp)[]): any {
    return {
      guide: false,
      mask: currentMask,
      showMask: false,
    };
  };

  private getPost(postId: string): Observable<any> {
    return this.peSocialApiService
      .getSocialPost(postId)
      .pipe(
        switchMap(postData => postData.productId.length
          ? this.peSocialApiService
              .getProducts(postData.productId)
              .pipe(map(products => ({ ...postData, productId: products })))
          : of(postData),
        ),
        map((postData) => {
          const date = postData?.toBePostedAt;
          const isAttachments = !!postData?.attachments.length;
          const isMedia = !! postData?.media.length;
          const mediaFromPost = isAttachments
            ? postData.attachments
            : isMedia
              ? postData.media
              : [];

          this.publishedChannelsIds = postData.channelSet;
          const availableChannels = postData.channelSet
            .filter(channel => this.integrationsList$.value
              .some(integration => integration._id === channel));

          const post = {
            _id: postData.id,
            channelSet: availableChannels,
            content: postData.content,
            isAttachments: isAttachments,
            mediaType: postData.mediaType,
            products: postData.productId,
            scheduleDate: date ? moment(date).format('DD.MM.YYYY') : null,
            scheduleTime: date ? moment(date).format('hh:mm a').toUpperCase() : null,
            setScheduleDate: !!date,
            status: postData.status,
            toBePostedAt: date,
            type: postData.type,
          };
          this.postForm.patchValue(post);

          return {
            isAttachments: isAttachments,
            media: mediaFromPost,
          };
        }),
        switchMap(({ isAttachments, media }) => {
          const media$ = media.map((file): Observable<PeMediaInterface> => {
            return defer(async (): Promise<PeMediaInterface> => {
              const url = isAttachments
                ? file.previewUrl ?? file.url
                : file;
              const mimeType = this.peMediaService.getMediaType(url);

              return await this.peMediaService.getFileByUrl(url)
                .then(mediaFile => this.peMediaService.getMediaMetadata(mediaFile, mimeType))
                .then(metadata => ({
                  localUrl: null,
                  mediaUrl: url,
                  mediaMimeType: mimeType,
                  metadata: metadata,
                  wasLoaded: true,
                }));
            });
          });

          return forkJoin(media$);
        }),
        defaultIfEmpty([]),
        delay(500),
        tap((media) => {
          media.length && this.postForm.controls.media.patchValue(media);
        }));
  }

  public onMediaChange(media: PeMediaInterface[]): void {
    this.postForm.controls.media.patchValue(media);
    this.postForm.markAsDirty();
  }

  public checkCorrect(integration: PeListSectionIntegrationInterface): void {
    this.incorrectFile$.next(integration?.indexes ? integration.indexes : []);
  }

  public openDatepicker(dateControl: AbstractControl): void {
    const currentDate = dateControl.value;
    const dateFormat = 'DD.MM.YYYY';
    const setDate = moment(currentDate, dateFormat);
    const validDate = setDate.isValid() ? setDate.toDate() : null;
    const config: MatDialogConfig = {
      panelClass: ['datepicker', this.theme],
      data: validDate,
    };

    this.matDialog
      .open(PeDatepickerComponent, config)
      .afterClosed()
      .pipe(
        take(1),
        filter(value => !!value),
        tap((value) => {
          const date = moment(value).format(dateFormat);
          dateControl.patchValue(date);
          dateControl.markAsDirty();
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public openTimepicker(event: MouseEvent, timeControl: AbstractControl): void {
    const currentTime = timeControl.value;
    const setTime = moment(currentTime, 'hh:mm A');
    const validTime = setTime.isValid() ? setTime : moment(new Date(), 'hh:mm A');
    const timeToCorrect = validTime.format('hh:mm A').toString();
    const config: PebTimePickerOverlayConfig = {
      theme: this.theme,
      position: {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetX: 18,
        offsetY: -12,
      },
      timeConfig: {
        animation: 'fade',
        time: timeToCorrect,
      },
    };

    this.pebTimePickerService
      .open(event, config)
      .afterClosed
      .pipe(
        take(1),
        tap((value) => {
          const time = value ? value : timeToCorrect;
          const formatedTime = moment(time, 'hh:mm A').format('hh:mm A');
          timeControl.patchValue(formatedTime);
          timeControl.markAsDirty();
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public onSave(toSave: boolean): void {
    this.postForm.clearValidators();
    const { controls } = this.postForm;
    const postId = controls._id.value;

    if (controls.media.value.length) {
      controls.content.clearValidators();
    } else {
      controls.content.setValidators([Validators.required]);
    }
    controls.content.updateValueAndValidity();

    controls.channelSet.setValidators([PeCustomValidators.MinArrayLength(toSave ? 0 : 1)]);
    controls.channelSet.updateValueAndValidity();

    let toBePostedAt: string;
    if (controls.setScheduleDate.value) {
      const date = controls.scheduleDate.value;
      const time = controls.scheduleTime.value;
      const currentDateTime = moment(new Date(), 'DD.MM.YYYY HH:mm:ss');
      const currentDate = moment(new Date(), 'DD.MM.YYYY').startOf('day');
      const datetime = moment(`${date} ${time}`, 'DD.MM.YYYY hh:mm:ss a');
      const scheduleDate = moment(date, 'DD.MM.YYYY');
      const scheduleTime = moment(time, 'hh:mm:ss a');
      const isDateValid = scheduleDate.isValid() && currentDate.isSameOrBefore(scheduleDate);
      const isTimeValid = scheduleTime.isValid() && currentDateTime.isBefore(datetime);
      const dateValid: ValidatorFn = () => !isDateValid ? { invalidValue: true } : null;
      controls.scheduleDate.setValidators([dateValid]);
      const timeValid: ValidatorFn = () => !isTimeValid ? { invalidValue: true } : null;
      controls.scheduleTime.setValidators([timeValid]);
      toBePostedAt = isDateValid && isTimeValid
        ? datetime.toISOString()
        : null;
    } else {
      controls.scheduleDate.setValidators(null);
      controls.scheduleTime.setValidators(null);
      toBePostedAt = null;
    }
    controls.scheduleDate.updateValueAndValidity();
    controls.scheduleTime.updateValueAndValidity();
    const { dirty, invalid, valid } = this.postForm;
    const isPublishFromDraft = !toSave && controls.status.value === PeSocialPostStatusesEnum.Draft;

    if ((dirty || isPublishFromDraft) && valid) {
      const postData: PeSocialPostInterface = {
        channelSet: controls.channelSet.value
          .filter(channelId => this.integrationsList$.value
            .some(channel => channel._id === channelId)),
        content: controls.content.value.trimEnd().replace(/^\s+/, ''),
        media: controls.type.value === PeSocialPostTypesEnum.Product
          ? controls.products.value.reduce((images, product) => [...images, ...product.images], [])
          : controls.media.value.map(file => postId ? file.mediaUrl : file.file),
        parentFolderId: this.peOverlayData.parentFolderId,
        productId: controls.type.value === PeSocialPostTypesEnum.Product
          ? controls.products.value.map(product => product._id)
          : [],
        status: toSave
          ? PeSocialPostStatusesEnum.Draft
          : controls.setScheduleDate.value
            ? PeSocialPostStatusesEnum.Schedule
            : PeSocialPostStatusesEnum.PostNow,
        toBePostedAt,
        type: controls.type.value,
      };

      of(postId)
        .pipe(
          switchMap((postId) => {
            this.loading = true;
            this.peOverlayConfig.doneBtnTitle = this.loadingBtn;
            this.peOverlayConfig.isLoading = true;
            this.cdr.detectChanges();

            return postId
              ? this.peSocialApiService.updatePost(postId, postData)
              : postData.type === PeSocialPostTypesEnum.Media
                ? this.peSocialApiService.createPostOfMedia(postData)
                : this.peSocialApiService.createPostOfProduct(postData);
          }),
          map(post => this.peOverlayData?.applicationScopeElasticId
            ? {
                ...post,
                applicationScopeElasticId: this.peOverlayData.applicationScopeElasticId,
              }
            : post,
          ),
          tap((post) => {
            const isUpdate = post.createdAt !== post.updatedAt;
            const condition = toSave
              ? isUpdate
                ? 'social-app.notify.post_updated'
                : 'social-app.notify.post_saved'
              : postData.toBePostedAt
                ? 'social-app.notify.post_scheduled'
                : 'social-app.notify.post_published';
            const notify = this.translateService.translate(condition);
            this.peOverlayConfig.onSaveSubject$.next({ post, notify });
          }),
          catchError(() => {
            this.loading = false;
            this.peOverlayConfig.doneBtnTitle = this.saveBtn;
            this.peOverlayConfig.isLoading = false;
            this.cdr.markForCheck();

            return of(true);
          }),
          takeUntil(this.destroy$))
        .subscribe();
    } else if (dirty || invalid) {
      this.cdr.detectChanges();
    } else {
      this.peSocialGridService.postOverlayRef.close();
    }
  }

  public addIntegration(): void {
    const closeIntegrationListDialog = () => {
      this.integrationListDialog.close();
    };
    const config: PeOverlayConfig = {
      backdropClick: closeIntegrationListDialog,
      hasBackdrop: true,
      headerConfig: {
        backBtnCallback: closeIntegrationListDialog,
        backBtnTitle: this.cancelBtn,
        doneBtnCallback: closeIntegrationListDialog,
        doneBtnTitle: this.doneBtn,
        removeContentPadding: false,
        title: this.translateService.translate('social-app.connect.title'),
        theme: this.theme,
      },
      component: PeSocialConnectListComponent,
    };

    this.integrationListDialog = this.peOverlayWidgetService.open(config);
  }

  public showWarning(notification: string): void {
    this.peSocialEnvService.showWarning(notification);
  }

  public switchChannel(integration: PeListSectionIntegrationInterface): void {
    const { _id, enabled } = integration;
    const integrationsList = this.integrationsList$.value;
    const index = integrationsList.findIndex(integration => integration._id === _id);
    integrationsList[index].enabled = !enabled;
    this.integrationsList$.next(integrationsList);

    const channelSetControl = this.postForm.controls.channelSet;
    const enabledChannels = !enabled
      ? [...channelSetControl.value, _id]
      : channelSetControl.value.filter(channel => channel !== _id);
    channelSetControl.patchValue(enabledChannels);
    channelSetControl.markAsDirty();
  }
}
