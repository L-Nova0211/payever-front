export interface DownloadLinkInterface {
  name: string;
  link: string;
}

export interface PluginInfoInterface {
  channel: string;
  description: string;
  documentation: string;
  marketplace: string;
  pluginFiles: {
    filename: string,
    version: string
  }[];
}
