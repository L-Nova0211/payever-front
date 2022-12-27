import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { PagePreviewService } from './page-preview.service';

@Component({
  selector: 'peb-preview-renderer',
  template: ``,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebPreviewRendererComponent implements OnInit {
  @Input() width: number;
  @Input() height: number;
  @Input() contentPadding = 0;

  constructor(
    private previewService: PagePreviewService,
  ) {}

  ngOnInit() {
    this.previewService.width = this.width;
    this.previewService.height = this.height;
    this.previewService.contentPadding = this.contentPadding;
  }

}
