import { Injectable } from '@angular/core';

import { pebFontFamilies } from '@pe/builder-core';


@Injectable({ providedIn: 'root' })
export class FontLoaderService {

  constructor() {
    const fonts = pebFontFamilies.map(({ name, weights }) => `${name}:${weights.join(',')}`);
    localStorage.setItem('fonts', JSON.stringify(fonts));
  }

  public renderFontLoader(context = null) {
    const fonts = JSON.parse(localStorage.getItem('fonts') ?? '[]');
    if (!fonts) {
      return;
    }

    const WebFont = require('webfontloader');
    if (fonts.length > 0) {
      WebFont.load({
        context,
        google: {
          families: fonts,
        },
        classes: false,
      });
    }
  }
}
