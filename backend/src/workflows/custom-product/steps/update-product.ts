import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CUSTOM_PRODUCT_MODULE } from "../../../modules/custom-product"
import CustomProductService from "../../../modules/custom-product/service"

export const updateProductStep = createStep(
  "update-product-step",
  async (input: { id: string; name?: string; description?: string; price?: number; stock?: number }, { container }) => {
    const productService: CustomProductService = container.resolve(CUSTOM_PRODUCT_MODULE)
    
    const { id, ...updateData } = input
    const product = await productService.updateProducts([{
      selector: { id },
      data: updateData
    }])
    
    return new StepResponse(product[0])
  }
)
