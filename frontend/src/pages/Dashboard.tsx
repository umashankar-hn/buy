import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authApi, subscriptionsApi, type Subscription } from '@/lib/api'
import { PlanSelector } from '@/components/PlanSelector'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [canceling, setCanceling] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      await authApi.me()

      const { subscriptions } = await subscriptionsApi.list()
      const active = subscriptions.find(s => s.status === 'active') || null
      setCurrentSubscription(active)
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return
    if (!confirm('Are you sure you want to cancel your subscription?')) return
    
    try {
      setCanceling(true)
      await subscriptionsApi.cancel(currentSubscription.id)
      await fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCanceling(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/history')}>
              History
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Logged in as: {user?.getUsername()}
            </p>
          </CardContent>
        </Card>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : currentSubscription ? (
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold">{currentSubscription.plan_name}</p>
                <p className="text-muted-foreground">
                  ${(currentSubscription.amount / 100).toFixed(2)} {currentSubscription.currency.toUpperCase()} / {currentSubscription.billing_cycle}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Next billing: {new Date(currentSubscription.next_billing_date).toLocaleDateString()}
                </p>
              </div>
              <Button 
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={canceling}
              >
                {canceling ? 'Canceling...' : 'Cancel Plan'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <PlanSelector onSubscribed={fetchData} />
        )}
      </div>
    </div>
  )
}
