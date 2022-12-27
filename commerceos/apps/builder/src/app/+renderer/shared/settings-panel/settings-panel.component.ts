import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PebScreen } from '@pe/builder-core';

@Component({
  selector: 'sandbox-renderer-settings-panel',
  templateUrl: './settings-panel.component.html',
  styleUrls: ['./settings-panel.component.scss'],
})
export class SandboxRendererSettingsPanelComponent {
  @Input()
  scale;

  @Input()
  screen;

  @Input()
  locale;

  @Output()
  scaleChanged = new EventEmitter<number>();

  @Output()
  screenChanged = new EventEmitter<PebScreen>();

  @Output()
  localeChanged = new EventEmitter<string>();

  availableScales = [.25, .5, .75, 1, 2, 4];
  availableLocales = ['en', 'de', 'ru'];
  availableScreens = Object.values(PebScreen);
}
