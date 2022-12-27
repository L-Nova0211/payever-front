import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { pluck, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'sandbox-renderer-showcase-general-line-route',
  templateUrl: './general-line.route.html',
  styleUrls: ['./general-line.route.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandboxRendererShowcaseGeneralLineRoute {

  content$ = this.route.data.pipe(
    pluck('content'),
  );

  constructor(private route: ActivatedRoute) { }

}
