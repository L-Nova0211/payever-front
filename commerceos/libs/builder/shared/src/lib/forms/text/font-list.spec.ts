import { pebFontFamilies } from '@pe/builder-core';

import { PebFontFamilyItem, PebFontStyle, PebFontVariantItem } from './font-list';

describe('PebFontFamilyItem & PebFontVariantItem', () => {

  it('should create peb font family item', () => {

    /**
     * font is with italic styles
     */
    let fontFamily = pebFontFamilies.find(f => f.name === 'Cabin');
    let fontItem = new PebFontFamilyItem(fontFamily);

    expect(fontItem.variants).toEqual(fontFamily.weights.reduce((acc, w) => {
      acc.push(...[
        new PebFontVariantItem(fontFamily.name, w, false),
        new PebFontVariantItem(fontFamily.name, w, true),
      ]);

      return acc;
    }, []));
    expect(fontItem.title).toEqual('Cabin');
    expect(fontItem.style).toEqual({ fontFamily: 'Cabin' });

    /**
     * font is without italic styles
     */
    fontFamily = pebFontFamilies.find(f => f.name === 'Quicksand');
    fontItem = new PebFontFamilyItem(fontFamily);

    expect(fontItem.variants).toEqual(fontFamily.weights.map(w => new PebFontVariantItem(fontFamily.name, w, false)));
    expect(fontItem.title).toEqual('Quicksand');
    expect(fontItem.style).toEqual({ fontFamily: 'Quicksand' });

  });

  it('should create peb font variant item', () => {

    const fontFamily = 'Cabin';
    const fontWeight = 400;
    let italic = false;
    let item: PebFontVariantItem;

    /**
     * italic is FALSE
     */
    item = new PebFontVariantItem(fontFamily, fontWeight, italic);

    expect(item.selected).toBe(false);
    expect(item.value).toEqual({
      fontFamily,
      fontWeight,
      italic,
    });
    expect(item.style).toEqual({
      fontFamily,
      fontWeight,
    });

    /**
     * check title
     * item._title is not set
     */
    expect(item.title).toEqual('Regular');

    /**
     * item._title is set
     */
    item[`_title`] = 'test';
    expect(item.title).toEqual('test');

    /**
     * italic is TRUE
     */
    italic = true;
    item = new PebFontVariantItem(fontFamily, fontWeight, italic);

    expect(item.style).toEqual({
      fontFamily,
      fontWeight,
      fontStyle: PebFontStyle.Italic,
    });
    expect(item.title).toEqual('Regular Italic');

  });

});
