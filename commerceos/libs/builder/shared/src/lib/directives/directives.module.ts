import { NgModule } from '@angular/core';

import { PebAutoHideScrollbarDirective } from './autohide-scrollbar.directive';

@NgModule({
  declarations: [
    PebAutoHideScrollbarDirective,
  ],
  exports: [
    PebAutoHideScrollbarDirective,
  ],
})
export class PebDirectivesModule {
}
