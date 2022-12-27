import {
  Component, ChangeDetectionStrategy, Input, EventEmitter, Output, SimpleChanges, OnChanges, ViewEncapsulation,
} from '@angular/core';

import { PeMessageAppearanceColorBox, PeMessageColorLayout, PeMessageIntegrationThemeItem } from '../../../interfaces';

@Component({
  selector: 'pe-message-theme-settings',
  templateUrl: './message-theme-settings.component.html',
  styleUrls: ['./message-theme-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MessageThemeSettingsComponent implements OnChanges {

  @Input() mockUps!: PeMessageIntegrationThemeItem[];
  @Input() swiperColorBoxes!: boolean;
  @Input() defaultPresetColor = 0;
  @Input() colorBoxes!: PeMessageAppearanceColorBox[];
  @Input() shadowColor!: string;

  @Output() colorLayout = new EventEmitter<PeMessageColorLayout>();
  @Output() mockUpLayout = new EventEmitter<PeMessageIntegrationThemeItem>();
  @Output() changedBoxShadow = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.shadowColor) {
      this.shadowColor = changes.shadowColor.currentValue;
    }
  }

  openColorPicker(boxColor: PeMessageAppearanceColorBox | null, index: number): void {
    this.colorLayout.emit({ boxColor: boxColor, index: index });
  }

  selectMockUp(mockUp: PeMessageIntegrationThemeItem): void {
    this.mockUpLayout.emit(mockUp);
  }

  changeBoxShadow(event: string): void {
    this.changedBoxShadow.emit(event);
  }
}
