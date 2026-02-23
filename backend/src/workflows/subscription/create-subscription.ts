import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createSubscriptionStep } from "./steps/create-subscription"

export const createSubscriptionWorkflow = createWorkflow(
  "create-subscription",
  (input: {
    customer_id: string
    email: string
    plan_id: string
    plan_name: string
    amount: number
    currency: string
    billing_cycle: "monthly" | "yearly" | "weekly"
  }) => {
    const subscription = createSubscriptionStep(input)
    return new WorkflowResponse(subscription)
  }
)
