import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { SUBSCRIPTION_MODULE } from "../../../modules/subscription"
import SubscriptionService from "../../../modules/subscription/service"
import AuthorizeNetService from "../../../modules/subscription/services/authorize-net"

export interface CreateSubscriptionInput {
  customer_id: string
  email: string
  plan_id: string
  plan_name: string
  amount: number
  currency: string
  billing_cycle: "monthly" | "yearly" | "weekly"
  payment_token: string
  bill_to?: {
    first_name: string
    last_name: string
    address?: string
    city?: string
    state?: string
    zip?: string
    country?: string
    phone_number?: string
  }
}

export const createSubscriptionStep = createStep(
  "create-subscription-step",
  async (input: CreateSubscriptionInput, { container }) => {
    const subscriptionService: SubscriptionService = container.resolve(SUBSCRIPTION_MODULE)
    const authorizeNetService = new AuthorizeNetService()

    // Create subscription directly with payment token - ARB will auto-create customer profile
    const authorizeSubscription = await authorizeNetService.createSubscription({
      paymentToken: input.payment_token,
      email: input.email,
      customerId: input.customer_id,
      planId: input.plan_id,
      amount: input.amount / 100,
      interval: input.billing_cycle === "monthly" ? "months" : input.billing_cycle === "yearly" ? "months" : "days",
      intervalLength: input.billing_cycle === "monthly" ? 1 : input.billing_cycle === "yearly" ? 12 : 7,
    })

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
      authorize_subscription_id: authorizeSubscription.subscriptionId,
      authorize_customer_profile_id: authorizeSubscription.customerProfileId,
      authorize_payment_profile_id: authorizeSubscription.customerPaymentProfileId,
    }]);

    return new StepResponse(subscription, {
      subscriptionId: subscription.id,
      authorizeSubscriptionId: authorizeSubscription.subscriptionId,
    })
  },
  async (rollbackData, { container }) => {
    const subscriptionService: SubscriptionService = container.resolve(SUBSCRIPTION_MODULE)
    const authorizeNetService = new AuthorizeNetService()

    if (rollbackData?.authorizeSubscriptionId) {
      await authorizeNetService.cancelSubscription(rollbackData.authorizeSubscriptionId)
    }
    if (rollbackData?.subscriptionId) {
      await subscriptionService.deleteSubscriptions(rollbackData.subscriptionId)
    }
  }
)
