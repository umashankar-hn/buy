import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SUBSCRIPTION_MODULE } from "../../modules/subscription"
import SubscriptionService from "../../modules/subscription/service"
import { createSubscriptionWorkflow } from "../../workflows/subscription/create-subscription"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const auth = (req as any).auth

  if (!auth?.customerId) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    })
  }

  const subscriptionService: SubscriptionService = req.scope.resolve(SUBSCRIPTION_MODULE)

  const subscriptions = await subscriptionService.listSubscriptions({
    customer_id: auth.customerId,
  })

  res.json({ subscriptions })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const auth = (req as any).auth

  if (!auth?.customerId) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    })
  }

  const { result } = await createSubscriptionWorkflow(req.scope).run({
    input: {
      ...req.body,
      customer_id: auth.customerId,
      email: auth.email,
    },
  })

  res.json({ subscription: result })
}
