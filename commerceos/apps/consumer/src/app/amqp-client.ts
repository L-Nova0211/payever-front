import { readFileSync } from 'fs';

import { APP_BASE_HREF } from '@angular/common';
import { StaticProvider } from '@angular/core';
import { Transaction } from '@elastic/apm-rum';
import * as Amqp from 'amqp-ts';
import * as elasticApm from 'elastic-apm-node';
import fetch from 'node-fetch';
import { Observable, Subject } from 'rxjs';
import { finalize, retry, tap } from 'rxjs/operators';

import {
  AppsEventThemePublished,
  AzureHelper,
  ClientAppsEventThemePublished,
  createAzureHelper,
  getHost,
  getShortAppData,
  ShortAppData,
} from '@pe/builder-client-helpers';
import { PebScreen } from '@pe/builder-core';
import { AppType, PE_ENV } from '@pe/common';

const main = require('../../../../dist/builder-client/server/main');


export class AmqpClient {
  private readonly distFolderPath = `${process.cwd()}/dist/builder-client`;
  private readonly indexDocument = readFileSync(`${this.distFolderPath}/browser/index.html`).toString();
  private readonly env = main.environment.apis;
  private readonly appType = process.env.APP_TYPE as AppType;
  private readonly azureHelper: AzureHelper = createAzureHelper(this.env.custom?.storage ?? '');

  private connection: Amqp.Connection;
  private queue: Amqp.Queue;
  private exchange: Amqp.Exchange;

  readonly messages$: Subject<Amqp.Message> = new Subject();

  readonly apm = elasticApm.start({
    serviceName: ['builder-client-consumer', process.env.APP_TYPE].join('-'),
    serverUrl: process.env.ELASTIC_APM_SERVER_URL,
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
    logLevel: 'info',
    hostname: 'test-hostname',
  });

  constructor(
    private debug = false,
  ) { }

  connect(): void {
    if (!this.debug) {
      this.connection = new Amqp.Connection(process.env.RABBITMQ_URL);
      this.apm.logger.info('amqp connection created', process.env.RABBITMQ_URL);

      this.connection.on('error_connection', (err) => {
        this.apm.logger.error('consumer connection error', err);
        this.apm.captureError(err);
      });
      this.connection.on('lost_connection', () => {
        this.apm.logger.error('consumer connection lost');
        this.apm.captureError(new Error('connection lost'));
      });
      this.connection.on('re_established_connection', () => {
        this.apm.logger.error('consumer connection reestablish');
        this.apm.captureError('connection reestablish');
      });
      this.connection.on('close_connection', () => {
        this.apm.logger.error('consumer connection closed');
        this.apm.captureError('connection closed');
      });
      this.connection.on('open_connection', () => {
        this.apm.logger.info('consumer started', this.connection.isConnected);
      });

      this.exchange = this.connection.declareExchange('async_events', 'direct', { durable: true });

      const queueOptions: Amqp.Queue.DeclarationOptions = {
        durable: true,
        deadLetterExchange: 'async_events_fallback',
        prefetch: 1,
      };
      // tslint:disable:no-string-literal
      queueOptions['deadLetterRoutingKey'] = `async_events_builder_${this.appType}_client_micro`;

      this.queue = this.connection.declareQueue(
        `async_events_builder_${this.appType}_client_micro`,
        queueOptions,
      );
      this.bindQueueToRoutingKeys(this.exchange, this.queue);
    }
  }

  private checkConnection(): void {
    if (!this.connection) {
      this.connect();
    }
  }

  activateConsumer(): Promise<any> {
    this.handleMessages().pipe(
      retry(),
      finalize(() => this.apm.logger.error('consumer subscription finished')),
    ).subscribe();

    if (!this.debug) {
      this.checkConnection();

      return this.queue.activateConsumer((message: Amqp.Message) => {
        this.messages$.next(message);
      });
    } else {
      return main.fetchApp(this.env, main.DEFAULT_APP, fetch, this.appType)
        .then(({ app, theme }) => this.handleApp([main.DEFAULT_APP], app, theme, null));
    }
  }

  private handleMessages(): Observable<any> {
    return this.messages$.pipe(
      tap((message: Amqp.Message) => {
        let data: { name: string, payload: any };
        try {
          data = JSON.parse(message.content.toString());
        } catch (e) { }
        if (data?.name === AppsEventThemePublished[this.appType]) {
          try {
            const { domains, app, theme } = data.payload;
            const transaction = this.apm.startTransaction(`handle shop ${app?._id ?? app?.id}`);
            this.handleApp(domains, app, theme, transaction).catch((e) => {
              this.apm.captureError(e);
            }).then(() => {
              this.sendMessage({
                name: ClientAppsEventThemePublished[this.appType],
                payload: data.payload,
              });
            });
          } catch (e) {
            this.apm.logger.error('nack', e);
          }
        }

        message.ack();
      }),
    );
  }

  sendMessage(content?: any, options: any = {}): void {
    this.connection.completeConfiguration().then(() => {
      const message = new Amqp.Message(content, options);
      this.exchange.send(message, ClientAppsEventThemePublished[this.appType]);
      this.apm.logger.info('sent');
    });
  }

  private createPageBlob(
    url: string,
    screen: PebScreen,
    providers: any,
    domainVersion: string,
    transaction: Transaction,
  ): Promise<any> {
    const renderSpan = transaction?.startSpan(`start rendering for ${url} , ${screen}`);

    return main
      .renderModule(
        main.AppServerModule,
        {
          url,
          document: this.indexDocument,
          extraProviders: [
            {
              provide: APP_BASE_HREF,
              useValue: '/'
            },
            {
              provide: 'USER_AGENT_SCREEN',
              useValue: screen,
            },
            ...providers,
          ],
        },
      )
      .then(template => {
        return this.azureHelper
          .removeBlobForDomainUrl(this.appType, domainVersion, url, screen)
          .catch(error => {
            this.apm.logger.info(`no old domain for ${url}`, error);

            return null;
          })
          .then(() => this.azureHelper
            .uploadFile(
              template,
              domainVersion,
              url,
              `index.${screen}.html`,
              this.appType,
            )
            .catch(error => {
              this.apm.logger.error(`upload template for ${url} error`, error);
              this.apm.captureError(error);
              renderSpan?.addLabels({ renderUpload: 'failure'});

              return null;
            }),
          )
          .then(res => {
            renderSpan?.addLabels({ render: `blob for ${url} created`});
            renderSpan?.end();

            return res;
          });
      })
      .catch(error => {
        this.apm.logger.error(`render error for ${url}`, error);
        this.apm.captureError(error);
        renderSpan?.addLabels({ render: 'failure'});
        renderSpan?.end();
      });
  }

  removeDomainVersion(domainVersion: string): Promise<any> {
    return this.azureHelper.removeAllBlobsForDomain(this.appType, domainVersion);
  }

  storeAppData(appData: ShortAppData, domain: string): Promise<any> {
    return Promise.all([
      this.azureHelper.storeAppDataLocal(`${this.distFolderPath}/browser`, domain, appData).catch(() => null),
      this.azureHelper.storeAppDataBlob(domain, appData).catch((e: Error) => {
        console.error(new Date(), 'data storing error', appData, e);
        throw e;
      }),
    ]);
  }

  private async handleApp(domains, app, theme, transaction) {
    const allDomains = [];
    const appData: ShortAppData = getShortAppData(app, theme);
    const appHost = getHost(this.appType, this.env);
    const categories = await main.fetchCategories(this.env, app, fetch);
    const providers: StaticProvider[] = [
      {
        provide: 'APP',
        useValue: app,
      },
      {
        provide: 'THEME',
        useValue: theme,
      },
      {
        provide: 'ENVIRONMENT',
        useValue: this.env,
      },
      {
        provide: PE_ENV,
        useValue: this.env,
      },
      {
        provide: main.APP_TYPE,
        useValue: this.appType,
      },
      {
        provide: 'CATEGORIES',
        useValue: categories,
      },
    ];

    if (app?.accessConfig?.internalDomain) {
      const internalDomain = `${app.accessConfig.internalDomain}.${appHost}`;
      if (allDomains?.every(d => d !== internalDomain)) {
        allDomains.push(internalDomain);
      }
    }
    const handlingSpan = transaction
      ?.startSpan(`handling for ${this.appType} "${app.name} - ${app?.id ?? app?._id} - ${app?.accessConfig?.version}"`);
    if (allDomains.length) {
      await Promise.all(allDomains.reduce(
        (acc, host) => {
          const hostMatches = host.match(new RegExp(
            `(.+)\.${appHost?.replace('.', '\.')}$`,
          ));
          const domain = hostMatches && hostMatches.length > 1 ? hostMatches[1] : null;
          if (domain) {
            const domainVersion = `${domain}/${app?.accessConfig?.version}`;
            acc.push(
              this.azureHelper.getAppData(`${this.distFolderPath}/browser`, host, this.env)
                .then((oldShopData) => {
                  const oldDomainVersion = `${domain}${oldShopData ? `/${oldShopData.version}` : ''}`;
                  const removeOldDomainVersion = () => {
                    if (oldDomainVersion !== domainVersion) {
                      return this.removeDomainVersion(oldDomainVersion).catch(() => null);
                    }

                    return Promise.resolve();
                  };

                  const createBlobs = () => {
                    return Promise.all(
                      appData.routing.map(route => Promise.all(
                        Object.values(PebScreen).map(screen => {
                          return this.createPageBlob(route.url, screen, providers, domainVersion, transaction)
                            .catch(error => {
                              this.apm.logger.error(`render error for ${route.url} on ${screen}`, error);
                              this.apm.captureError(error);

                              return null;
                            });
                        }),
                      )),
                    );
                  };

                  removeOldDomainVersion()
                    .then(() => createBlobs())
                    .then(() => handlingSpan?.end());

                  return this.storeAppData(appData, domain)
                    .then(result => {
                      transaction?.setOutcome('success');
                      transaction?.end();

                      return result;
                    });
                }),
            );
          }

          return acc;
        },
        [],
      ));
    }
  }

  bindQueueToRoutingKeys(exchange: Amqp.Exchange, queue: Amqp.Queue): void {
    const domainRKs = [
      AppsEventThemePublished[this.appType],
    ];
    domainRKs.forEach(routingKey => queue.bind(exchange, routingKey));
  }
}
