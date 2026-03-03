import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { subscriptionsApi } from '@/lib/api'
import { PaymentForm } from './PaymentForm'

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
   const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    setSelectedPlan(plan)
    setError('')
  }

  const handleTokenGenerated = async (paymentToken: string) => {
    if (!selectedPlan) return

    setLoading(true)
    setError('')

    try {
      await subscriptionsApi.create({
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
        amount: selectedPlan.amount,
        currency: selectedPlan.currency,
        billing_cycle: selectedPlan.billing_cycle,
        payment_token: paymentToken,
      })
      onSubscribed()
    } catch (err: any) {
      setError(err.message || 'Failed to create subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setSelectedPlan(null)
    setError('')
  }

  if (selectedPlan) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Complete Payment</h2>
          <Button variant="outline" onClick={handleBack} disabled={loading}>
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedPlan.name}</CardTitle>
            <CardDescription>{selectedPlan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(selectedPlan.amount / 100).toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">
                /{selectedPlan.billing_cycle === 'yearly' ? 'year' : 'month'}
              </span>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <PaymentForm onTokenGenerated={handleTokenGenerated} loading={loading} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Choose a Plan</h2>
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
                onClick={() => handleSelectPlan(plan)}
                disabled={loading}
              >
                Select Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
