import { MedusaService } from "@medusajs/framework/utils"
import Subscription from "./models/subscription"

class SubscriptionService extends MedusaService({
  Subscription,
}) {}

export default SubscriptionService
