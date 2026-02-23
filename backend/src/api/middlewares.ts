import { defineMiddlewares } from "@medusajs/framework/http"
import { cognitoAuthMiddleware } from "./middlewares/cognito-auth"
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"

const corsMiddleware = (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
  const allowedOrigins = (process.env.STORE_CORS || "").split(",")
  const origin = req.headers.origin || ""
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key")
  }
  
  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }
  
  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/subscriptions*",
      middlewares: [corsMiddleware, cognitoAuthMiddleware],
    },
    {
      matcher: "/me",
      middlewares: [corsMiddleware, cognitoAuthMiddleware],
    },
  ],
})
