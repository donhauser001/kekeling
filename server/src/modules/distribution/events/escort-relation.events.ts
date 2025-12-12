/**
 * 陪诊员关系事件定义
 */

/**
 * 事件名称常量
 */
export const ESCORT_RELATION_EVENTS = {
  CREATED: 'escort.relation.created',
} as const;

/**
 * 邀请关系创建事件 payload
 */
export class EscortRelationCreatedEvent {
  /**
   * 邀请人（上级）ID
   */
  inviterId: string;

  /**
   * 被邀请人（下级）ID
   */
  inviteeId: string;

  /**
   * 邀请码
   */
  inviteCode: string;

  /**
   * 事件发生时间
   */
  timestamp: Date;

  constructor(partial: Partial<EscortRelationCreatedEvent>) {
    Object.assign(this, partial);
    this.timestamp = this.timestamp || new Date();
  }
}
