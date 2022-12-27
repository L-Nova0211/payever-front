import { HSVA, RGBA } from './formats';

export function rgbaToHsva(rgba: RGBA): HSVA {
  let h: number;
  let s: number;

  const r = Math.min(rgba.r / 255, 1);
  const g = Math.min(rgba.g / 255, 1);
  const b = Math.min(rgba.b / 255, 1);
  const a = Math.min(rgba.a, 1);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  const v: number = max;
  const d = max - min;

  s = (max === 0) ? 0 : d / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }

    h /= 6;
  }

  return new HSVA(h * 360, s * 100, v * 100, a * 100);
}
