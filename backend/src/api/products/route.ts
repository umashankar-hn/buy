import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CUSTOM_PRODUCT_MODULE } from "../../modules/custom-product";
import CustomProductService from "../../modules/custom-product/service";
import { createProductWorkflow } from "../../workflows/custom-product/create-product";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productService: CustomProductService = req.scope.resolve(CUSTOM_PRODUCT_MODULE)
  const products = await productService.listProducts()
  res.json({ products })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { result } = await createProductWorkflow(req.scope).run({
    input: req.body,
  })
  res.json({ product: result })
}
