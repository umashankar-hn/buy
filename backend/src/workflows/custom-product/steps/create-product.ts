import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CUSTOM_PRODUCT_MODULE } from "../../../modules/custom-product"
import CustomProductService from "../../../modules/custom-product/service"

export const createProductStep = createStep(
  "create-product-step",
  async (input: { name: string; description?: string; price: number; stock?: number }, { container }) => {
    const productService: CustomProductService = container.resolve(CUSTOM_PRODUCT_MODULE)
    
    const product = await productService.createProducts(input)
    
    return new StepResponse(product, product.id)
  },
  async (productId, { container }) => {
    const productService: CustomProductService = container.resolve(CUSTOM_PRODUCT_MODULE)
    await productService.deleteProducts(productId as string)
  }
)
