import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'sandbox-renderer-showcase-route',
  templateUrl: './general-basic.route.html',
  styleUrls: ['./general-basic.route.scss'],
})
export class SandboxRendererShowcaseGeneralBasicRoute {
  content$ = this.route.data.pipe(
    pluck('content'),
  );

  constructor(private route: ActivatedRoute) {}
}
