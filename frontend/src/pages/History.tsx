import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { subscriptionsApi, type Subscription } from '@/lib/api'

export default function History() {
  const navigate = useNavigate()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const { subscriptions } = await subscriptionsApi.list()
        setSubscriptions(subscriptions)
      } catch (err: any) {
        console.error('Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600'
      case 'canceled':
        return 'text-red-600'
      case 'past_due':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Subscription History</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">Error: {error}</p>
            ) : subscriptions.length === 0 ? (
              <p className="text-muted-foreground">No subscriptions yet.</p>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">{sub.plan_name}</p>
                        <p className="text-muted-foreground">
                          ${(sub.amount / 100).toFixed(2)} {sub.currency.toUpperCase()} / {sub.billing_cycle}
                        </p>
                      </div>
                      <span className={`text-sm font-medium ${getStatusColor(sub.status)}`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground space-y-1">
                      <p>Started: {new Date(sub.created_at).toLocaleDateString()}</p>
                      {sub.status === 'active' && (
                        <p>Next billing: {new Date(sub.next_billing_date).toLocaleDateString()}</p>
                      )}
                      {sub.canceled_at && (
                        <p>Canceled: {new Date(sub.canceled_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
