import { v4 as uuid } from 'uuid';

// This will allow us to detect global object both in browser and in backend
// so in sandbox we could generate more readable ids and at the same time use
// normal ones in production
// const root: any = (typeof self === 'object' && self.self === self && self) ||
//   (typeof global === 'object' && global.global === global && global) ||
//   this;

// const initialNamespaces = localStorage.getItem('peb-ids');
//
// const idsNamespaces: {
//   [ns: string]: number,
// } = initialNamespaces ? JSON.parse(initialNamespaces) : {};

export function pebGenerateId(ns?: string): string {
  // if (root.PEB_CUSTOM_IDS && ns) {
  //   if (!(ns in idsNamespaces)) {
  //     idsNamespaces[ns] = 0;
  //   }
  //
  //   idsNamespaces[ns]++;
  //
  //   localStorage.setItem('peb-ids', JSON.stringify(idsNamespaces));
  //
  //   return `${ns}-${idsNamespaces[ns]}`;
  // }
  //
  // if (root.PEB_CUSTOM_IDS) {
  //   const base = 36;
  //
  //   return Number(random(0, base ** 5 - 1)).toString(base);
  // }

  return uuid();
}
