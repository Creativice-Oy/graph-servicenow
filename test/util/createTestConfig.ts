import { IntegrationConfig } from '../../src/types';

export function createTestConfig(hostname: string): IntegrationConfig {
  return {
    hostname: process.env.HOSTNAME || hostname,
    userid: process.env.USERID || 'default-username',
    password: process.env.PASSWORD || 'default-password',
  };
}
