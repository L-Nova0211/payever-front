import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ThemeSwitcherService } from './theme-switcher.service';

@NgModule({
  imports: [CommonModule],
  providers: [ThemeSwitcherService],
})
export class ThemeSwitcherModule {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(t: ThemeSwitcherService) {
  }

}
