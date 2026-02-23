import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { SUBSCRIPTION_MODULE } from "../../../modules/subscription"
import SubscriptionService from "../../../modules/subscription/service"

export interface CreateSubscriptionInput {
  customer_id: string
  email: string
  plan_id: string
  plan_name: string
  amount: number
  currency: string
  billing_cycle: "monthly" | "yearly" | "weekly"
}

export const createSubscriptionStep = createStep(
  "create-subscription-step",
  async (input: CreateSubscriptionInput, { container }) => {
    const subscriptionService: SubscriptionService = container.resolve(SUBSCRIPTION_MODULE)

    // Calculate billing dates
    const now = new Date()
    const periodEnd = new Date(now)
    
    switch (input.billing_cycle) {
      case "monthly":
        periodEnd.setMonth(periodEnd.getMonth() + 1)
        break
      case "yearly":
        periodEnd.setFullYear(periodEnd.getFullYear() + 1)
        break
      case "weekly":
        periodEnd.setDate(periodEnd.getDate() + 7)
        break
    }

    // Create subscription in database (dummy payment - no Authorize.Net)
    const [subscription] = await subscriptionService.createSubscriptions([{
      customer_id: input.customer_id,
      plan_id: input.plan_id,
      plan_name: input.plan_name,
      status: "active",
      amount: input.amount,
      currency: input.currency,
      billing_cycle: input.billing_cycle,
      current_period_start: now,
      current_period_end: periodEnd,
      next_billing_date: periodEnd,
      authorize_subscription_id: null,
      authorize_customer_profile_id: null,
      authorize_payment_profile_id: null,
    }])

    return new StepResponse(subscription, subscription.id)
  },
  async (subscriptionId, { container }) => {
    const subscriptionService: SubscriptionService = container.resolve(SUBSCRIPTION_MODULE)
    await subscriptionService.deleteSubscriptions(subscriptionId as string)
  }
)
