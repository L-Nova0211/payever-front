import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
  PebActionAnimationType,
  PebBuildInAnimationType,
  PebBuildOutAnimationType,
  PebMotionType,
} from '@pe/builder-core';

@Component({
  selector: 'peb-motion-detail-form',
  templateUrl: './motion-detail.form.html',
  styleUrls: ['./motion-detail.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebMotionDetailForm implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() motionType : PebMotionType;

  noAnimation: string;
  animationTypes: any;

  ngOnInit(): void {
    let animationType: any;
    switch (this.motionType) {
      case PebMotionType.BuildIn:
        animationType = PebBuildInAnimationType;
        break;
      case PebMotionType.Action:
        animationType = PebActionAnimationType;
        break;
      case PebMotionType.BuildOut:
        animationType = PebBuildOutAnimationType;
        break;
    }
    this.noAnimation = animationType.None;
    this.animationTypes = Object.values(animationType).filter(m => m !== this.noAnimation);
  }

  searchInputEnterHandler($event: Event) {
    $event.preventDefault();
  }

  selectAnimation($animation?: PebBuildInAnimationType) {
    this.formGroup.get('type').patchValue($animation ? $animation : this.noAnimation);
  }
}
