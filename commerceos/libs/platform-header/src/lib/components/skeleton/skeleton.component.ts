import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PePlatformHeaderConfig } from '../../platform-header.types';

@Component({
  selector: 'pe-skeleton-header',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
})
export class SkeletonComponent {
  @Input() config$: BehaviorSubject<PePlatformHeaderConfig> = new BehaviorSubject<PePlatformHeaderConfig>(null);

}
