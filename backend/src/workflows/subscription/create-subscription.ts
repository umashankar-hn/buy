import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { CreateSubscriptionInput, createSubscriptionStep } from "./steps/create-subscription"

export const createSubscriptionWorkflow = createWorkflow(
  "create-subscription",
  (input: CreateSubscriptionInput) => {
    const subscription = createSubscriptionStep(input)
    return new WorkflowResponse(subscription)
  }
)
