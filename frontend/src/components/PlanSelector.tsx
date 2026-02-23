import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { subscriptionsApi } from '@/lib/api'

const PLANS = [
  {
    id: 'basic-monthly',
    name: 'Basic Plan',
    amount: 999,
    currency: 'usd',
    billing_cycle: 'monthly' as const,
    description: 'Perfect for individuals',
  },
  {
    id: 'pro-monthly',
    name: 'Pro Plan',
    amount: 2999,
    currency: 'usd',
    billing_cycle: 'monthly' as const,
    description: 'Best for professionals',
  },
  {
    id: 'enterprise-yearly',
    name: 'Enterprise Plan',
    amount: 29999,
    currency: 'usd',
    billing_cycle: 'yearly' as const,
    description: 'For large teams',
  },
]

export function PlanSelector({ onSubscribed }: { onSubscribed: () => void }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSubscribe = async (plan: typeof PLANS[0]) => {
    setLoading(plan.id)
    setError('')

    try {
      await subscriptionsApi.create({
        plan_id: plan.id,
        plan_name: plan.name,
        amount: plan.amount,
        currency: plan.currency,
        billing_cycle: plan.billing_cycle,
      })
      onSubscribed()
    } catch (err: any) {
      setError(err.message || 'Failed to create subscription')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Choose a Plan</h2>
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
          {error}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${(plan.amount / 100).toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">
                  /{plan.billing_cycle === 'yearly' ? 'year' : 'month'}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleSubscribe(plan)}
                disabled={loading !== null}
              >
                {loading === plan.id ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
