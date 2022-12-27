import { PebInteractionType, pebLinkDatasetLink } from '@pe/builder-core';
let Quill;
if (typeof window === 'undefined') {
  Quill = require('./quill.mock').Quill;
} else {
  Quill = require('@pe/quill');
}
Quill.debug(false);

function sanitize(url, protocols) {
  const anchor = document.createElement('a');
  anchor.href = url;
  const protocol = anchor.href.slice(0, anchor.href.indexOf(':'));

  return protocols.indexOf(protocol) > -1;
}

function camelize(name: string): string {
  const parts = name.split('-');
  const rest = parts
    .slice(1)
    .map((part: string) => part[0].toUpperCase() + part.slice(1))
    .join('');

  return parts[0] + rest;
}

const deltaPath = 'delta';
const Delta = Quill.import(deltaPath);

function matcher(node, delta) {
  const { fontSize, fontFamily, fontWeight, fontStyle } = node.style;

  const color = node.getAttribute('color') ?? node.style.color;
  let attributes: any = {};
  if (color) {
    attributes = { ...attributes, color };
  }
  if (fontFamily) {
    attributes = { ...attributes, fontFamily };
  }
  if (fontSize) {
    attributes = { ...attributes, fontSize: parseInt(fontSize, 10) };
  }
  if (fontWeight) {
    attributes = { ...attributes, fontWeight: parseInt(fontWeight, 10) };
  }
  if (fontStyle) {
    attributes = { ...attributes, italic: fontStyle === 'italic' };
  }

  return delta.compose(new Delta().retain(delta.length(), attributes));
}

const path = 'blots/inline';
const inlineBlot = Quill.import(path);

// Move underline lower
inlineBlot.order = [
  'cursor',
  'inline',
  'underline',
  'link',
  'strike',
  'italic',
  'script',
  'code',
];

class PebLink extends inlineBlot {
  static blotName = 'link';
  static tagName = 'A';

  domNode: Node;

  static create(value) {
    const node = super.create(value);
    node.setAttribute('href', '#');
    const { type, payload } = value;
    node.setAttribute(pebLinkDatasetLink.type, type);
    Object.entries(payload || {}).forEach(([key, v]: [string, string]) => {
      (node as HTMLElement).dataset[key] = v || '';
    });

    return node;
  }

  static formats(domNode) {
    return {
      type: domNode.getAttribute(pebLinkDatasetLink.type) as PebInteractionType,
      payload: { ...domNode.dataset }, // Destructuring due to Ngxs deepFreeze errors
    };
  }

  format(name, value) {
    // @ts-ignore
    if (name !== this.statics.blotName || !value) {
      super.format(name, value);
    } else {
      const { type, payload } = value || {};
      // @ts-ignore
      this.domNode.setAttribute(pebLinkDatasetLink.type, type);
      Object.entries(payload || {}).forEach(([key, v]: [string, string]) => {
        (this.domNode as HTMLElement).dataset[key] = v || '';
      });
    }
  }

  formats() {
    const formats = super.formats();
    formats.link = PebLink.formats(this.domNode);

    return formats;
  }
}

function registerPebLink() {
  Quill.register(PebLink);
}
const parchmentPath = 'parchment';
const parchment = Quill.import(parchmentPath);
class FontSizeAttributor extends parchment.StyleAttributor {
  public add(node: HTMLElement, value: string): boolean {
    // @ts-ignore
    if (!this.canAdd(node, value)) {
      return false;
    }
    // @ts-ignore
    node.style[camelize(this.keyName)] = `${parseFloat(value)}px`;

    return true;
  }

  value(node) {
    return Math.round(parseFloat(super.value(node))) || 15; // Don't return NaN
  }
}

class FontFamilyAttributor extends parchment.StyleAttributor {
  value(node) {
    return super.value(node).replace(/["']/g, '');
  }
}

class FontWeightAttributor extends parchment.StyleAttributor {
  public add(node: HTMLElement, value: string): boolean {
    // @ts-ignore
    if (!this.canAdd(node, value)) {
      return false;
    }
    // @ts-ignore
    node.style[camelize(this.keyName)] = value;

    return true;
  }

  value(node) {
    return parseInt(super.value(node), 10);
  }
}

function registerFontSize() {
  // @ts-ignore
  const fontSize = new FontSizeAttributor('fontSize', 'font-size', { scope: parchment.Scope.INLINE });
  Quill.register(fontSize);
}

function registerFontFamily() {
  // @ts-ignore
  const fontFamily = new FontFamilyAttributor('fontFamily', 'font-family', { scope: parchment.Scope.INLINE });
  Quill.register(fontFamily);
}

function registerFontWeight() {
  // @ts-ignore
  const fontWeight = new FontWeightAttributor('fontWeight', 'font-weight', { scope: parchment.Scope.INLINE });
  Quill.register(fontWeight);
}

export {
  matcher,
  Quill as default,
  registerFontSize,
  registerFontFamily,
  registerPebLink,
  registerFontWeight,
};
