import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { SUBSCRIPTION_MODULE } from "../../../modules/subscription"
import SubscriptionService from "../../../modules/subscription/service"
import AuthorizeNetService from "../../../modules/subscription/services/authorize-net"

export interface CancelSubscriptionInput {
  subscription_id: string
}

export const cancelSubscriptionStep = createStep(
  "cancel-subscription-step",
  async (input: CancelSubscriptionInput, { container }) => {
    const subscriptionService: SubscriptionService = container.resolve(SUBSCRIPTION_MODULE)
    const authorizeNet = new AuthorizeNetService()

    // Get subscription from database
    const subscription = await subscriptionService.retrieveSubscription(input.subscription_id)

    // Cancel in Authorize.net
    if (subscription.authorize_subscription_id) {
      try {
        await authorizeNet.cancelSubscription(subscription.authorize_subscription_id)
      } catch (error) {
        console.error("Error canceling subscription in Authorize.net:", error)
      }
    }

    // Update subscription status in database
    const updated = await subscriptionService.updateSubscriptions({
      id: input.subscription_id,
      status: "canceled",
      canceled_at: new Date(),
    })

    return new StepResponse(updated, input.subscription_id)
  },
  async (subscriptionId, { container }) => {
    // Rollback: reactivate subscription in Authorize.net
    // This is complex - in production, you might want to prevent cancellation
    // or have a separate reactivation workflow
  }
)
