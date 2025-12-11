-- 营销中心数据库索引优化
-- 执行方式：psql -d your_database -f add-marketing-indexes.sql

-- ========== 会员系统索引 ==========

-- UserMembership: 用户会员查询（按用户ID和状态）
-- 已存在：@@index([userId, status])
-- 补充：按到期时间查询
CREATE INDEX IF NOT EXISTS "idx_user_membership_expire" ON "UserMembership"("expiresAt") WHERE "status" = 'active';

-- MembershipOrder: 会员订单查询
CREATE INDEX IF NOT EXISTS "idx_membership_order_user_status" ON "MembershipOrder"("userId", "status", "createdAt");

-- ========== 优惠券系统索引 ==========

-- UserCoupon: 用户可用优惠券查询（按用户ID、状态、过期时间）
-- 已存在：@@index([userId, status]) 和 @@index([expireAt])
-- 补充：复合索引优化查询性能
CREATE INDEX IF NOT EXISTS "idx_user_coupon_user_status_expire" ON "UserCoupon"("userId", "status", "expireAt") WHERE "status" = 'unused';

-- CouponTemplate: 可领取优惠券查询
CREATE INDEX IF NOT EXISTS "idx_coupon_template_status_dates" ON "CouponTemplate"("status", "startAt", "endAt") WHERE "status" = 'active';

-- CouponRule: 优惠券发放规则查询
CREATE INDEX IF NOT EXISTS "idx_coupon_rule_trigger" ON "CouponRule"("trigger", "enabled") WHERE "enabled" = true;

-- ========== 积分系统索引 ==========

-- UserPoint: 用户积分查询
-- 已存在：@@index([userId])
-- 补充：按用户查询当前积分（频繁查询）
-- 注意：UserPoint 是 1:1 关系，userId 已有唯一索引

-- PointRecord: 积分记录查询
-- 已存在：@@index([userId, createdAt])
-- 补充：按类型和日期范围查询
CREATE INDEX IF NOT EXISTS "idx_point_record_user_type_date" ON "PointRecord"("userId", "type", "createdAt");

-- PointRule: 积分规则查询
CREATE INDEX IF NOT EXISTS "idx_point_rule_trigger" ON "PointRule"("trigger", "enabled") WHERE "enabled" = true;

-- ========== 邀请系统索引 ==========

-- ReferralRecord: 邀请记录查询
-- 已存在：@@index([inviterId]), @@index([inviteeId])
-- 补充：按邀请人和状态查询（统计用）
CREATE INDEX IF NOT EXISTS "idx_referral_record_inviter_status" ON "ReferralRecord"("inviterId", "status", "createdAt");

-- ReferralRecord: 按邀请码查询
-- 已存在：@@index([inviteCode])
-- 补充：按手机号查询（防重复邀请）
CREATE INDEX IF NOT EXISTS "idx_referral_record_phone" ON "ReferralRecord"("inviteePhone") WHERE "inviteePhone" IS NOT NULL;

-- ========== 活动系统索引 ==========

-- Campaign: 活动查询
-- 已存在：@@index([status, startAt, endAt])
-- 补充：按服务ID查询适用活动
CREATE INDEX IF NOT EXISTS "idx_campaign_service" ON "Campaign"("applicableScope", "status") WHERE "applicableScope" != 'all';

-- SeckillItem: 秒杀商品查询
-- 已存在：@@index([campaignId])
-- 补充：按服务ID查询秒杀商品
CREATE INDEX IF NOT EXISTS "idx_seckill_item_service" ON "SeckillItem"("serviceId", "campaignId");

-- CampaignParticipation: 活动参与记录
-- 已存在：@@index([userId])
-- 补充：按活动ID和用户ID查询（防重复参与）
CREATE INDEX IF NOT EXISTS "idx_campaign_participation_campaign_user" ON "CampaignParticipation"("campaignId", "userId");

-- ========== 价格引擎索引 ==========

-- OrderPriceSnapshot: 订单价格快照查询
-- 已存在：@@index([orderId])
-- 补充：按订单ID查询（已存在，无需补充）

-- PricingConfig: 价格配置查询（单条记录，无需索引）

-- ========== 订单相关索引（营销相关） ==========

-- Order: 订单查询（包含营销字段）
-- 已存在：@@index([userId, status])
-- 补充：按优惠券ID查询（退款时使用）
CREATE INDEX IF NOT EXISTS "idx_order_coupon" ON "Order"("couponId") WHERE "couponId" IS NOT NULL;

-- Order: 按活动ID查询（退款时释放库存）
CREATE INDEX IF NOT EXISTS "idx_order_campaign" ON "Order"("campaignId") WHERE "campaignId" IS NOT NULL;

-- ========== 定时任务优化索引 ==========

-- UserMembership: 即将到期会员查询（7天内）
CREATE INDEX IF NOT EXISTS "idx_user_membership_expiring" ON "UserMembership"("expiresAt", "status") 
  WHERE "status" = 'active' AND "expiresAt" >= NOW() AND "expiresAt" <= NOW() + INTERVAL '7 days';

-- PointRecord: 即将过期积分查询（30天内）
CREATE INDEX IF NOT EXISTS "idx_point_record_expiring" ON "PointRecord"("userId", "expireAt", "type")
  WHERE "type" = 'earn' AND "expireAt" IS NOT NULL AND "expireAt" >= NOW() AND "expireAt" <= NOW() + INTERVAL '30 days';

-- Campaign: 需要更新状态的活动查询
CREATE INDEX IF NOT EXISTS "idx_campaign_status_update" ON "Campaign"("status", "startAt", "endAt")
  WHERE "status" IN ('pending', 'active');

-- ========== 分析查询索引 ==========

-- 优惠券使用统计
CREATE INDEX IF NOT EXISTS "idx_user_coupon_used_date" ON "UserCoupon"("status", "usedAt") WHERE "status" = 'used';

-- 积分获得统计
CREATE INDEX IF NOT EXISTS "idx_point_record_earn_date" ON "PointRecord"("type", "createdAt") WHERE "type" = 'earn';

-- 邀请奖励统计
CREATE INDEX IF NOT EXISTS "idx_referral_record_rewarded" ON "ReferralRecord"("status", "rewardedAt") WHERE "status" = 'rewarded';

-- ========== 索引使用说明 ==========
-- 
-- 1. 执行此脚本前，请先备份数据库
-- 2. 在生产环境执行时，建议在低峰期执行
-- 3. 执行后使用 EXPLAIN ANALYZE 验证索引使用情况
-- 4. 定期监控索引大小，必要时清理未使用的索引
-- 
-- 验证索引使用：
-- EXPLAIN ANALYZE SELECT * FROM "UserCoupon" WHERE "userId" = 'xxx' AND "status" = 'unused' AND "expireAt" > NOW();
-- 
-- 查看索引大小：
-- SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public' AND tablename LIKE '%Coupon%' OR tablename LIKE '%Point%' OR tablename LIKE '%Referral%'
-- ORDER BY pg_relation_size(indexrelid) DESC;

