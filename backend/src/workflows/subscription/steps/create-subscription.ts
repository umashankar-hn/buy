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
  paymentToken: string
}

export const createSubscriptionStep = createStep(
  "create-subscription-step",
  async (input: CreateSubscriptionInput, { container }) => {
    const subscriptionService: SubscriptionService = container.resolve(SUBSCRIPTION_MODULE)
    const authorizeNet = new AuthorizeNetService()

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

    // Create customer profile in Authorize.net
    let customerProfileId = ""
    let paymentProfileId = ""

    try {
      const customerResult = await authorizeNet.createCustomerProfile({
        email: input.email,
        paymentToken: input.paymentToken,
      })
      customerProfileId = customerResult.customerProfileId
      paymentProfileId = customerResult.customerPaymentProfileId
    } catch (error) {
      // If customer already exists, handle the error or use existing profile
      console.error("Error creating customer profile:", error)
      throw error
    }

    // Create subscription in Authorize.net
    const intervalMap = {
      monthly: { interval: "months" as const, intervalLength: 1 },
      yearly: { interval: "months" as const, intervalLength: 12 },
      weekly: { interval: "weeks" as const, intervalLength: 1 },
    }

    const intervalConfig = intervalMap[input.billing_cycle]

    let authorizeSubscriptionId = ""
    try {
      const subscriptionResult = await authorizeNet.createSubscription({
        customerProfileId,
        customerPaymentProfileId: paymentProfileId,
        planId: input.plan_id,
        amount: input.amount,
        interval: intervalConfig.interval,
        intervalLength: intervalConfig.intervalLength,
      })
      authorizeSubscriptionId = subscriptionResult.subscriptionId
    } catch (error) {
      console.error("Error creating subscription:", error)
      throw error
    }

    // Create subscription in database
    const subscription = await subscriptionService.createSubscriptions({
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
      authorize_subscription_id: authorizeSubscriptionId,
      authorize_customer_profile_id: customerProfileId,
      authorize_payment_profile_id: paymentProfileId,
    })

    return new StepResponse(subscription, subscription[0].id)
  },
  async (subscriptionId, { container }) => {
    const subscriptionService: SubscriptionService = container.resolve(SUBSCRIPTION_MODULE)
    await subscriptionService.deleteSubscriptions(subscriptionId as string)
  }
)
