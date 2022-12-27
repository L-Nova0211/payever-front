import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import isEqual from 'lodash/isEqual';
import { BehaviorSubject } from 'rxjs';
import { filter, map, pairwise, shareReplay, takeUntil, tap } from 'rxjs/operators';

import { PebAbstractTextElement } from '@pe/builder-abstract';
import {
  getLinkedValue,
  isImageContext,
  isIntegrationAction,
  isIntegrationData,
  isIntegrationInteraction,
  isIntegrationSelectLink,
  MediaType,
  PebElementContext,
  PebElementContextState,
  PebElementType,
  PebIntegrationAction,
  PebIntegrationActionTag,
  PebIntegrationDataType,
  PebIntegrationFieldMetaSubtype,
  PebIntegrationFilterType,
  pebInteractionCreator,
  PebInteractionType,
  PebLanguagesData,
  PebTextVerticalAlign,
} from '@pe/builder-core';
import { getBackgroundStyle } from '@pe/builder-renderer';
import { PebTextEditorService } from '@pe/builder-text-editor';


@Component({
  selector: 'peb-element-shape-maker',
  templateUrl: './shape.maker.html',
  styleUrls: ['./shape.maker.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PebTextEditorService,
    MatIconRegistry,
  ],
})
export class PebShapeMakerElement extends PebAbstractTextElement {

  readonly PebLanguagesData = PebLanguagesData;


  mediaType = MediaType;

  @ViewChild('video') video: ElementRef<HTMLVideoElement>;

  dropdownParams = { label: null, options: [] };
  formControl = new FormControl(undefined);

  videoLoaded$ = new BehaviorSubject<boolean>(false);
  isVideoLoading = false;

  isNotInteractions$ = this.options$.pipe(
    map(options => !options.interactions),
    shareReplay(1),
  );

  get isFilter() {
    const functionLink = this.data.functionLink as PebIntegrationAction;

    return isIntegrationAction(functionLink) && functionLink?.tags.includes(PebIntegrationActionTag.GetFilters)
  }

  get isPriceSort() {
    return this.isFilter && (this.data.functionLink as PebIntegrationAction).actionData.type === 'sort-select';
  }

  get isTypeFilter() {
    return this.isFilter && (this.data.functionLink as PebIntegrationAction).actionData.type === 'select';
  }

  get document() {
    return this.editorAccessorService.iframe?.contentDocument ?? Document;
  }

  get videoLoaded(): boolean {
    return this.videoLoaded$.value;
  }

  get verticalAlign(): PebTextVerticalAlign {
    return this.styles.verticalAlign ?? PebTextVerticalAlign.Center;
  }

  readonly dataType = PebIntegrationDataType;

  readonly isSVG$ = this.style$.pipe(
    map(() => this.styles?.backgroundImageMimeType === 'image/svg+xml'),
    shareReplay(1),
  );

  readonly type$ = this.style$.pipe(
    map(() => {
      if (this.styles.backgroundRepeat === 'repeat') {
        return 'till';
      }

      return 'original';
    }),
  );

  readonly scale$ = this.style$.pipe(
    map(() => {
      const backgroundSize = this.styles.backgroundSize.toString();
      const match = backgroundSize.match(/\d+/g);
      if (match) {
        return Number(match[0]) / 100;
      }

      return 1;
    }),
    shareReplay(1),
  );

  get mappedStyles() {
    const styles = this.styles as any;
    const borderRadius = parseInt(this.styles.borderRadius as string, 10);
    const isGridCell = this.element.parent?.type === PebElementType.Grid;

    const result = {
      host: {
        position: isGridCell ? 'relative' : 'absolute',
        transform: styles.transform,
        textShadow: styles.textShadow ? styles.textShadow : null,
        alignItems: styles.alignItems ? styles.alignItems : null,
        top: isGridCell ? null : `${styles.top}px`,
        left: isGridCell ? null : `${styles.left}px`,

        padding: styles.padding ? `${styles.padding}px` : null,
        overflowWrap: styles.overflowWrap || null,

        width: isGridCell ? null : `${styles.width}px`,
        height: isGridCell ? null :`${styles.height}px`,
        zIndex: styles.zIndex ?? null,

        ...('minWidth' in styles && { minWidth: `${styles.minWidth}px` }),
        ...('minHeight' in styles && { minHeight: `${styles.minHeight}px` }),

        ...('maxWidth' in styles && { maxWidth: `${styles.maxWidth}px` }),
        ...('maxHeight' in styles && { maxHeight: `${styles.maxHeight}px` }),

        ...(
          isIntegrationSelectLink(this.data?.functionLink)
          && this.options.readOnly
          && this.data?.functionLink.property === 'variants'
          && !this.dropdownParams?.options?.length
          && { visibility: 'hidden' }
        ),
      },
    };

    if (styles.backgroundImageMimeType === 'image/svg+xml' && styles.backgroundImage) {
      Object.assign(result, {
        svgWrap: {
          ...('borderRadius' in styles && { borderRadius: `${borderRadius}px` }),
        },
        svgIconWrap: {
          ...('backgroundColor' in styles && { fill: styles.imageBackgroundColor, color: styles.imageBackgroundColor }),
          fillOpacity: styles.imageOpacity ?? null,
          stroke: styles.borderStyle !== 'none' ? styles.borderColor : null,
          strokeWidth: `${styles.borderWidth}%`,
          strokeDasharray: this.getStrokeDashArray(),
          ...('shadow' in styles && { filter: styles.shadow }),
          opacity: styles.opacity ?? null,
        },
      })
    } else {
      let backgroundStyle = getBackgroundStyle(styles);

      if (isIntegrationData(this.data.functionLink) && isImageContext(this.data.functionLink)) {
        const { integration, ...data } = this.data.functionLink;
        const contextData: PebElementContext<any> =
          this.rendererContext[`@${integration?.tag}-${data?.contextIntegration}`];

        if ((this.context?.state === PebElementContextState.Ready && this.context?.data?.imagesUrl)
          || (contextData?.state === PebElementContextState.Ready && contextData?.data?.imagesUrl)) {
          backgroundStyle = {
            ...backgroundStyle,
            backgroundColor: null,
            backgroundImage: `url("${this.context?.data?.imagesUrl?.[0] ?? contextData?.data?.imagesUrl?.[0]}")`,
            backgroundPosition: backgroundStyle.backgroundPosition ?? 'center',
            backgroundRepeat: backgroundStyle.backgroundRepeat ?? 'no-repeat',
            backgroundSize: backgroundStyle.backgroundSize ?? 'contain',
            mediaType: MediaType.Image,
          }
        }

        if (this.context?.state === PebElementContextState.Empty) {
          backgroundStyle = {
            backgroundImage: null,
            mediaType: MediaType.None,
          }
        }
      }

      Object.assign(result, {
        videoWrap: {
          ...('borderRadius' in styles && { borderRadius: `${borderRadius}px` }),
        },
        video: {
          opacity: styles.opacity,
          objectFit: this.data?.videoObjectFit?.value || styles.objectFit || 'contain',
          objectPosition: this.data?.videoObjectFitPosition || 'center center',
          willChange: 'transform',
          transform: `scale(${this.data?.videoScale / 100 || 1})`,
          visibility: this.data?.isLoading ? 'hidden' : 'visible',
        },
        img: {
          objectFit: styles.objectFit || 'contain',
          ...('borderRadius' in styles && { borderRadius: `${borderRadius}px` }),
          ...('height' in styles && { height: `${styles.height}px` }),
          ...('width' in styles && { width: `${styles.width}px` }),
        },
        overlay: {
          ...('backgroundColor' in styles && { backgroundColor: styles.backgroundColor }),
          ...backgroundStyle,
          opacity: styles.opacity ?? null,
          ...('borderRadius' in this.styles && { borderRadius: this.element.meta?.borderRadiusDisabled ? '50%' : `${borderRadius}px` }),
          ...('shadow' in styles && { filter: styles.shadow }),
          borderStyle: styles.borderStyle ?? null,
          borderColor: styles.borderColor ?? null,
          borderWidth: `${styles.borderWidth}px` ?? null,
        },
      })
    }

    return result;
  }

  getMaskByType(type) {
    switch (type) {
      case 'date':
        return {
          mask: [/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/],
          guide: true,
          placeholderChar: '\u2000',
          keepCharPositions: false,
        }
      case 'time':
        return {
          mask: [/\d/, /\d/, ':', /\d/, /\d/],
          guide: true,
          placeholderChar: '\u2000',
          keepCharPositions: false,
        };
      default:
        return { mask: false }
    }
  }

  private getStrokeDashArray(): string {
    switch (this.styles.borderStyle) {
      case 'dotted':
        return '1%';
      case 'dashed':
        return '5%';
      default:
        return null;
    }
  }

  ngOnInit() {
    if (this.options.readOnly) {
      this.dropdownParams = this.getDropdownParams();

      if (this.context && (this.isPriceSort || this.isTypeFilter)) {
        this.dropdownParams = this.getOrderParams();
      }

      this.editorAccessorService.renderer.context$.pipe(
        pairwise(),
        filter(([prev, curr]) => !isEqual(prev['@cart'], curr['@cart'])),
        tap(() => {
          this.checkActionAnimationState();
        }),
        takeUntil(this.destroy$),
      ).subscribe();
    }

    super.ngOnInit();
  }

  onLoaded(): void {
    this.isVideoLoading = false;
    this.videoLoaded$.next(true);
  }

  getMediaType() {
    return this.styles.mediaType;
  }

  getDropdownParams(): { label: string, options: Array<{ title: string, value: any }> } {
    if (isIntegrationSelectLink(this.data?.functionLink)) {
      const data = this.data.functionLink;
      const { integration } = this.data.functionLink;
      if (
        data?.dataType === PebIntegrationDataType.Select &&
        data.subType === PebIntegrationFieldMetaSubtype.Array
      ) {
        const context = this.rendererContext[`@${integration?.tag}-${data.contextIntegration}`];
        if (context?.state === PebElementContextState.Ready) {
          const result = {
            label: data.title,
            options: getLinkedValue(context.data, data.property)?.map(item => ({
              title: getLinkedValue(item, data.titleProp),
              value: getLinkedValue(item, data.valueProp),
            })),
          };
          if (!result.options?.find(o => o.value === this.formControl.value)) {
            this.formControl.setValue(null, { emitEvent: false });
          }

          return result;
        }
      }
    }

    return { label: null, options: [] };
  }

  getOrderParams(): {
    label: string,
    options: Array<{ label: string, value: string, field: string, selected?: boolean }>
  } {
    let context;
    let options;

    if (this.isPriceSort) {
      context = this.context.data.find(params => params.type === PebIntegrationFilterType.SortSelect);

      const rendererContext = this.rendererContext['@product-sort']?.data;
      const params = rendererContext instanceof Array
        ? rendererContext.reduce((acc, ctx) => {
          acc[`${ctx?.field}.${ctx?.direction}`] = true;

          return acc;
        }, {})
        : {};

      options = context.options.map((option) => {
        return {
          ...option,
          selected: option.selected ?? !!params[`${option?.field}.${option?.value}`],
        };
      });
    }

    if (this.isTypeFilter) {
      context = this.context.data.find(params => params.type === PebIntegrationFilterType.Select);

      const rendererContext = this.rendererContext['@product-filters']?.data;
      const params = rendererContext instanceof Array
        ? rendererContext.find(ctx => ctx.field === context?.field)
        : null;
      const dict = params?.value instanceof Array
        ? params.value.reduce((acc, v) => {
          acc[v] = true;

          return acc;
        }, {})
        : typeof params?.value === 'string' ? { [params.value]: true } : {};

      options = context.options.map((option) => {
        return {
          ...option,
          selected: option.selected ?? !!dict[option?.value],
        };
      });
    }

    return { label: context.title, options };
  }

  interaction({ type, options }): void {
    const context = this.context.data.find(params =>
      params.type === (type === 'sortSelect' ? PebIntegrationFilterType.SortSelect : PebIntegrationFilterType.Select));
    const payload = options.reduce((acc, o) => {
      if (o.selected) {
        acc.push(type === 'sortSelect' ? o : o.value);
      }

      return acc;
    }, []);

    this.interact(pebInteractionCreator.grid.products[type](context, payload));
  }

  submitForm() {
    const formGroup = new FormGroup({});

    if (this.options.interactions) {
      const types = [
        PebIntegrationDataType.PasswordInput,
        PebIntegrationDataType.Input,
        PebIntegrationDataType.Select,
        PebIntegrationDataType.Checkbox,
      ];

      function recursive(element) {
        element?.children?.forEach((child) => {
          if (isIntegrationData(child.data?.functionLink)) {
            const functionLink = child.data.functionLink;

            if (functionLink && types.includes(functionLink?.dataType)) {
              formGroup.addControl(functionLink.property, child.formControl);
            }
          }

          recursive(child);
        });
      }

      recursive(this);
    }

    if (Object.keys(formGroup.value).length) {
      const functionLink = this.element.data?.functionLink;

      if (isIntegrationAction(functionLink)) {
        const { integration = null, ...action } = functionLink;

        this.interact({
          type: PebInteractionType.IntegrationSubmitForm,
          payload: { integration, action, data: formGroup.value },
        });
      }

      if (isIntegrationInteraction(functionLink)) {
        const { integration = null, ...interaction } = functionLink;

        this.interact({
          type: interaction.interactionType as PebInteractionType,
          payload: { integration, interaction, data: formGroup.value },
        });
      }
    }
  }
}
