export class RGBA {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number,
  ) {
  }
}

export class HSVA {
  constructor(
    public h: number,
    public s: number,
    public v: number,
    public a: number,
  ) {
  }
}

export function isRGBA(value: RGBA | HSVA | string): value is RGBA {
  const { r, g, b, a } = value as RGBA;

  return r !== undefined && g !== undefined && b !== undefined && a !== undefined;
}

export function isHSVA(value: RGBA | HSVA | string): value is HSVA {
  const { h, s, v, a } = value as HSVA;

  return h !== undefined && s !== undefined && v !== undefined && a !== undefined;
}
