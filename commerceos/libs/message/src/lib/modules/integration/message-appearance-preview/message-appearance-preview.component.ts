import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef,
  ViewEncapsulation, Input,
} from '@angular/core';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';


import { PeMessageIntegrationThemeItem } from '../../../interfaces/message-settings.interface';
import { PeMessageIntegrationService } from '../../../services';
import { PeMessageThemeService } from '../../../services/message-theme.service';

@Component({
  selector: 'pe-message-appearance-preview',
  templateUrl: './message-appearance-preview.component.html',
  styleUrls: ['./message-appearance-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class MessageAppearancePreviewComponent implements OnInit {

  theme!: string;

  @Input() channels!: string;
  @Input() business!: string;

  constructor(
    public peMessageThemeService: PeMessageThemeService,
    public peMessageService: PeMessageIntegrationService,
    private changeDetectorRef: ChangeDetectorRef,
    private destroyed$: PeDestroyService,
  ) { }

  ngOnInit(): void {

    this.peMessageService.currSettings$.pipe(
      filter((themeItem: PeMessageIntegrationThemeItem) => themeItem._id !== undefined),
      tap((themeItem: PeMessageIntegrationThemeItem) => {
        this.theme = themeItem.settings?.messageAppColor
          ? this.peMessageThemeService.setTheme(themeItem.settings?.messageAppColor)
      : this.theme;

        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
