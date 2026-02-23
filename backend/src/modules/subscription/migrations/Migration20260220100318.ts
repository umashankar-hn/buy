import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260220100318 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "subscription" ("id" text not null, "customer_id" text not null, "plan_id" text not null, "plan_name" text not null, "status" text check ("status" in ('active', 'canceled', 'past_due', 'paused')) not null, "amount" integer not null, "currency" text not null, "billing_cycle" text not null, "current_period_start" timestamptz not null, "current_period_end" timestamptz not null, "next_billing_date" timestamptz not null, "authorize_subscription_id" text null, "authorize_customer_profile_id" text null, "authorize_payment_profile_id" text null, "canceled_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "subscription_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_subscription_deleted_at" ON "subscription" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "subscription" cascade;`);
  }

}
