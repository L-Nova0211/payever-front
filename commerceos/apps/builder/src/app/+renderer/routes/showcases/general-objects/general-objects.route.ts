import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'sandbox-renderer-showcase-route',
  templateUrl: './general-objects.route.html',
  styleUrls: ['./general-objects.route.scss'],
})
export class SandboxRendererShowcaseGeneralObjectsRoute {

  content$ = this.route.data.pipe(
    pluck('content'),
  );

  constructor(private route: ActivatedRoute) {}
}
