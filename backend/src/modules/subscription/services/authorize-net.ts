import axios from "axios"

export interface AuthorizeNetConfig {
  apiLogin: string
  transactionKey: string
  environment: "sandbox" | "production"
}

export interface CreateCustomerProfileRequest {
  email: string
  paymentToken: string // Opaque Data token from Accept.js
}

export interface CreateSubscriptionRequest {
  customerProfileId: string
  customerPaymentProfileId: string
  planId: string
  amount: number
  interval: "months" | "weeks" | "days"
  intervalLength: number
  startDate?: string
}

export interface CancelSubscriptionRequest {
  subscriptionId: string
}

export class AuthorizeNetService {
  private apiLogin: string
  private transactionKey: string
  private baseUrl: string

  constructor() {
    this.apiLogin = process.env.AUTHORIZE_NET_API_LOGIN || ""
    this.transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY || ""
    this.baseUrl = process.env.AUTHORIZE_NET_ENVIRONMENT === "production"
      ? "https://api.authorize.net"
      : "https://apitest.authorize.net"
  }

  private getAuthHeader(): string {
    return Buffer.from(`${this.apiLogin}:${this.transactionKey}`).toString("base64")
  }

  async createCustomerProfile(request: CreateCustomerProfileRequest) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/xml/v1/request.api`,
        {
          createCustomerProfileRequest: {
            merchantAuthentication: {
              name: this.apiLogin,
              transactionKey: this.transactionKey,
            },
            profile: {
              merchantCustomerId: request.email,
              email: request.email,
              paymentProfiles: {
                customerType: "individual",
                payment: {
                  opaqueData: {
                    dataDescriptor: "COMMON.ACCEPT.INAPP.PAYMENT",
                    dataValue: request.paymentToken,
                  },
                },
              },
            },
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      const result = response.data.createCustomerProfileResponse

      if (result.messages.resultCode === "Ok") {
        return {
          success: true,
          customerProfileId: result.customerProfileId,
          customerPaymentProfileId: result.customerPaymentProfileIdList.numericString[0],
        }
      } else {
        throw new Error(result.messages.message[0].text)
      }
    } catch (error: any) {
      throw new Error(`Failed to create customer profile: ${error.message}`)
    }
  }

  async createSubscription(request: CreateSubscriptionRequest) {
    try {
      const startDate = request.startDate || new Date().toISOString().split("T")[0]

      const response = await axios.post(
        `${this.baseUrl}/xml/v1/request.api`,
        {
          createSubscriptionRequest: {
            merchantAuthentication: {
              name: this.apiLogin,
              transactionKey: this.transactionKey,
            },
            subscription: {
              name: request.planId,
              paymentSchedule: {
                interval: {
                  length: request.intervalLength,
                  unit: request.interval,
                },
                startDate: startDate,
                totalOccurrences: 9999,
              },
              amount: request.amount,
              profile: {
                customerProfileId: request.customerProfileId,
                customerPaymentProfileId: request.customerPaymentProfileId,
              },
            },
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      const result = response.data.createSubscriptionResponse

      if (result.messages.resultCode === "Ok") {
        return {
          success: true,
          subscriptionId: result.subscriptionId,
          status: result.subscriptionStatus,
        }
      } else {
        throw new Error(result.messages.message[0].text)
      }
    } catch (error: any) {
      throw new Error(`Failed to create subscription: ${error.message}`)
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/xml/v1/request.api`,
        {
          cancelSubscriptionRequest: {
            merchantAuthentication: {
              name: this.apiLogin,
              transactionKey: this.transactionKey,
            },
            subscriptionId,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      const result = response.data.cancelSubscriptionResponse

      if (result.messages.resultCode === "Ok") {
        return { success: true }
      } else {
        throw new Error(result.messages.message[0].text)
      }
    } catch (error: any) {
      throw new Error(`Failed to cancel subscription: ${error.message}`)
    }
  }

  async getSubscription(subscriptionId: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/xml/v1/request.api`,
        {
          getSubscriptionRequest: {
            merchantAuthentication: {
              name: this.apiLogin,
              transactionKey: this.transactionKey,
            },
            subscriptionId,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      const result = response.data.getSubscriptionResponse

      if (result.messages.resultCode === "Ok") {
        return {
          success: true,
          subscription: {
            id: result.subscription.id,
            status: result.subscription.status,
            amount: result.subscription.amount,
            nextBillingDate: result.subscription.nextBillingDate,
            profile: {
              customerProfileId: result.subscription.profile.customerProfileId,
              customerPaymentProfileId: result.subscription.profile.customerPaymentProfileId,
            },
          },
        }
      } else {
        throw new Error(result.messages.message[0].text)
      }
    } catch (error: any) {
      throw new Error(`Failed to get subscription: ${error.message}`)
    }
  }
}

export default AuthorizeNetService
