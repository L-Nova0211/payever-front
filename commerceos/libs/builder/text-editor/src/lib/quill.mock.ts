export class StyleAttributorMock {
  value(node: any): any {}
}

export class BlotMock {
}

export class Quill {
  root: any;
  history: any;
  clipboard: any;
  static debug(limit) {}
  static find(node) {}
  static register(...args) {}
  static import(name): any {
    if (name === 'parchment') {
      return { StyleAttributor: StyleAttributorMock }
    }

    return BlotMock;
  }

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(...args) {}

  addContainer(...args) {}
  blur() {}
  deleteText(...args) {}
  disable() {}
  editReadOnly(modifier) {}
  enable(...args) {}
  focus() {}
  format(...args) {}
  formatLine(...args) {}
  formatText(...args) {}
  getBounds(...args) {}
  getContents(...args): any {}
  getFormat(...args): any {}
  getIndex(blot) {}
  getLength(): any {}
  getLeaf(index) {}
  getLine(index) {}
  getLines(...args): any[] { return []; }
  getModule(name) {}
  getSelection(...args): any {}
  getSemanticHTML(...args) {}
  getText(...args) {}
  hasFocus() {}
  insertEmbed(...args) {}
  insertText(...args) {}
  isEnabled() {}
  off(...args) {}
  on(...args) {}
  once(...args) {}
  removeFormat(...args) {}
  scrollIntoView() {}
  setContents(...args) {}
  setSelection(...args) {}
  setText(...args) {}
  update(source) {}
  updateContents(...args) {}
}
