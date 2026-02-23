import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SUBSCRIPTION_MODULE } from "../../modules/subscription"
import SubscriptionService from "../../modules/subscription/service"
import { createSubscriptionWorkflow } from "../../workflows/subscription/create-subscription"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const subscriptionService: SubscriptionService = req.scope.resolve(SUBSCRIPTION_MODULE)

  // In production, filter by authenticated customer_id from auth context
  const subscriptions = await subscriptionService.listSubscriptions({})

  res.json({ subscriptions })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { result } = await createSubscriptionWorkflow(req.scope).run({
    input: req.body,
  })

  res.json({ subscription: result })
}
