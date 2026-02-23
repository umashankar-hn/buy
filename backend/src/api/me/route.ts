import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AuthContext } from "../../middlewares/cognito-auth"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const auth = (req as any).auth as AuthContext

  res.json({
    id: auth.customerId,
    cognitoId: auth.cognitoId,
    email: auth.email,
  })
}
