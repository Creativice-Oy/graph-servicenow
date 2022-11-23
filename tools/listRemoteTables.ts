require('dotenv').config();

const fs = require('fs');
const path = require('path');
import { ServiceNowClient } from '../src/client';
import { loadConfigFromEnvironmentVariables } from '@jupiterone/integration-sdk-runtime';
import instanceConfigFields from '../src/instanceConfigFields';
import { IntegrationConfig } from '../src/types';
import { IntegrationLogger } from '@jupiterone/integration-sdk-core';

const config = loadConfigFromEnvironmentVariables<IntegrationConfig>(
  instanceConfigFields,
);

const client = new ServiceNowClient(
  config,
  (undefined as unknown) as IntegrationLogger,
);

const filename = path.join(__dirname, '__data__', 'tables.txt');

client
  .listTableNames('')
  .then((tableNames) =>
    fs.writeFile(filename, tableNames.sort().join('\n'), (err) => {
      if (err) throw err;
    }),
  )
  .catch(() => {
    throw Error('Error executing listRemoteTables.');
  });
