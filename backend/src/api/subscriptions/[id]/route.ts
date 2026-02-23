import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SUBSCRIPTION_MODULE } from "../../../modules/subscription"
import SubscriptionService from "../../../modules/subscription/service"
import { cancelSubscriptionWorkflow } from "../../../workflows/subscription/cancel-subscription"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const auth = (req as any).auth

  if (!auth?.customerId) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    })
  }

  const subscriptionService: SubscriptionService = req.scope.resolve(SUBSCRIPTION_MODULE)

  const subscription = await subscriptionService.retrieveSubscription(req.params.id)

  if (subscription.customer_id !== auth.customerId) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Access denied",
    })
  }

  res.json({ subscription })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const auth = (req as any).auth

  if (!auth?.customerId) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    })
  }

  const subscriptionService: SubscriptionService = req.scope.resolve(SUBSCRIPTION_MODULE)

  const subscription = await subscriptionService.retrieveSubscription(req.params.id)

  if (subscription.customer_id !== auth.customerId) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Access denied",
    })
  }

  const { result } = await cancelSubscriptionWorkflow(req.scope).run({
    input: { subscription_id: req.params.id },
  })

  res.json({ subscription: result })
}
