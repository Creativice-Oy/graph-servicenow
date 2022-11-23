import { IntegrationInstanceConfigFieldMap } from '@jupiterone/integration-sdk-core';

const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  hostname: {
    type: 'string',
  },
  userid: {
    type: 'string',
  },
  password: {
    type: 'string',
    mask: true,
  },
};

export default instanceConfigFields;
