# Development

This project leverages the ServiceNow
[Table API](https://developer.servicenow.com/dev.do#!/reference/api/orlando/rest/c_TableAPI)
to fetch entities and relationships for the J1 graph.

## Table API

There is no available standard reference of ServiceNow table names or schemas,
so integration devs should look carefully at what is returned from their APIs to
decide what fields can be reliably used for entities and relationships.

ServiceNow's data model
[appears to allow](https://community.servicenow.com/community?id=community_question&sys_id=f17a87e9db5cdbc01dcaf3231f96196f)
for both custom tables and custom fields on standard OOTB tables. Developers can
use an auto-generated list of tables available in the standard Developer
Instance of ServiceNow in order to identify additional resource tables,
available at `/tools/__data__/tables.txt` or by running
`yarn list-remote-tables`.

## Provider account setup

ServiceNow has a self-service portal where developers can request a
[developer instance](https://developer.servicenow.com/dev.do#!/learn/learning-plans/paris/new_to_servicenow/app_store_learnv2_buildmyfirstapp_paris_personal_developer_instances)
pre-loaded with test data in the ServiceNow platform. Follow the instructions to
create your instance and obtain the `hostname`, `username`, and `password`
configuration variables.

## Authentication

This integration uses Basic auth for authentication. Developers should create a
`.env` file at the root of this project with the following configuration
variables:

```bash
HOSTNAME=dev00000.service-now.com
USERID=your-username
PASSWORD=your-password
```
