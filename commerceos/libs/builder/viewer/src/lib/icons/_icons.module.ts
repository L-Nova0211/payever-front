import { NgModule } from '@angular/core';

import { PebThemesPreviewDesktopIconComponent } from './preview-desktop.icon';
import { PebThemesPreviewMobileIconComponent } from './preview-mobile.icon';
import { PebThemesPreviewTabletIconComponent } from './preview-tablet.icon';

const icons = [
  PebThemesPreviewDesktopIconComponent,
  PebThemesPreviewMobileIconComponent,
  PebThemesPreviewTabletIconComponent,
];

@NgModule({
  declarations: icons,
  exports: icons,
})
export class ViewerIconsModule {}
