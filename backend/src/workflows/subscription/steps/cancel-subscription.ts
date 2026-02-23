import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { SUBSCRIPTION_MODULE } from "../../../modules/subscription"
import SubscriptionService from "../../../modules/subscription/service"

export interface CancelSubscriptionInput {
  subscription_id: string
}

export const cancelSubscriptionStep = createStep(
  "cancel-subscription-step",
  async (input: CancelSubscriptionInput, { container }) => {
    const subscriptionService: SubscriptionService = container.resolve(SUBSCRIPTION_MODULE)

    // Update subscription status in database (no Authorize.Net)
    const updated = await subscriptionService.updateSubscriptions({
      id: input.subscription_id,
      status: "canceled",
      canceled_at: new Date(),
    })

    return new StepResponse(updated, input.subscription_id)
  },
  async (subscriptionId, { container }) => {
    // Rollback: reactivate subscription
    const subscriptionService: SubscriptionService = container.resolve(SUBSCRIPTION_MODULE)
    await subscriptionService.updateSubscriptions({
      id: subscriptionId as string,
      status: "active",
      canceled_at: null,
    })
  }
)
