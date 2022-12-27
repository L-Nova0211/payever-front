import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'peb-generic-sidebar',
  templateUrl: './generic-sidebar.component.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebGenericSidebarComponent {
}
