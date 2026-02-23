import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CUSTOM_PRODUCT_MODULE } from "../../../modules/custom-product";
import CustomProductService from "../../../modules/custom-product/service";
import { updateProductWorkflow } from "../../../workflows/custom-product/update-product";
import { deleteProductWorkflow } from "../../../workflows/custom-product/delete-product";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productService: CustomProductService = req.scope.resolve(CUSTOM_PRODUCT_MODULE)
  const product = await productService.retrieveProduct(req.params.id)
  res.json({ product })
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const { result } = await updateProductWorkflow(req.scope).run({
    input: { id: req.params.id, ...req.body },
  })
  res.json({ product: result })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  await deleteProductWorkflow(req.scope).run({
    input: req.params.id,
  })
  res.json({ success: true })
}
