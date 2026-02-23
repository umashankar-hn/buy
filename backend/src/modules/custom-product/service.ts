import { MedusaService } from "@medusajs/framework/utils"
import Product from "./models/product"

class CustomProductService extends MedusaService({
  Product,
}){}

export default CustomProductService
