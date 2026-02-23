import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createProductStep } from "./steps/create-product"

export const createProductWorkflow = createWorkflow(
  "create-product",
  (input: { name: string; description?: string; price: number; stock?: number }) => {
    const product = createProductStep(input)
    return new WorkflowResponse(product)
  }
)
