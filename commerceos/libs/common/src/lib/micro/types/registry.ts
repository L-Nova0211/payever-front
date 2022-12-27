import { MicroAppInterface } from '../types';

export interface BuildHashMap {
  micro: string;
}

export interface MicroRegistrySctiptInfo {
  loaded: boolean;
  code: string;
}

export interface MicroRegistry {
  scripts: {
    [url: string]: MicroRegistrySctiptInfo;
  };
  buildHashes: {
    [micro: string]: BuildHashMap
  };
  buildMicroConfigs: {
    [micro: string]: MicroAppInterface
  };
  registered: MicroAppInterface[];
}
