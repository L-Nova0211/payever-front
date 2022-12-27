import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { pluck, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'sandbox-renderer-showcase-general-button-route',
  templateUrl: './general-button.route.html',
  styleUrls: ['./general-button.route.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandboxRendererShowcaseGeneralButtonRoute {

  content$ = this.route.data.pipe(
    pluck('content'),
  );

  constructor(private route: ActivatedRoute) { }

}
