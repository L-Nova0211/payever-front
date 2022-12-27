import fetch from 'node-fetch';

import { PebScreen } from '../constants';
import { PebElementStyles } from '../models/client';

import { PebMigration } from './migrations.interface';

const store: { [url: string]: Promise<PebElementStyles> } = {};

export const bgImagesMetadata: PebMigration = async (page, element) => {
  for (const screen of Object.values(PebScreen)) {
    const styles: PebElementStyles = page?.stylesheets?.[screen]?.[element.id];

    if (
      styles?.backgroundImage &&
      !styles.backgroundImage.includes('linear-gradient') &&
      !styles.backgroundImageMimeType
    ) {
      try {
        // FE part
        if (!store[styles.backgroundImage]) {
          store[styles.backgroundImage] = fetch(styles.backgroundImage)
            .then(r => r.blob())
            .then(blob => new Promise((resolve, reject) => {
              const image = new Image();
              image.onload = () => {
                resolve({
                  backgroundImageMimeType: blob.type,
                  backgroundImageHeight: image.height,
                  backgroundImageWidth: image.width,
                });
              };
              image.onerror = (e) => {
                reject(e);
              };
              image.src = URL.createObjectURL(blob);
            }));
        }

        return await store[styles.backgroundImage].then((changes) => {
          page.stylesheets[screen][element.id] = Object.assign(styles, changes);

          return element;
        }).catch(() => element);
      } catch (e) {
        // TODO: do smth for be
        console.error(e);
      }
    }
  }

  return element;
};
