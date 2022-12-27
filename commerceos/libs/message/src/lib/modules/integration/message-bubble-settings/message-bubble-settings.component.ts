import {
  Component, OnInit, ChangeDetectionStrategy,
  ViewEncapsulation, Input, ChangeDetectorRef, Inject,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { filter, take, tap, takeUntil } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageIntegrationSettings } from '@pe/shared/chat';

import {
PeMessageBubbleBrand,
PeMessageBubbleLayouts,
PeMessageBubbleStyle,
} from '../../../enums';
import { PeMessageBubble } from '../../../interfaces';
import { PeMessageService } from '../../../services';

@Component({
  selector: 'pe-message-bubble-settings',
  templateUrl: './message-bubble-settings.component.html',
  styleUrls: ['./message-bubble-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class MessageBubbleSettingsComponent implements OnInit {

  @Input() logo!: string;

  bubbleSettingsGroup = this.formBuilder.group({
    showBubble: [false],
    showNotifications: [false],
    bgColor: [''],
    textColor: [''],
    style: [PeMessageBubbleStyle.Rounded],
    layout: [PeMessageBubbleLayouts.Logo],
    text: [''],
    boxShadow: [''],
    roundedValue: [''],
    brand: [PeMessageBubbleBrand.Payever],
    logo: [''],
    businessDocument: [{}],
  });

  bubbleThemeStyleOptions = [
    {
      label: this.translateService.translate('message-app.message-integration.circle'),
      value: PeMessageBubbleStyle.Circle,
    },
    {
      label: this.translateService.translate('message-app.message-integration.rounded'),
      value: PeMessageBubbleStyle.Rounded,
    },
    {
      label: this.translateService.translate('message-app.message-integration.rectangle'),
      value: PeMessageBubbleStyle.Sharp,
    },
  ];

  bubbleThemeStyleLayout = [
    {
      label: this.translateService.translate('message-app.message-integration.logo'),
      value: PeMessageBubbleLayouts.Logo,
    },
    {
      label: this.translateService.translate('message-app.message-integration.logo-name'),
      value: PeMessageBubbleLayouts.LogoText,
    },
    {
      label: this.translateService.translate('message-app.message-integration.name'),
      value: PeMessageBubbleLayouts.Text,
    },
  ];

  bubbleSettingsTitles = [
    {
      label: this.translateService.translate('message-app.message-integration.payever-brand'),
      value: PeMessageBubbleBrand.Payever,
    },
    {
      label: this.translateService.translate('message-app.message-integration.custom-brand'),
      value: PeMessageBubbleBrand.Custom,
    },
  ];

  sidebarBubbleSettingsIndex = 1;
  showRoundedSlider = true;

  constructor(
    public peMessageService: PeMessageService,
    private router: Router,
    private envService: PebEnvService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private destroyed$: PeDestroyService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
  ) {
  }

  ngOnInit(): void {
    this.peMessageService.bubble$.pipe(
      filter((bubble: PeMessageBubble) => Object.keys(bubble).length > 0),
      tap((bubble: PeMessageBubble) => {
        bubble.roundedValue = bubble.roundedValue || PeMessageIntegrationSettings.roundedValue;
        this.bubbleSettingsGroup.patchValue(bubble);

        this.showRoundedSlider = bubble.style === PeMessageBubbleStyle.Rounded;
        this.sidebarBubbleSettingsIndex = bubble.brand === PeMessageBubbleBrand.Payever ? 0 : 1;

        this.handleChanges();

        this.changeDetectorRef.detectChanges();
      }),
      take(1),
    ).subscribe();
  }

  handleChanges(): void {
    this.bubbleSettingsGroup.valueChanges.pipe(
      tap((value: PeMessageBubble) => {
        this.peMessageService.bubble = value;

        this.showRoundedSlider = value.style === PeMessageBubbleStyle.Rounded;
        this.sidebarBubbleSettingsIndex = value.brand === PeMessageBubbleBrand.Payever ? 0 : 1;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  navigateToBusinessSettings(): void {
    this.router.navigateByUrl(`business/${this.envService.businessId}/settings/info`);
    this.peOverlayData.onCloseSubject$.next();
  }
}
