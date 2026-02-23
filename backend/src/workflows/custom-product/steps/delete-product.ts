import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CUSTOM_PRODUCT_MODULE } from "../../../modules/custom-product"
import CustomProductService from "../../../modules/custom-product/service"

export const deleteProductStep = createStep(
  "delete-product-step",
  async (id: string, { container }) => {
    const productService: CustomProductService = container.resolve(CUSTOM_PRODUCT_MODULE)
    
    await productService.deleteProducts(id)
    
    return new StepResponse({ id })
  }
)
