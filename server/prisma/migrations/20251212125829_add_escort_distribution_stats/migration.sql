-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "openid" TEXT NOT NULL,
    "unionid" TEXT,
    "nickname" TEXT,
    "avatar" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthday" TIMESTAMP(3),
    "phone" TEXT NOT NULL,
    "id_card" TEXT,
    "relation" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "invited_at" TIMESTAMP(3),
    "invite_status" TEXT NOT NULL DEFAULT 'none',
    "registered_user_id" TEXT,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "description" TEXT,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "membership_policy" TEXT NOT NULL DEFAULT 'normal',
    "membership_discount" INTEGER,
    "membership_overtime_waiver" INTEGER,
    "price" DECIMAL(10,2) NOT NULL,
    "original_price" DECIMAL(10,2),
    "unit" TEXT NOT NULL DEFAULT '次',
    "duration" TEXT,
    "cover_image" TEXT,
    "detailImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "service_includes" JSONB,
    "service_notes" JSONB,
    "min_quantity" INTEGER NOT NULL DEFAULT 1,
    "max_quantity" INTEGER NOT NULL DEFAULT 99,
    "need_patient" BOOLEAN NOT NULL DEFAULT true,
    "need_hospital" BOOLEAN NOT NULL DEFAULT true,
    "need_department" BOOLEAN NOT NULL DEFAULT false,
    "need_doctor" BOOLEAN NOT NULL DEFAULT false,
    "need_appointment" BOOLEAN NOT NULL DEFAULT true,
    "need_id_card" BOOLEAN NOT NULL DEFAULT false,
    "need_gender" BOOLEAN NOT NULL DEFAULT false,
    "need_emergency_contact" BOOLEAN NOT NULL DEFAULT false,
    "allow_post_order" BOOLEAN NOT NULL DEFAULT false,
    "custom_fields" JSONB,
    "field_order" JSONB,
    "order_count" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "commission_rate" INTEGER DEFAULT 70,
    "commission_note" TEXT,
    "workflow_id" TEXT,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_guarantees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'shield',
    "description" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_guarantees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_guarantee_relations" (
    "service_id" TEXT NOT NULL,
    "guarantee_id" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_guarantee_relations_pkey" PRIMARY KEY ("service_id","guarantee_id")
);

-- CreateTable
CREATE TABLE "operation_guide_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operation_guide_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operation_guides" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "cover_image" TEXT,
    "tags" TEXT[],
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operation_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operation_guide_on_service" (
    "id" TEXT NOT NULL,
    "guide_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operation_guide_on_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "base_duration" INTEGER NOT NULL DEFAULT 240,
    "overtime_enabled" BOOLEAN NOT NULL DEFAULT true,
    "overtime_price" DECIMAL(10,2),
    "overtime_unit" TEXT NOT NULL DEFAULT '小时',
    "overtime_max" INTEGER,
    "overtime_grace" INTEGER NOT NULL DEFAULT 15,
    "membership_overtime_waiver" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_steps" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "level" TEXT NOT NULL,
    "level_detail" TEXT,
    "type" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "introduction" TEXT,
    "specialties" TEXT[],
    "traffic_guide" TEXT,
    "parking_info" TEXT,
    "cover_image" TEXT,
    "images" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "category" TEXT NOT NULL,
    "parent_id" TEXT,
    "description" TEXT,
    "diseases" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "template_id" TEXT,
    "name" TEXT NOT NULL,
    "parent_id" TEXT,
    "introduction" TEXT,
    "location" TEXT,
    "phone" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "gender" TEXT,
    "hospital_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT,
    "introduction" TEXT,
    "specialties" TEXT[],
    "education" TEXT,
    "experience" TEXT,
    "consult_count" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escort_levels" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "commissionRate" INTEGER NOT NULL DEFAULT 70,
    "dispatchWeight" INTEGER NOT NULL DEFAULT 10,
    "min_experience" INTEGER,
    "min_order_count" INTEGER,
    "min_rating" DOUBLE PRECISION,
    "badge" TEXT,
    "description" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escort_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escort_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'feature',
    "icon" TEXT,
    "color" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escort_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escorts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "id_card" TEXT,
    "avatar" TEXT,
    "city_code" TEXT NOT NULL DEFAULT '110100',
    "level_code" TEXT,
    "experience" TEXT,
    "introduction" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certificates" TEXT,
    "service_radius" INTEGER NOT NULL DEFAULT 20,
    "service_hours" TEXT,
    "max_daily_orders" INTEGER NOT NULL DEFAULT 5,
    "current_daily_orders" INTEGER NOT NULL DEFAULT 0,
    "emergency_contact" TEXT,
    "emergency_phone" TEXT,
    "health_cert_expiry" TIMESTAMP(3),
    "last_health_check" TIMESTAMP(3),
    "last_latitude" DOUBLE PRECISION,
    "last_longitude" DOUBLE PRECISION,
    "last_location_at" TIMESTAMP(3),
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "order_count" INTEGER NOT NULL DEFAULT 0,
    "last_active_at" TIMESTAMP(3),
    "inactive_reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "work_status" TEXT NOT NULL DEFAULT 'resting',
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "distribution_level" INTEGER NOT NULL DEFAULT 3,
    "invite_code" TEXT,
    "parent_id" TEXT,
    "ancestor_path" TEXT,
    "team_size" INTEGER NOT NULL DEFAULT 0,
    "total_team_size" INTEGER NOT NULL DEFAULT 0,
    "promoted_at" TIMESTAMP(3),
    "promotion_applied_at" TIMESTAMP(3),
    "original_parent_id" TEXT,
    "parent_changed_at" TIMESTAMP(3),
    "parent_change_reason" TEXT,
    "distribution_active" BOOLEAN NOT NULL DEFAULT true,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_distribution_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "escorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity_audit_logs" (
    "id" TEXT NOT NULL,
    "escort_id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" TEXT NOT NULL,
    "old_phone" TEXT,
    "new_phone" TEXT,
    "reason" TEXT,
    "operator_type" TEXT NOT NULL,
    "operator_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "identity_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escort_invitations" (
    "id" TEXT NOT NULL,
    "inviter_id" TEXT NOT NULL,
    "inviter_level" INTEGER NOT NULL,
    "invitee_id" TEXT NOT NULL,
    "invite_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "activated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escort_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distribution_levels" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "bg_color" TEXT,
    "description" TEXT,
    "commission_rate" INTEGER NOT NULL DEFAULT 0,
    "promotion_config" JSONB,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distribution_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distribution_config" (
    "id" TEXT NOT NULL,
    "l1_commission_rate" INTEGER NOT NULL DEFAULT 2,
    "l2_commission_rate" INTEGER NOT NULL DEFAULT 3,
    "l3_commission_rate" INTEGER NOT NULL DEFAULT 1,
    "direct_invite_bonus" DECIMAL(10,2) NOT NULL DEFAULT 50,
    "l2_promotion_config" JSONB,
    "l1_promotion_config" JSONB,
    "max_monthly_distribution" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distribution_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distribution_records" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "order_amount" DECIMAL(10,2) NOT NULL,
    "beneficiary_id" TEXT NOT NULL,
    "beneficiary_level" INTEGER NOT NULL,
    "source_escort_id" TEXT NOT NULL,
    "relation_level" INTEGER NOT NULL,
    "rate" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "settled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distribution_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_change_logs" (
    "id" TEXT NOT NULL,
    "escort_id" TEXT NOT NULL,
    "old_parent_id" TEXT,
    "old_ancestor_path" TEXT,
    "new_parent_id" TEXT,
    "new_ancestor_path" TEXT,
    "reason" TEXT NOT NULL,
    "operator_type" TEXT NOT NULL,
    "operator_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parent_change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_applications" (
    "id" TEXT NOT NULL,
    "escort_id" TEXT NOT NULL,
    "from_level" INTEGER NOT NULL,
    "to_level" INTEGER NOT NULL,
    "application_data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotion_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escort_wallets" (
    "id" TEXT NOT NULL,
    "escort_id" TEXT NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "frozen_balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_earned" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_withdrawn" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "withdraw_method" TEXT,
    "withdraw_account" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escort_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balance_after" DECIMAL(10,2) NOT NULL,
    "order_id" TEXT,
    "withdraw_id" TEXT,
    "debt_id" TEXT,
    "title" TEXT NOT NULL,
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "actual_amount" DECIMAL(10,2) NOT NULL,
    "method" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "review_note" TEXT,
    "transfer_no" TEXT,
    "transfer_at" TIMESTAMP(3),
    "fail_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_debts" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "remaining_amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'refund',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deductions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "wallet_debts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escort_reviews" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "escort_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reply_content" TEXT,
    "reply_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'visible',
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escort_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_configs" (
    "id" TEXT NOT NULL,
    "default_rate" INTEGER NOT NULL DEFAULT 70,
    "min_withdraw_amount" DECIMAL(10,2) NOT NULL DEFAULT 100,
    "withdraw_fee_rate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "withdraw_fee_fixed" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "settlement_mode" TEXT NOT NULL DEFAULT 'realtime',
    "withdraw_days_of_week" TEXT,
    "withdraw_time_range" TEXT,
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commission_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escort_hospitals" (
    "id" TEXT NOT NULL,
    "escort_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "familiar_depts" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escort_hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "order_no" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "department_id" TEXT,
    "doctor_id" TEXT,
    "escort_id" TEXT,
    "appointment_date" TIMESTAMP(3) NOT NULL,
    "appointment_time" TEXT NOT NULL,
    "department_name" TEXT,
    "appointment_address" TEXT,
    "appointment_building" TEXT,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "commission_rate" INTEGER,
    "commission_amount" DECIMAL(10,2),
    "platform_amount" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assign_method" TEXT,
    "assign_deadline" TIMESTAMP(3),
    "service_deadline" TIMESTAMP(3),
    "pre_assign_work_status" TEXT,
    "pre_assigned_escort_id" TEXT,
    "arrive_photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "complete_photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "payment_method" TEXT,
    "payment_time" TIMESTAMP(3),
    "transaction_id" TEXT,
    "user_remark" TEXT,
    "admin_remark" TEXT,
    "cancel_reason" TEXT,
    "escort_rating" INTEGER,
    "escort_remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "assigned_at" TIMESTAMP(3),
    "arrived_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "coupon_id" TEXT,
    "campaign_id" TEXT,
    "points_used" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_price_snapshots" (
    "order_id" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_price_snapshots_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "pricing_configs" (
    "id" TEXT NOT NULL,
    "discount_stack_mode" TEXT NOT NULL DEFAULT 'multiply',
    "coupon_stack_with_member" BOOLEAN NOT NULL DEFAULT true,
    "coupon_stack_with_campaign" BOOLEAN NOT NULL DEFAULT true,
    "points_enabled" BOOLEAN NOT NULL DEFAULT true,
    "points_rate" INTEGER NOT NULL DEFAULT 100,
    "points_max_rate" INTEGER NOT NULL DEFAULT 10,
    "min_pay_amount" DECIMAL(10,2) NOT NULL DEFAULT 0.01,
    "show_original_price" BOOLEAN NOT NULL DEFAULT true,
    "show_member_price" BOOLEAN NOT NULL DEFAULT true,
    "show_savings" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_levels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "discount" INTEGER NOT NULL DEFAULT 100,
    "overtimeFeeWaiver" INTEGER NOT NULL DEFAULT 0,
    "benefits" JSONB NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_plans" (
    "id" TEXT NOT NULL,
    "level_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "originalPrice" DECIMAL(10,2),
    "duration" INTEGER NOT NULL,
    "renewalBonus" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "features" TEXT[],
    "sort" INTEGER NOT NULL DEFAULT 0,
    "recommended" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_memberships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "level_id" TEXT NOT NULL,
    "plan_id" TEXT,
    "source" TEXT NOT NULL DEFAULT 'purchase',
    "level_name" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "overtime_fee_waiver" INTEGER NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "expire_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_orders" (
    "id" TEXT NOT NULL,
    "order_no" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "level_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'purchase',
    "plan_name" TEXT NOT NULL,
    "plan_price" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "bonus_days" INTEGER NOT NULL DEFAULT 0,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method" TEXT,
    "paid_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "refunded_at" TIMESTAMP(3),
    "refund_amount" DECIMAL(10,2),
    "refund_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consume_upgrade_rules" (
    "id" TEXT NOT NULL,
    "level_id" TEXT NOT NULL,
    "threshold" DECIMAL(10,2) NOT NULL,
    "grant_days" INTEGER NOT NULL,
    "period" TEXT NOT NULL DEFAULT 'forever',
    "description" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consume_upgrade_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "type" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "max_discount" DECIMAL(10,2),
    "min_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "applicable_scope" TEXT NOT NULL DEFAULT 'all',
    "applicable_ids" TEXT[],
    "member_only" BOOLEAN NOT NULL DEFAULT false,
    "member_level_ids" TEXT[],
    "total_quantity" INTEGER,
    "per_user_limit" INTEGER NOT NULL DEFAULT 1,
    "validity_type" TEXT NOT NULL DEFAULT 'fixed',
    "start_at" TIMESTAMP(3),
    "end_at" TIMESTAMP(3),
    "valid_days" INTEGER,
    "stack_with_member" BOOLEAN NOT NULL DEFAULT true,
    "stack_with_campaign" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "tips" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_coupons" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "max_discount" DECIMAL(10,2),
    "min_amount" DECIMAL(10,2) NOT NULL,
    "applicable_scope" TEXT NOT NULL,
    "applicable_ids" TEXT[],
    "stack_with_member" BOOLEAN NOT NULL,
    "stack_with_campaign" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unused',
    "used_at" TIMESTAMP(3),
    "order_id" TEXT,
    "start_at" TIMESTAMP(3) NOT NULL,
    "expire_at" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'claim',
    "source_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_grant_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "trigger_config" JSONB,
    "grant_quantity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_grant_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "points_rate" DECIMAL(5,2),
    "daily_limit" INTEGER,
    "total_limit" INTEGER,
    "conditions" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "point_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_points" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "used_points" INTEGER NOT NULL DEFAULT 0,
    "expired_points" INTEGER NOT NULL DEFAULT 0,
    "current_points" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "source_id" TEXT,
    "description" TEXT NOT NULL,
    "expire_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "inviter_coupon_id" TEXT,
    "inviter_points" INTEGER NOT NULL DEFAULT 0,
    "invitee_coupon_id" TEXT,
    "invitee_points" INTEGER NOT NULL DEFAULT 0,
    "require_first_order" BOOLEAN NOT NULL DEFAULT true,
    "daily_limit" INTEGER,
    "total_limit" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_invite_codes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "invite_count" INTEGER NOT NULL DEFAULT 0,
    "reward_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_invite_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_records" (
    "id" TEXT NOT NULL,
    "inviter_id" TEXT NOT NULL,
    "invitee_id" TEXT,
    "invite_code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "patient_id" TEXT,
    "patient_phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "registered_at" TIMESTAMP(3),
    "rewarded_at" TIMESTAMP(3),
    "inviter_reward" JSONB,
    "invitee_reward" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "type" TEXT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "discount_type" TEXT NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "max_discount" DECIMAL(10,2),
    "min_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "applicable_scope" TEXT NOT NULL DEFAULT 'all',
    "applicable_ids" TEXT[],
    "total_quantity" INTEGER,
    "per_user_limit" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "banner_url" TEXT,
    "detail_url" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "stack_with_member" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_participations" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT,
    "discount_amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seckill_items" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "seckill_price" DECIMAL(10,2) NOT NULL,
    "stock_total" INTEGER NOT NULL,
    "stock_sold" INTEGER NOT NULL DEFAULT 0,
    "per_user_limit" INTEGER NOT NULL DEFAULT 1,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "seckill_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_logs" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT,
    "operator_type" TEXT NOT NULL,
    "operator_id" TEXT,
    "operator_name" TEXT,
    "remark" TEXT,
    "extra" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "position" TEXT NOT NULL DEFAULT 'home',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "escort_id" TEXT,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'pending',
    "handler_id" TEXT,
    "handler_name" TEXT,
    "handle_note" TEXT,
    "handle_result" TEXT,
    "handled_by" TEXT,
    "handled_at" TIMESTAMP(3),
    "resolution" TEXT,
    "user_refund" DECIMAL(10,2),
    "user_coupon" DECIMAL(10,2),
    "escort_penalty" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_templates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'system',
    "category" TEXT NOT NULL DEFAULT 'system',
    "title" TEXT,
    "content" TEXT NOT NULL,
    "channels" TEXT[] DEFAULT ARRAY['in_app']::TEXT[],
    "wechat_template_id" TEXT,
    "rate_limit" INTEGER,
    "cooldown" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'system',
    "category" TEXT NOT NULL DEFAULT 'system',
    "template_code" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "link" TEXT,
    "extra" TEXT,
    "related_type" TEXT,
    "related_id" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "recipient_id" TEXT NOT NULL,
    "recipient_type" TEXT NOT NULL DEFAULT 'user',
    "template_code" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "variables" JSONB,
    "related_type" TEXT,
    "related_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_openid_key" ON "users"("openid");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "operation_guide_on_service_guide_id_service_id_key" ON "operation_guide_on_service"("guide_id", "service_id");

-- CreateIndex
CREATE UNIQUE INDEX "department_templates_name_key" ON "department_templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "escort_levels_code_key" ON "escort_levels"("code");

-- CreateIndex
CREATE UNIQUE INDEX "escort_tags_name_key" ON "escort_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "escorts_user_id_key" ON "escorts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "escorts_phone_key" ON "escorts"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "escorts_invite_code_key" ON "escorts"("invite_code");

-- CreateIndex
CREATE INDEX "escorts_parent_id_idx" ON "escorts"("parent_id");

-- CreateIndex
CREATE INDEX "escorts_invite_code_idx" ON "escorts"("invite_code");

-- CreateIndex
CREATE INDEX "identity_audit_logs_escort_id_idx" ON "identity_audit_logs"("escort_id");

-- CreateIndex
CREATE INDEX "identity_audit_logs_user_id_idx" ON "identity_audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "identity_audit_logs_created_at_idx" ON "identity_audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "escort_invitations_invitee_id_key" ON "escort_invitations"("invitee_id");

-- CreateIndex
CREATE INDEX "escort_invitations_inviter_id_idx" ON "escort_invitations"("inviter_id");

-- CreateIndex
CREATE INDEX "escort_invitations_invite_code_idx" ON "escort_invitations"("invite_code");

-- CreateIndex
CREATE UNIQUE INDEX "distribution_levels_level_key" ON "distribution_levels"("level");

-- CreateIndex
CREATE UNIQUE INDEX "distribution_levels_code_key" ON "distribution_levels"("code");

-- CreateIndex
CREATE INDEX "distribution_records_beneficiary_id_idx" ON "distribution_records"("beneficiary_id");

-- CreateIndex
CREATE INDEX "distribution_records_order_id_idx" ON "distribution_records"("order_id");

-- CreateIndex
CREATE INDEX "distribution_records_status_idx" ON "distribution_records"("status");

-- CreateIndex
CREATE INDEX "parent_change_logs_escort_id_idx" ON "parent_change_logs"("escort_id");

-- CreateIndex
CREATE INDEX "promotion_applications_escort_id_idx" ON "promotion_applications"("escort_id");

-- CreateIndex
CREATE INDEX "promotion_applications_status_idx" ON "promotion_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "escort_wallets_escort_id_key" ON "escort_wallets"("escort_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_wallet_id_created_at_idx" ON "wallet_transactions"("wallet_id", "created_at");

-- CreateIndex
CREATE INDEX "withdrawals_wallet_id_status_idx" ON "withdrawals"("wallet_id", "status");

-- CreateIndex
CREATE INDEX "wallet_debts_wallet_id_status_idx" ON "wallet_debts"("wallet_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "escort_reviews_order_id_key" ON "escort_reviews"("order_id");

-- CreateIndex
CREATE INDEX "escort_reviews_escort_id_created_at_idx" ON "escort_reviews"("escort_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "escort_hospitals_escort_id_hospital_id_key" ON "escort_hospitals"("escort_id", "hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_no_key" ON "orders"("order_no");

-- CreateIndex
CREATE UNIQUE INDEX "orders_coupon_id_key" ON "orders"("coupon_id");

-- CreateIndex
CREATE INDEX "orders_status_appointment_date_idx" ON "orders"("status", "appointment_date");

-- CreateIndex
CREATE INDEX "orders_escort_id_status_idx" ON "orders"("escort_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "membership_levels_code_key" ON "membership_levels"("code");

-- CreateIndex
CREATE INDEX "membership_plans_level_id_idx" ON "membership_plans"("level_id");

-- CreateIndex
CREATE UNIQUE INDEX "membership_plans_level_id_code_key" ON "membership_plans"("level_id", "code");

-- CreateIndex
CREATE INDEX "user_memberships_user_id_status_idx" ON "user_memberships"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_memberships_expire_at_idx" ON "user_memberships"("expire_at");

-- CreateIndex
CREATE UNIQUE INDEX "membership_orders_order_no_key" ON "membership_orders"("order_no");

-- CreateIndex
CREATE INDEX "membership_orders_user_id_idx" ON "membership_orders"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_templates_code_key" ON "coupon_templates"("code");

-- CreateIndex
CREATE INDEX "user_coupons_user_id_status_idx" ON "user_coupons"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_coupons_expire_at_idx" ON "user_coupons"("expire_at");

-- CreateIndex
CREATE UNIQUE INDEX "point_rules_code_key" ON "point_rules"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_points_user_id_key" ON "user_points"("user_id");

-- CreateIndex
CREATE INDEX "point_records_user_id_created_at_idx" ON "point_records"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "point_records_expire_at_idx" ON "point_records"("expire_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_invite_codes_user_id_key" ON "user_invite_codes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_invite_codes_code_key" ON "user_invite_codes"("code");

-- CreateIndex
CREATE INDEX "referral_records_inviter_id_idx" ON "referral_records"("inviter_id");

-- CreateIndex
CREATE INDEX "referral_records_invitee_id_idx" ON "referral_records"("invitee_id");

-- CreateIndex
CREATE INDEX "referral_records_invite_code_idx" ON "referral_records"("invite_code");

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_code_key" ON "campaigns"("code");

-- CreateIndex
CREATE INDEX "campaigns_status_start_at_end_at_idx" ON "campaigns"("status", "start_at", "end_at");

-- CreateIndex
CREATE INDEX "campaign_participations_campaign_id_idx" ON "campaign_participations"("campaign_id");

-- CreateIndex
CREATE INDEX "campaign_participations_user_id_idx" ON "campaign_participations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "seckill_items_campaign_id_service_id_key" ON "seckill_items"("campaign_id", "service_id");

-- CreateIndex
CREATE INDEX "order_logs_order_id_created_at_idx" ON "order_logs"("order_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "configs_key_key" ON "configs"("key");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE INDEX "complaints_order_id_idx" ON "complaints"("order_id");

-- CreateIndex
CREATE INDEX "complaints_user_id_idx" ON "complaints"("user_id");

-- CreateIndex
CREATE INDEX "complaints_escort_id_idx" ON "complaints"("escort_id");

-- CreateIndex
CREATE INDEX "complaints_status_idx" ON "complaints"("status");

-- CreateIndex
CREATE UNIQUE INDEX "message_templates_code_key" ON "message_templates"("code");

-- CreateIndex
CREATE INDEX "messages_user_id_is_read_idx" ON "messages"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "messages_user_id_created_at_idx" ON "messages"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_category_idx" ON "messages"("category");

-- CreateIndex
CREATE INDEX "notification_logs_user_id_created_at_idx" ON "notification_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "notification_logs_recipient_id_created_at_idx" ON "notification_logs"("recipient_id", "created_at");

-- CreateIndex
CREATE INDEX "notification_logs_template_code_created_at_idx" ON "notification_logs"("template_code", "created_at");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_registered_user_id_fkey" FOREIGN KEY ("registered_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_guarantee_relations" ADD CONSTRAINT "service_guarantee_relations_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_guarantee_relations" ADD CONSTRAINT "service_guarantee_relations_guarantee_id_fkey" FOREIGN KEY ("guarantee_id") REFERENCES "service_guarantees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_guides" ADD CONSTRAINT "operation_guides_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "operation_guide_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_guide_on_service" ADD CONSTRAINT "operation_guide_on_service_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "operation_guides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_guide_on_service" ADD CONSTRAINT "operation_guide_on_service_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_templates" ADD CONSTRAINT "department_templates_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "department_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "department_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escorts" ADD CONSTRAINT "escorts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escorts" ADD CONSTRAINT "escorts_level_code_fkey" FOREIGN KEY ("level_code") REFERENCES "escort_levels"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escorts" ADD CONSTRAINT "escorts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "escorts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_audit_logs" ADD CONSTRAINT "identity_audit_logs_escort_id_fkey" FOREIGN KEY ("escort_id") REFERENCES "escorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escort_invitations" ADD CONSTRAINT "escort_invitations_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "escorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escort_invitations" ADD CONSTRAINT "escort_invitations_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "escorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_records" ADD CONSTRAINT "distribution_records_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_records" ADD CONSTRAINT "distribution_records_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "escorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_records" ADD CONSTRAINT "distribution_records_source_escort_id_fkey" FOREIGN KEY ("source_escort_id") REFERENCES "escorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_change_logs" ADD CONSTRAINT "parent_change_logs_escort_id_fkey" FOREIGN KEY ("escort_id") REFERENCES "escorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_applications" ADD CONSTRAINT "promotion_applications_escort_id_fkey" FOREIGN KEY ("escort_id") REFERENCES "escorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escort_wallets" ADD CONSTRAINT "escort_wallets_escort_id_fkey" FOREIGN KEY ("escort_id") REFERENCES "escorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "escort_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "escort_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_debts" ADD CONSTRAINT "wallet_debts_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "escort_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escort_reviews" ADD CONSTRAINT "escort_reviews_escort_id_fkey" FOREIGN KEY ("escort_id") REFERENCES "escorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escort_hospitals" ADD CONSTRAINT "escort_hospitals_escort_id_fkey" FOREIGN KEY ("escort_id") REFERENCES "escorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escort_hospitals" ADD CONSTRAINT "escort_hospitals_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_escort_id_fkey" FOREIGN KEY ("escort_id") REFERENCES "escorts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "user_coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_price_snapshots" ADD CONSTRAINT "order_price_snapshots_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_plans" ADD CONSTRAINT "membership_plans_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "membership_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "membership_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "membership_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_orders" ADD CONSTRAINT "membership_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_orders" ADD CONSTRAINT "membership_orders_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "membership_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_orders" ADD CONSTRAINT "membership_orders_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "membership_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consume_upgrade_rules" ADD CONSTRAINT "consume_upgrade_rules_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "membership_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_coupons" ADD CONSTRAINT "user_coupons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_coupons" ADD CONSTRAINT "user_coupons_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "coupon_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_grant_rules" ADD CONSTRAINT "coupon_grant_rules_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "coupon_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_points" ADD CONSTRAINT "user_points_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_records" ADD CONSTRAINT "point_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invite_codes" ADD CONSTRAINT "user_invite_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_records" ADD CONSTRAINT "referral_records_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_records" ADD CONSTRAINT "referral_records_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_participations" ADD CONSTRAINT "campaign_participations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_participations" ADD CONSTRAINT "campaign_participations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seckill_items" ADD CONSTRAINT "seckill_items_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seckill_items" ADD CONSTRAINT "seckill_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_logs" ADD CONSTRAINT "order_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_escort_id_fkey" FOREIGN KEY ("escort_id") REFERENCES "escorts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
