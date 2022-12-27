import { existsSync, mkdirSync, rmdirSync, unlinkSync, writeFile, writeFileSync } from 'fs';

import {
  Aborter,
  BlobURL,
  BlockBlobURL,
  ContainerURL,
  Pipeline,
  ServiceURL,
  // SharedKeyCredential,
  StorageURL,
} from '@azure/storage-blob';
import { BlobItem, ContainerListBlobFlatSegmentResponse } from '@azure/storage-blob/typings/lib/generated/lib/models';
import fetch from 'node-fetch';

import { PebScreen } from '@pe/builder-core';
import { AppType } from '@pe/common';

import {
  AzureAppFolderEnum,
  AZURE_BLOB_NAME,
  getHost,
  getShortAppData,
  ShortAppData,
} from './constant';

export class AzureHelper {

  constructor(
    private account: string,
    private appType: AppType,
    private password: string,
    private storageUrl: string,
    private locally = false,
  ) {
    // const sharedKeyCredential: SharedKeyCredential = new SharedKeyCredential(
    //   this.account,
    //   this.password ?? '',
    // );
    //
    // this.pipeline = StorageURL.newPipeline(sharedKeyCredential);
    // this.serviceURL = new ServiceURL(
    //   this.storageUrl, // `https://${this.account}.blob.core.windows.net`,
    //   this.pipeline,
    // );
    // this.containerURL = ContainerURL.fromServiceURL(this.serviceURL, AZURE_BLOB_NAME);
  }

  private readonly pipeline: Pipeline;
  private readonly serviceURL: ServiceURL;
  private readonly containerURL: ContainerURL;
  private readonly distFolderPath = `${process.cwd()}/dist`;

  static getBlobFolderByApp(app: AppType): AzureAppFolderEnum {
    const AzureAppFolderForType = {
      [AppType.Affiliates]: AzureAppFolderEnum.Affiliates,
      [AppType.Invoice]: AzureAppFolderEnum.Invoice,
      [AppType.Mail]: AzureAppFolderEnum.Email,
      [AppType.Pos]: AzureAppFolderEnum.Pos,
      [AppType.Shop]: AzureAppFolderEnum.Shop,
      [AppType.Site]: AzureAppFolderEnum.Site,
      [AppType.Subscriptions]: AzureAppFolderEnum.Subscriptions,
    };

    return AzureAppFolderForType[app] ?? AzureAppFolderEnum.Default;
  }

  static getBlobUrl(
    cdnUrl: string,
    domainName: string,
    route: string,
    fileName: string,
    appType: AppType,
  ): string {
    const appFolder = AzureHelper.getBlobFolderByApp(appType);

    return `${cdnUrl}/${appFolder}/${domainName}${route === '/' ? '/' : route + '/'}${fileName}`;
  }

  static getTemplateBlobUrl(
    cdnUrl: string,
    domainName: string,
    route: string,
    screen: PebScreen,
    appType: AppType,
  ): string {
    return AzureHelper.getBlobUrl(cdnUrl, domainName, route, `index.${screen}.html`, appType);
  }

  async uploadFile(
    content: string,
    domainName: string,
    route: string,
    fileName: string,
    appType: AppType,
  ): Promise<any> {
    const appFolder: AzureAppFolderEnum = AzureHelper.getBlobFolderByApp(appType);
    const path = `${appFolder}/${domainName}${route === '/' ? '/' : route + '/'}`;
    const filePath = `${path}${fileName}`;
    if (this.locally) {
      mkdirSync(`${this.distFolderPath}/${path}`, { recursive: true });
      writeFileSync(`${this.distFolderPath}/${filePath}`, content);

      return Promise.resolve();
    }

    const blobURL = BlobURL.fromContainerURL(this.containerURL, filePath);
    const blockBlobURL = BlockBlobURL.fromBlobURL(blobURL);
    await blockBlobURL.upload(
      Aborter.none,
      content,
      content.length,
    );
  }

  /**
   * Azure SDK do not allow just copy folder with blobs. We have to copy every blob inside folder to the new url.
   */
  async copyFolder(appType: AppType, oldDomainName: string, newDomainName: string): Promise<any> {
    const appFolder: AzureAppFolderEnum = AzureHelper.getBlobFolderByApp(appType);
    const blobsForOldDomain: BlobItem[] = await this.getBlobsForDomain(Aborter.none, appFolder, oldDomainName);
    const copyPromiseArray: Promise<void>[] = [];
    for (const blob of blobsForOldDomain) {
      const oldBlobURL: BlobURL = BlobURL.fromContainerURL(this.containerURL, blob.name); // should be absolute path
      const newPath: string = blob.name.replace(`/${oldDomainName}/`, `/${newDomainName}/`);
      const newBlobURL: BlobURL = BlobURL.fromContainerURL(this.containerURL, newPath);
      const copyPromise: Promise<any> = newBlobURL.startCopyFromURL(Aborter.none, oldBlobURL.url).catch(() => null);
      copyPromiseArray.push(copyPromise);
    }

    return copyPromiseArray.length ? Promise.all(copyPromiseArray) : Promise.resolve();
  }

  removeBlobForDomainUrl(appType: AppType, domainName: string, url: string, screen: PebScreen): Promise<any> {
    const appFolder: AzureAppFolderEnum = AzureHelper.getBlobFolderByApp(appType);
    const blobName = `${appFolder}/${domainName}${url}/index.${screen}.html`;
    if (this.locally) {
      const blob = `${this.distFolderPath}/${blobName}`;
      existsSync(blob) && unlinkSync(blob);

      return Promise.resolve();
    }
    const blockBlobUrl = BlockBlobURL.fromContainerURL(this.containerURL, blobName);

    return blockBlobUrl.delete(Aborter.none);
  }

  async removeAllBlobsForDomainUrl(appType: AppType, domainName: string, url: string): Promise<any> {
    const appFolder: AzureAppFolderEnum = AzureHelper.getBlobFolderByApp(appType);
    if (this.locally) {
      rmdirSync(`${this.distFolderPath}/${appFolder}/${domainName}`, { recursive: true });

      return Promise.resolve();
    }
    const blobsForOldDomain: BlobItem[] = await this.getBlobsForDomainUrl(Aborter.none, appFolder, domainName, url);

    return Promise.all(
      blobsForOldDomain.map(blob => {
        const oldBlockBlobUrl = BlockBlobURL.fromContainerURL(this.containerURL, blob.name);

        return oldBlockBlobUrl.delete(Aborter.none);
      }),
    );
  }

  /**
   * We have to remove every blob inside folder to remove folder itself
   */
  async removeAllBlobsForDomain(appType: AppType, domainName: string): Promise<any> {
    const appFolder: AzureAppFolderEnum = AzureHelper.getBlobFolderByApp(appType);
    const blobsForOldDomain: BlobItem[] = await this.getBlobsForDomain(Aborter.none, appFolder, domainName);
    const deletePromiseArray: Promise<void>[] = [];
    for (const blob of blobsForOldDomain) {
      const oldBlockBlobUrl = BlockBlobURL.fromContainerURL(this.containerURL, blob.name);
      const deletePromise: Promise<any> = oldBlockBlobUrl.delete(Aborter.none).catch(() => null);
      deletePromiseArray.push(deletePromise);
    }

    return Promise.all(deletePromiseArray);
  }

  /**
   * Returns all files inside folder with name == domain name
   */
  async getBlobsForDomain(
    aborter: Aborter,
    appType: AzureAppFolderEnum,
    domainName: string,
  ): Promise<BlobItem[]> {
    let response: ContainerListBlobFlatSegmentResponse;
    let marker: string;
    const blobs: BlobItem[] = [];
    const startWith = `${appType}/${domainName}/`;

    do {
      response = await this.containerURL.listBlobFlatSegment(aborter, null, { prefix: `${appType}/${domainName}` });
      marker = response.marker;
      blobs.push(...response.segment.blobItems);
    } while (marker);

    return blobs.filter((blob: BlobItem) => blob.name.startsWith(startWith));
  }

  /**
   * Returns all files inside folder with name == domain name
   */
  async getBlobsForDomainUrl(
    aborter: Aborter,
    appType: AzureAppFolderEnum,
    domainName: string,
    url: string,
  ): Promise<BlobItem[]> {
    let response: ContainerListBlobFlatSegmentResponse;
    let marker: string;
    const blobs: BlobItem[] = [];

    do {
      response = await this.containerURL.listBlobFlatSegment(aborter);
      marker = response.marker;
      blobs.push(...response.segment.blobItems);
    } while (marker);

    const startWith = `${appType}/${domainName}${url}`;

    return blobs.filter((blob: BlobItem) => blob.name.startsWith(startWith));
  }

  async getAppData(distFolder: string, host: string, env, fetchApp?, appType = this.appType): Promise<ShortAppData> {
    const appHost = getHost(appType, env);
    const hostMatches = host.match(new RegExp(`(.+)\.${appHost?.replace('.', '\.')}$`));
    const domain = hostMatches && hostMatches.length > 1 ? hostMatches[1] : host;

    return Promise.resolve()
      .then(() => fetch(AzureHelper.getBlobUrl(
          `${this.storageUrl}/${AZURE_BLOB_NAME}`,
          domain,
          '/',
          'data.json',
          appType,
        ))
        .then(res => {
          if (!res.ok) {
            throw new Error('next');
          }


        return res.json().then(data => {
          this.storeAppDataLocal(distFolder, domain, data);

          return data;
        });
      }),
      )
      .catch(async error => {
        if (fetchApp) {
          const { app, theme } = await fetchApp(env, host, fetch, appType);
          const appShortData = getShortAppData(app, theme);
          this.storeAppDataLocal(distFolder, domain, appShortData);
          this.storeAppDataBlob(domain, appShortData, appType);

          return appShortData;
        }

        throw error;
      });
  }

  storeAppDataLocal(distFolder: string, domain: string, appData: ShortAppData): Promise<void> {
    return new Promise(resolve => {
      const path = `${distFolder}/${domain}`;
      mkdirSync(path, { recursive: true });
      writeFile(`${path}/data.json`, JSON.stringify(appData), () => resolve());
    });
  }

  storeAppDataBlob(domain: string, appData: ShortAppData, appType = this.appType): Promise<void> {
    return this.uploadFile(
      JSON.stringify(appData),
      domain,
      '/',
      'data.json',
      appType,
    );
  }

  storeAppFile(fileName: string, domain: string, content: string, appType = this.appType): Promise<void> {
    return this.uploadFile(
      content,
      domain,
      '/',
      fileName,
      appType,
    );
  }
}

export function createAzureHelper(storageUrl: string) {
  return new AzureHelper(
    process.env.STORAGE_ACCOUNT_NAME,
    process.env.APP_TYPE as AppType,
    process.env.STORAGE_KEY,
    storageUrl,
  );
}
