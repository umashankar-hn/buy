import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { cancelSubscriptionStep } from "../steps/cancel-subscription"

export const cancelSubscriptionWorkflow = createWorkflow(
  "cancel-subscription",
  (input: { subscription_id: string }) => {
    const subscription = cancelSubscriptionStep(input)
    return new WorkflowResponse(subscription)
  }
)
