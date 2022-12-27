import { RGBA } from './formats';

export function rgbaToHex(rgba: RGBA): string {
  return `#${((1 << 24) | (rgba.r << 16) | (rgba.g << 8) | rgba.b).toString(16).substr(1)}`;
}
