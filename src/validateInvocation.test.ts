import {
  isUserConfigError,
  isProviderAuthError,
} from '@jupiterone/integration-sdk-core';
import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';

import { IntegrationConfig } from './types';
import validateInvocation from './validateInvocation';
import { setupServiceNowRecording, Recording } from '../test/util/recording';

test('Should throw if invalid configuration', async () => {
  const executionContext = createMockExecutionContext<IntegrationConfig>({
    instanceConfig: {} as IntegrationConfig,
  });

  let err;
  try {
    await validateInvocation(executionContext);
  } catch (e) {
    err = e;
  }

  expect(err).not.toBeUndefined();
  expect(err.message).toMatch(
    'Config requires all of {hostname, username, password}',
  );
  expect(isUserConfigError(err)).toBe(true);
});

test('Should throw if invalid hostname', async () => {
  const executionContext = createMockExecutionContext<IntegrationConfig>({
    instanceConfig: {
      hostname: 'invalid.service-now.com',
      userid: 'invalid',
      password: 'invalid',
    },
  });

  let err;
  try {
    await validateInvocation(executionContext);
  } catch (e) {
    err = e;
  }

  expect(err).not.toBeUndefined();
  expect(err.message).toMatch(
    'Failure validating the ServiceNow API: getaddrinfo ENOTFOUND invalid.service-now.com',
  );
  expect(isUserConfigError(err)).toBe(true);
});

describe('recordings', () => {
  let recording: Recording;

  afterEach(async () => {
    await recording.stop();
  });

  test('Should throw if invalid credentials', async () => {
    recording = setupServiceNowRecording({
      directory: __dirname,
      name: 'validateInvocationFailsWithBadCredentials',
      options: {
        recordFailedRequests: true,
      },
    });

    const executionContext = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: {
        hostname: process.env.HOSTNAME || 'dev000000.service-now.com',
        userid: process.env.USERID || 'valid_username',
        password: process.env.PASSWORD || 'valid_password',
      },
    });
    const hostname = executionContext.instance.config.hostname;

    let err;
    try {
      await validateInvocation(executionContext);
    } catch (e) {
      err = e;
    }

    expect(err).not.toBeUndefined();
    expect(err.message).toMatch(
      `Provider authorization failed at https://${hostname}/api/now/table/sys_user?sysparm_limit=1: 401`,
    );
    expect(isProviderAuthError(err)).toBe(true);
  });

  test('Should return undefined if valid credentials', async () => {
    recording = setupServiceNowRecording({
      directory: __dirname,
      name: 'validateInvocationPassesWithGoodCredentials',
    });

    const executionContext = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: {
        hostname: process.env.HOSTNAME || 'dev000000.service-now.com',
        userid: process.env.USERID || 'valid_username',
        password: process.env.PASSWORD || 'valid_password',
      },
    });

    const response = await validateInvocation(executionContext);
    expect(response).toBeUndefined();
  });
});
