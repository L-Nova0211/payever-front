import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AngleFlipHelper {
  flipV(angle: number): number {
    const normalizedAngle = this.normalizeAngle(angle);
    let newAngle: number;
    if (normalizedAngle < 90) {
      // 1 quarter
      newAngle =
        ((normalizedAngle * (Math.PI / 180) + 1.5 * Math.PI) * 180) / Math.PI;
    } else if (normalizedAngle > 90 && normalizedAngle < 180) {
      // 2 quarter
      newAngle =
        ((normalizedAngle * (Math.PI / 180) + 0.5 * Math.PI) * 180) / Math.PI;
    } else if (normalizedAngle > 180 && normalizedAngle < 270) {
      // 3 quarter
      newAngle =
        ((normalizedAngle * (Math.PI / 180) - 0.5 * Math.PI) * 180) / Math.PI;
    } else if (normalizedAngle > 270 && normalizedAngle < 360) {
      // 4 quarter
      newAngle =
        ((normalizedAngle * (Math.PI / 180) - 1.5 * Math.PI) * 180) / Math.PI;
    } else if (normalizedAngle === 90) {
      newAngle = 270;
    } else if (normalizedAngle === 270) {
      newAngle = 90;
    } else {
      newAngle = normalizedAngle;
    }

    return newAngle;
  }

  flipH(angle: number): number {
    const normalizedAngle = this.normalizeAngle(angle);
    let newAngle: number;
    if (
      (normalizedAngle > 0 && normalizedAngle < 90) ||
      (normalizedAngle > 180 && normalizedAngle < 270)
    ) {
      // 1, 3 quarter
      newAngle =
        ((normalizedAngle * (Math.PI / 180) + 0.5 * Math.PI) * 180) / Math.PI;
    } else if (
      (normalizedAngle > 90 && normalizedAngle < 180) ||
      (normalizedAngle > 270 && normalizedAngle < 360)
    ) {
      // 2, 4quarter
      newAngle =
        ((normalizedAngle * (Math.PI / 180) - 0.5 * Math.PI) * 180) / Math.PI;
    } else if (normalizedAngle === 180) {
      newAngle = 0;
    } else if (normalizedAngle === 0) {
      newAngle = 180;
    } else {
      newAngle = normalizedAngle;
    }

    return newAngle;
  }

  private normalizeAngle(angle: number) {
    let newAngle = angle;
    while (newAngle <= -360) {
      newAngle += 360;
    }
    while (newAngle > 360) {
      newAngle -= 360;
    }

    return newAngle;
  }
}
