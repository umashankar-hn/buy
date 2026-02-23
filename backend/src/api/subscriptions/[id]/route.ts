import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SUBSCRIPTION_MODULE } from "../../../modules/subscription"
import SubscriptionService from "../../../modules/subscription/service"
import { cancelSubscriptionWorkflow } from "../../../workflows/subscription/cancel-subscription"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const subscriptionService: SubscriptionService = req.scope.resolve(SUBSCRIPTION_MODULE)

  const subscription = await subscriptionService.retrieveSubscription(req.params.id)

  res.json({ subscription })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { result } = await cancelSubscriptionWorkflow(req.scope).run({
    input: { subscription_id: req.params.id },
  })

  res.json({ subscription: result })
}
