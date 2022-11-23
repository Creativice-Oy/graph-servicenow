import axios, { AxiosError } from 'axios';
import { retry } from '@lifeomic/attempt';

import { IntegrationConfig } from './types';
import { getServiceNowNextLink } from './util/getServiceNowNextLink';
import {
  IntegrationProviderAuthorizationError,
  IntegrationValidationError,
  IntegrationLogger,
} from '@jupiterone/integration-sdk-core';

type Iteratee<T = any> = (r: T) => void | Promise<void>;

export enum ServiceNowTable {
  USER = 'sys_user',
  USER_GROUP = 'sys_user_group',
  DATABASE_TABLES = 'sys_db_object',
  GROUP_MEMBER = 'sys_user_grmember',
  INCIDENT = 'incident',
}

const DEFAULT_RESPONSE_LIMIT = 100;

/**
 * The ServiceNowClient maintains authentication state and provides an interface to
 * interact with the ServiceNow Table API.
 */
export class ServiceNowClient {
  private hostname: string;
  private username: string;
  private password: string;

  private logger: IntegrationLogger;

  private limit: number;

  constructor(readonly config: IntegrationConfig, logger: IntegrationLogger) {
    this.hostname = config.hostname;
    this.username = config.userid;
    this.password = config.password;

    this.logger = logger;

    this.limit = DEFAULT_RESPONSE_LIMIT;
  }

  async validate() {
    const url = this.createRequestUrl({
      table: ServiceNowTable.USER,
      limit: 1,
    });

    try {
      await this.request({ url });
    } catch (err) {
      if (err.code === 'ENOTFOUND') {
        throw new IntegrationValidationError(
          `Failure validating the ServiceNow API: ${err.message}`,
        );
      }

      if (err.isAxiosError) {
        if ((err as AxiosError).response?.status === 401) {
          throw new IntegrationProviderAuthorizationError({
            cause: err,
            endpoint: url,
            status: (err as AxiosError).response?.status as number,
            statusText: JSON.stringify((err as AxiosError).response?.data),
          });
        }
      }

      throw err;
    }
  }

  private createRequestUrl(options: {
    table: ServiceNowTable;
    limit?: number;
  }) {
    const limit = options.limit || this.limit;
    return `https://${this.hostname}/api/now/table/${options.table}?sysparm_limit=${limit}`;
  }

  private async request(options: { url: string }) {
    return await axios({
      method: 'GET',
      url: options.url,
      auth: {
        username: this.username,
        password: this.password,
      },
      responseType: 'json',
    });
  }

  private async retryResourceRequest(
    url: string,
  ): Promise<object[] & { nextLink: string | undefined }> {
    return retry(
      async () => {
        const response = await this.request({ url });
        return Object.assign(response.data.result, {
          nextLink: getServiceNowNextLink(response?.headers?.link),
        });
      },
      {
        maxAttempts: 2,
      },
    );
  }

  private async iterateTableResources(options: {
    table: ServiceNowTable;
    callback: Iteratee;
  }) {
    const { table, callback } = options;
    let url: string | undefined = this.createRequestUrl({ table });
    do {
      const resources = await this.retryResourceRequest(url);

      for (const r of resources) {
        await callback(r);
      }

      this.logger.info(
        {
          resourceCount: resources.length,
          resource: url,
        },
        'Received resources for endpoint',
      );
      url = resources.nextLink;
    } while (url);
  }

  async iterateUsers(callback: Iteratee) {
    return this.iterateTableResources({
      table: ServiceNowTable.USER,
      callback,
    });
  }

  async iterateGroups(callback: Iteratee) {
    return this.iterateTableResources({
      table: ServiceNowTable.USER_GROUP,
      callback,
    });
  }

  async iterateGroupMembers(callback: Iteratee) {
    return this.iterateTableResources({
      table: ServiceNowTable.GROUP_MEMBER,
      callback,
    });
  }

  async iterateIncidents(callback: Iteratee) {
    return this.iterateTableResources({
      table: ServiceNowTable.INCIDENT,
      callback,
    });
  }

  async listTableNames(tableNamePrefix: string = ''): Promise<string[]> {
    const tableNames: string[] = [];
    await this.iterateTableResources({
      table: ServiceNowTable.DATABASE_TABLES,
      callback: (t) => {
        if ((t.name as string).startsWith(tableNamePrefix)) {
          tableNames.push(t.name);
        }
      },
    });
    return tableNames;
  }
}
