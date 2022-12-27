import { HSVA, RGBA } from './formats';

export function hsvaToRgba(hsva: HSVA): RGBA {
  let r: number;
  let g: number;
  let b: number;

  const h = hsva.h / 360;
  const s = hsva.s / 100;
  const v = hsva.v / 100;
  const a = hsva.a / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v; g = t; b = p;
      break;
    case 1:
      r = q; g = v; b = p;
      break;
    case 2:
      r = p; g = v; b = t;
      break;
    case 3:
      r = p; g = q; b = v;
      break;
    case 4:
      r = t; g = p; b = v;
      break;
    case 5:
      r = v; g = p; b = q;
      break;
    default:
      r = 0; g = 0; b = 0;
  }

  return new RGBA(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a);
}
