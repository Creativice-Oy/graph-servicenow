import {
  Entity,
  createIntegrationEntity,
  Relationship,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { Entities } from '../constants';

export function getUserKey(id: string, name: string): string {
  return `service_now_user:${id}:${name}`;
}

export function getGroupKey(id: string, name: string): string {
  return `service_now_group:${id}:${name}`;
}

export function getIncidentKey(id: string, name: string): string {
  return `service_now_incident:${id}:${name}`;
}

function convertCommonServiceNowProperties(
  serviceNowObject: any,
): Record<string, string | boolean | number | null | undefined> {
  return {
    createdOn: new Date(serviceNowObject.sys_created_on + ' UTC').valueOf(),
    updatedOn: new Date(serviceNowObject.sys_updated_on + ' UTC').valueOf(),
    id: serviceNowObject.sys_id,
  };
}

export function createAccountEntity(hostname: string): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _class: Entities.ACCOUNT._class,
        _type: Entities.ACCOUNT._type,
        _key: hostname,
        name: hostname,
        displayName: hostname,
      },
    },
  });
}

export function createUserEntity(user: any): Entity {
  delete user.user_password;
  return createIntegrationEntity({
    entityData: {
      source: user,
      assign: {
        ...convertCommonServiceNowProperties(user),
        _class: Entities.USER._class,
        _type: Entities.USER._type,
        _key: getUserKey(user.sys_id, user.user_name),
        username: user.user_name,
        active: user.active === 'true',
        email: user.email ? user.email : undefined,
      },
    },
  });
}

export function createGroupEntity(group: any): Entity {
  return createIntegrationEntity({
    entityData: {
      source: group,
      assign: {
        ...convertCommonServiceNowProperties(group),
        _class: Entities.GROUP._class,
        _type: Entities.GROUP._type,
        _key: getGroupKey(group.sys_id, group.email),
        active: group.active === 'true',
        email: group.email ? group.email : undefined,
      },
    },
  });
}

export function createIncidentEntity(incident: any): Entity {
  return createIntegrationEntity({
    entityData: {
      source: incident,
      assign: {
        ...convertCommonServiceNowProperties(incident),
        _class: Entities.INCIDENT._class,
        _type: Entities.INCIDENT._type,
        _key: getIncidentKey(incident.sys_id, incident.number),
        name: incident.number,
        displayName: incident.number,
        severity: incident.severity,
        category: incident.category,
        reporter: incident.opened_by.value,
        impact: incident.impact,
        resolvedAt: incident.resolved_at,
        active: incident.active === 'true',
        reportable: false,
      },
    },
  });
}

export function createIncidentAssigneeRelationship(
  incident: any,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.ASSIGNED,
    fromType: Entities.INCIDENT._type,
    fromKey: incident.sys_id,
    toType: Entities.USER._type,
    toKey: incident.assigned_to.value,
  });
}

export function createGroupGroupRelationship(
  groupEntity: Entity,
  parent: { link: string; value: string },
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    fromType: Entities.GROUP._type,
    fromKey: parent.value,
    toType: Entities.GROUP._type,
    toKey: groupEntity._key,
  });
}

export function createGroupUserRelationship(groupUser: any): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    fromType: Entities.GROUP._type,
    fromKey: groupUser.group.value,
    toType: Entities.USER._type,
    toKey: groupUser.user.value,
    properties: convertCommonServiceNowProperties(groupUser),
  });
}
