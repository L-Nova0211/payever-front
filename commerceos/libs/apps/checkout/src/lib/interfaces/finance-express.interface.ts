interface Embed {
  setSettings(settings: any): void;
  fetchConfigAndRun(): void;
  instance(): any;
}

export interface FinanceExpressInterface {
  FinanceExpress: {
    AbstractWidget: any;
    Embed: Embed;
    embedInstance: Embed;
    styleElement: HTMLStyleElement;
  };
}
