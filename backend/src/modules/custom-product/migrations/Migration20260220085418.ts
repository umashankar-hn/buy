import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260220085418 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "custom_product" ("id" text not null, "name" text not null, "description" text null, "price" integer not null, "stock" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "custom_product_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_custom_product_deleted_at" ON "custom_product" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "custom_product" cascade;`);
  }

}
