import { model } from "@medusajs/framework/utils"

const Subscription = model.define("subscription", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  plan_id: model.text(),
  plan_name: model.text(),
  status: model.enum(["active", "canceled", "past_due", "paused"]),
  amount: model.number(),
  currency: model.text(),
  billing_cycle: model.text(),
  current_period_start: model.dateTime(),
  current_period_end: model.dateTime(),
  next_billing_date: model.dateTime(),
  authorize_subscription_id: model.text().nullable(),
  authorize_customer_profile_id: model.text().nullable(),
  authorize_payment_profile_id: model.text().nullable(),
  canceled_at: model.dateTime().nullable(),
})

export default Subscription
