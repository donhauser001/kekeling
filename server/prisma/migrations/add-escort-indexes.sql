-- 陪诊员中心数据库索引优化
-- 执行方式：psql -d your_database -f add-escort-indexes.sql
-- 或使用 Prisma: npx prisma db execute --file add-escort-indexes.sql

-- ========== Escort 表索引 ==========

-- 状态筛选索引（用于筛选活跃陪诊员）
CREATE INDEX IF NOT EXISTS "idx_escort_status" ON "escorts"("status") WHERE "status" = 'active' AND "deleted_at" IS NULL;

-- 评分排序索引（用于按评分排序）
CREATE INDEX IF NOT EXISTS "idx_escort_rating" ON "escorts"("rating" DESC NULLS LAST) WHERE "status" = 'active' AND "deleted_at" IS NULL;

-- 城市代码索引（用于地区筛选）
CREATE INDEX IF NOT EXISTS "idx_escort_city_code" ON "escorts"("city_code") WHERE "status" = 'active' AND "deleted_at" IS NULL;

-- 等级代码索引（用于等级筛选）
CREATE INDEX IF NOT EXISTS "idx_escort_level_code" ON "escorts"("level_code") WHERE "level_code" IS NOT NULL AND "status" = 'active';

-- 复合索引：城市+等级+评分（用于综合查询）
CREATE INDEX IF NOT EXISTS "idx_escort_city_level_rating" ON "escorts"("city_code", "level_code", "rating" DESC) 
  WHERE "status" = 'active' AND "deleted_at" IS NULL;

-- 工作状态索引（用于派单筛选）
CREATE INDEX IF NOT EXISTS "idx_escort_work_status" ON "escorts"("work_status") WHERE "work_status" = 'working' AND "status" = 'active';

-- 服务半径索引（如需要范围查询）
CREATE INDEX IF NOT EXISTS "idx_escort_service_radius" ON "escorts"("service_radius") WHERE "status" = 'active';

-- 接单数量索引（用于筛选可接单陪诊员）
CREATE INDEX IF NOT EXISTS "idx_escort_daily_orders" ON "escorts"("current_daily_orders", "max_daily_orders") 
  WHERE "status" = 'active' AND "current_daily_orders" < "max_daily_orders";

-- ========== EscortHospital 表索引 ==========

-- 医院关联查询索引（用于查询医院关联的陪诊员）
CREATE INDEX IF NOT EXISTS "idx_escort_hospital_hospital" ON "escort_hospitals"("hospital_id") 
  WHERE "hospital_id" IS NOT NULL;

-- 陪诊员关联查询索引（用于查询陪诊员关联的医院）
CREATE INDEX IF NOT EXISTS "idx_escort_hospital_escort" ON "escort_hospitals"("escort_id") 
  WHERE "escort_id" IS NOT NULL;

-- 复合索引：医院+主医院标识（用于快速查询主医院）
CREATE INDEX IF NOT EXISTS "idx_escort_hospital_primary" ON "escort_hospitals"("hospital_id", "is_primary") 
  WHERE "is_primary" = true;

-- ========== EscortReview 表索引 ==========

-- 陪诊员评价查询索引（用于评分计算）
CREATE INDEX IF NOT EXISTS "idx_escort_review_escort" ON "escort_reviews"("escort_id") 
  WHERE "escort_id" IS NOT NULL;

-- 评分统计索引（用于按评分统计）
CREATE INDEX IF NOT EXISTS "idx_escort_review_rating" ON "escort_reviews"("escort_id", "rating") 
  WHERE "escort_id" IS NOT NULL;

-- 时间排序索引（用于评价列表排序）
CREATE INDEX IF NOT EXISTS "idx_escort_review_created" ON "escort_reviews"("escort_id", "created_at" DESC) 
  WHERE "escort_id" IS NOT NULL;

-- ========== 服务设置相关索引 ==========

-- 服务时段查询（如需要按时段筛选，但通常使用JSON查询，索引效果有限）
-- 注意：PostgreSQL 对 JSON 字段的索引支持有限，建议在应用层处理

-- ========== 性能优化建议 ==========

-- 1. 定期分析表统计信息
-- ANALYZE "escorts";
-- ANALYZE "escort_hospitals";
-- ANALYZE "escort_reviews";

-- 2. 监控索引使用情况
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public' AND tablename IN ('escorts', 'escort_hospitals', 'escort_reviews')
-- ORDER BY idx_scan DESC;

-- 3. 查看索引大小
-- SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public' AND tablename IN ('escorts', 'escort_hospitals', 'escort_reviews')
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- 4. 验证查询计划
-- EXPLAIN ANALYZE
-- SELECT e.* FROM "escorts" e
-- INNER JOIN "escort_hospitals" eh ON e.id = eh.escort_id
-- WHERE eh.hospital_id = 'xxx' AND e.status = 'active' AND e.deleted_at IS NULL
-- ORDER BY e.rating DESC
-- LIMIT 10;

-- ========== 索引维护 ==========

-- 定期重建索引（在低峰期执行）
-- REINDEX INDEX CONCURRENTLY "idx_escort_status";
-- REINDEX INDEX CONCURRENTLY "idx_escort_rating";
-- REINDEX INDEX CONCURRENTLY "idx_escort_hospital_hospital";

-- ========== 注意事项 ==========
-- 
-- 1. 执行此脚本前，请先备份数据库
-- 2. 在生产环境执行时，建议在低峰期执行
-- 3. 使用 CONCURRENTLY 选项可以避免锁表（PostgreSQL 12+）
-- 4. 执行后使用 EXPLAIN ANALYZE 验证索引使用情况
-- 5. 定期监控索引大小和使用率，必要时清理未使用的索引
-- 6. 对于 JSON 字段（如 serviceHours），考虑在应用层建立缓存或使用全文搜索
