import { IntegrationInstanceConfig } from '@jupiterone/integration-sdk-core';

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
export interface IntegrationConfig extends IntegrationInstanceConfig {
  /**
   * Hostname for ServiceNow implementation, e.g. dev94579.service-now.com
   */
  hostname: string;
  /**
   * Username for basic auth
   */
  userid: string;
  /**
   * Password for basic auth
   */
  password: string;
}
