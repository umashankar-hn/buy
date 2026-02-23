import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateProductStep } from "./steps/update-product"

export const updateProductWorkflow = createWorkflow(
  "update-product",
  (input: { id: string; name?: string; description?: string; price?: number; stock?: number }) => {
    const product = updateProductStep(input)
    return new WorkflowResponse(product)
  }
)
