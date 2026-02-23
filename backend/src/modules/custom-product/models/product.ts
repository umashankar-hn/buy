import { model } from "@medusajs/framework/utils"

const Product = model.define("custom_product", {
  id: model.id().primaryKey(),
  name: model.text(),
  description: model.text().nullable(),
  price: model.number(),
  stock: model.number().default(0),
})

export default Product
