import { MedusaRequest, MedusaResponse, MiddlewareFunction } from "@medusajs/framework/http"
import { CognitoJwtVerifier } from "aws-jwt-verify"
import { Modules, MedusaError } from "@medusajs/framework/utils"

const cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID || ""
const cognitoClientId = process.env.COGNITO_CLIENT_ID || ""

const verifier = CognitoJwtVerifier.create({
  userPoolId: cognitoUserPoolId,
  clientId: cognitoClientId,
  tokenUse: "id",
})

export interface AuthContext {
  cognitoId: string
  email: string
  customerId: string
}

export const cognitoAuthMiddleware: MiddlewareFunction = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "Missing authorization header"
      )
    }

    const token = authHeader.substring(7)

    let payload: any
    try {
      payload = await verifier.verify(token)
    } catch (err) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "Invalid or expired token"
      )
    }

    const customerService = req.scope.resolve(Modules.CUSTOMER)

    const customers = await customerService.listCustomers({
      email: payload.email,
    })

    let customerId: string
    if (customers.length > 0) {
      customerId = customers[0].id
    } else {
      const [customer] = await customerService.createCustomers([{
        email: payload.email,
        metadata: {
          cognito_sub: payload.sub,
        },
      }])
      customerId = customer.id
    };
    (req as any).auth = {
      cognitoId: payload.sub,
      email: payload.email,
      customerId,
    }

    next()
  } catch (error) {
    if (error instanceof MedusaError) {
      throw error
    }
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Authentication failed"
    )
  }
}
