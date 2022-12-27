import { PebFontFamily } from '@pe/builder-core';

export const pebFontWeight = {
  100: 'Thin',
  200: 'Extra-Light',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semi-Bold',
  700: 'Bold',
  800: 'Extra-Bold',
  900: 'Black',
};

export enum PebFontStyle {
  Normal= 'normal',
  Italic = 'italic',
}

export interface ItemStyle {
  fontFamily: string;
  fontWeight?: number;
  fontStyle?: PebFontStyle;
}

export interface ListItem {
  title: string;
  selected: boolean;
  style: ItemStyle;
  collapsed?: boolean;
  value?: PebFontVariant;
}

export class PebFontFamilyItem implements ListItem {
  fontFamily: string;
  collapsed = true;
  selected = false;
  variants: PebFontVariantItem[];

  constructor(fontFamily: PebFontFamily) {
    const { name, weights, italic } = fontFamily;
    this.fontFamily = name;
    this.variants = weights.reduce((acc, weight) => {
      acc.push(new PebFontVariantItem(name, weight, false));
      if (italic) {
        acc.push(new PebFontVariantItem(name, weight, true));
      }

      return acc;
    }, []);
  }

  get title() {
    return this.fontFamily;
  }

  get style() {
    return { fontFamily: this.fontFamily };
  }
}

export interface PebFontVariant {
  fontFamily: string;
  fontWeight: number;
  italic: boolean;
}

export class PebFontVariantItem implements ListItem {

  selected = false;
  value: PebFontVariant;

  private _title: string;

  constructor(fontFamily: string, fontWeight: number, italic: boolean) {
    this.value = { fontFamily, fontWeight, italic };
  }

  get style() {
    const { fontFamily, fontWeight, italic } = this.value;

    return italic ? { fontFamily, fontWeight, fontStyle: PebFontStyle.Italic } : { fontFamily, fontWeight };
  }

  get title() {
    if (!this._title) {
      const title = `${pebFontWeight[this.value.fontWeight]}`;
      this._title = this.value.italic ? `${title} Italic` : title;
    }

    return  this._title;
  }
}
