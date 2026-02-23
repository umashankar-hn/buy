import CustomProductService from "./service"
import { Module } from "@medusajs/framework/utils"

export const CUSTOM_PRODUCT_MODULE = "customProduct"

export default Module(CUSTOM_PRODUCT_MODULE, {
  service: CustomProductService,
})
