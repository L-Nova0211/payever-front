import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'sandbox-renderer-showcase-script-route',
  templateUrl: './general-script.route.html',
  styleUrls: ['./general-script.route.scss'],
})
export class SandboxRendererShowcaseGeneralScriptRoute {
  content$ = this.route.data.pipe(
    pluck('content'),
  );

  constructor(private route: ActivatedRoute) { }
}
