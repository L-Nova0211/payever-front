import { Component, Input } from '@angular/core';

@Component({
  selector: 'sandbox-renderer-preview',
  templateUrl: 'preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class SandboxRendererPreviewComponent {
  @Input() title = '(unknown preview)';

  @Input() element: any;
  @Input() stylesheet: any;
  @Input() context: any;

  @Input() options: any = {
    scale: 1,
    screen: 'desktop',
    locale: 'en',
  };
}
