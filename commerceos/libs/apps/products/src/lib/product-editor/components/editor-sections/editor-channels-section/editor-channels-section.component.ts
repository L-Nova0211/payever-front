import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncSubject, Observable } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService } from '@pe/common';
import {
  ErrorBag,
  FormAbstractComponent,
  FormScheme,
  FormSchemeField,
} from '@pe/forms';

import { AppInstanceEnum } from '../../../../shared/enums/app.enum';
import { ChannelTypes } from '../../../../shared/enums/product.enum';
import { PE_CHANNELS_GROUPS, PeChannelGroup } from '../../../../shared/interfaces/channel-group.interface';
import { ChannelInterface } from '../../../../shared/interfaces/channel.interface';
import { ChannelsSection } from '../../../../shared/interfaces/section.interface';
import { ChannelsService, SectionsService } from '../../../services';
import { CountryService } from '../../../services/country.service';

import { ProductEditorSections } from './../../../../shared/enums/product.enum';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'channels-section',
  templateUrl: 'editor-channels-section.component.html',
  styleUrls: ['editor-channels-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorChannelsSectionComponent extends FormAbstractComponent<ChannelsSection> implements OnInit {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  channelTypesEnum: typeof ChannelTypes = ChannelTypes;
  channels$: AsyncSubject<ChannelInterface[]> = new AsyncSubject<ChannelInterface[]>();

  hasChannels: boolean;
  channelsGroups: PeChannelGroup[] = [];
  defaultChannels: PeChannelGroup[] = PE_CHANNELS_GROUPS;

  readonly section: ProductEditorSections = ProductEditorSections.Channels;
  channelsSection: ChannelsSection[] = this.sectionsService.channelsSection;
  formScheme: FormScheme;
  formTranslationsScope = 'channelssection.form';
  protected formStorageKey = 'channelssection.form';

  constructor(
    injector: Injector,
    private activatedRoute: ActivatedRoute,
    private sectionsService: SectionsService,
    private channelsService: ChannelsService,
    private countryService: CountryService,
    protected errorBag: ErrorBag,
    private envService: EnvService,
  ) {
    super(injector);
  }

  get panelOpened$(): Observable<ProductEditorSections> {
    return this.sectionsService.activeSection$.pipe(
      filter(() => !this.channels$.isStopped), // && !this.shops$.isStopped),
      filter((section: ProductEditorSections) => section === this.section),
    );
  }

  ngOnInit(): void {
    this.loadChannelSets();
  }

  getFields(channels: ChannelInterface[], channelType: ChannelTypes): FormSchemeField[] {
    return channels.map(
      (channel: ChannelInterface, i: number) =>
      ({
        id: channel.id,
        name: `${channelType}${i}`,
        type: 'slide-toggle',
        fieldSettings: {
          classList: 'col-xs-12 expansion-panel-channel-title',
          label: channel.name,
        },
      } as FormSchemeField),
    );
  }

  onToggle(value: boolean, channelSetId: string, channelType: ChannelTypes, name: string): void {
    this.sectionsService.onChangeChannelsSection(
      {
        id: channelSetId,
        type: channelType,
        name,
      },
      value,
    );
  }

  private prepareControlsConfig(
    channels: ChannelInterface[],
    initalValue: ChannelsSection[]
  ): {
    controlsConfig: { [key: string]: any },
    fieldsets: { [key: string]: FormSchemeField[] }
  } {
    const isEdit: boolean = this.sectionsService.isEdit;
    const fieldsets: { [key: string]: FormSchemeField[] } = {};
    const controlsConfig: any = {};
    this.channelsGroups.forEach((channelDesc) => {

      const channelsByType: ChannelInterface[] = channels.filter(channel => channel.type === channelDesc.type);
      fieldsets[channelDesc.type] = this.getFields(channelsByType, channelDesc.type);

      channelsByType.forEach((channel, i) => {
        if (isEdit) {
          controlsConfig[`${channel.type}${i}`] = [
            initalValue.some((channelSet: ChannelsSection) => channelSet.id === channel.id),
          ];
        } else {
          // controlsConfig[`${channel.type}${i}`] = [channel['id'] === appId]; // current channel will be true
          controlsConfig[`${channel.type}${i}`] = true; // all channels will be true for new product
          this.sectionsService.onChangeChannelsSection(
            {
              id: channel.id,
              type: channel.type,
              name: channel.name,
            },
            true,
          );
        }
      });
    });

    return { controlsConfig, fieldsets };
  }

  protected createForm(initialData: ChannelsSection): void {

    this.channels$.pipe(
      tap((channels) => {
        const { controlsConfig, fieldsets } = this.prepareControlsConfig(channels, this.channelsSection);
        this.hasChannels = channels.length > 0;
        this.form = this.formBuilder.group(controlsConfig);
        this.formScheme = {
          fieldsets,
        };


        this.changeDetectorRef.detectChanges();
      }),
      switchMap((channels) => {
        return this.countryService.updatedCountry$.pipe(
          tap(() => {
            const { controlsConfig, fieldsets } = this.prepareControlsConfig(channels, this.channelsSection);
            this.formScheme = {
              fieldsets,
            };

            Object.keys(controlsConfig).forEach((key) => {
              controlsConfig[key] = controlsConfig[key][0];
            });

            this.form.setValue(controlsConfig);
          }),
        );
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  protected onUpdateFormData(formValues: any): void {
    /* tslint:disable:no-empty */
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }

  private loadChannelSets(): void {
    const currentChannelSet: string = this.activatedRoute.snapshot.queryParams.channelSet;
    const app: AppInstanceEnum = this.activatedRoute.snapshot.queryParams.app;

    this.channelsService.channels$
      .pipe(
        map((channels: ChannelInterface[]) => {
          let result: ChannelInterface[] = [];
          if (currentChannelSet && [AppInstanceEnum.Pos, AppInstanceEnum.Shop].includes(app)) {
            result = [...result, ...channels.filter((channel: ChannelInterface) => channel.id !== currentChannelSet)];
          }

          return result.length ? result : channels;
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe((channels: ChannelInterface[]) => {
        if (channels != null) {
          const channelsGroups: PeChannelGroup[] = PE_CHANNELS_GROUPS.filter((channelGroup) => {
            return channels.some(channel => channel.type === channelGroup.type);
          });

          this.channelsGroups = [...channelsGroups];
          this.sectionsService.channelsGroups = [...channelsGroups];

          this.channels$.next(channels);
          this.channels$.complete();
        }
      });
  }
}
