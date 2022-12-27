import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'peb-image',
  templateUrl: './image.route.html',
  styleUrls: ['./image.route.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandboxRendererShowcaseGeneralImageRoute {
  content$ = this.route.data.pipe(
    pluck('content'),
  );

  constructor(private route: ActivatedRoute) {}
}
