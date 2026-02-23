import { getJwtToken } from "./cognito"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000"
class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

async function getHeaders(): Promise<HeadersInit> {
  const token = await getJwtToken()
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }))
    throw new ApiError(error.message || "An error occurred", response.status)
  }
  return response.json()
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: await getHeaders(),
    })
    return handleResponse<T>(response)
  },

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: await getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })
    return handleResponse<T>(response)
  },
}

export const authApi = {
  me: () => api.get<{ id: string; cognitoId: string; email: string }>("/me"),
}

export const subscriptionsApi = {
  list: () => api.get<{ subscriptions: Subscription[] }>("/subscriptions"),

  get: (id: string) =>
    api.get<{ subscription: Subscription }>(`/subscriptions/${id}`),

  create: (data: CreateSubscriptionInput) =>
    api.post<{ subscription: Subscription }>("/subscriptions", data),

  cancel: (id: string) =>
    api.post<{ subscription: Subscription }>(`/subscriptions/${id}`),
}

export interface Subscription {
  id: string
  customer_id: string
  plan_id: string
  plan_name: string
  status: "active" | "canceled" | "past_due" | "paused"
  amount: number
  currency: string
  billing_cycle: string
  current_period_start: string
  current_period_end: string
  next_billing_date: string
  authorize_subscription_id: string | null
  canceled_at: string | null
}

export interface CreateSubscriptionInput {
  plan_id: string
  plan_name: string
  amount: number
  currency: string
  billing_cycle: "monthly" | "yearly" | "weekly"
}
