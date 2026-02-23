import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deleteProductStep } from "./steps/delete-product"

export const deleteProductWorkflow = createWorkflow(
  "delete-product",
  (id: string) => {
    const result = deleteProductStep(id)
    return new WorkflowResponse(result)
  }
)
