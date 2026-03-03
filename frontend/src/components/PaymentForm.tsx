import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PaymentFormProps {
  onTokenGenerated: (token: string) => void
  loading?: boolean
}

declare global {
  interface Window {
    Accept: {
      dispatchData: (
        secureData: {
          authData: { clientKey: string; apiLoginID: string }
          cardData: {
            cardNumber: string
            month: string
            year: string
            cardCode: string
          }
        },
        callback: (response: {
          messages: { resultCode: string; message: Array<{ code: string; text: string }> }
          opaqueData?: { dataValue: string }
        }) => void
      ) => void
    }
  }
}

export function PaymentForm({ onTokenGenerated, loading }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [expMonth, setExpMonth] = useState('')
  const [expYear, setExpYear] = useState('')
  const [cvv, setCvv] = useState('')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    setProcessing(true)

    const authData = {
      clientKey: import.meta.env.VITE_AUTHORIZE_NET_CLIENT_KEY || '',
      apiLoginID: import.meta.env.VITE_AUTHORIZE_NET_API_LOGIN || '',
    }

    const cardData = {
      cardNumber: cardNumber.replace(/\s/g, ''),
      month: expMonth,
      year: expYear,
      cardCode: cvv,
    }

    const secureData = { authData, cardData }

    window.Accept.dispatchData(secureData, (response) => {
      setProcessing(false)

      if (response.messages.resultCode === 'Ok') {
        const token = response.opaqueData!.dataValue
        onTokenGenerated(token)
      } else {
        setError(response.messages.message[0].text)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Card Information */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Card Information</Label>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="4111 1111 1111 1111"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
                disabled={loading || processing}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expMonth">Month</Label>
                <Input
                  id="expMonth"
                  placeholder="12"
                  maxLength={2}
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                  required
                  disabled={loading || processing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expYear">Year</Label>
                <Input
                  id="expYear"
                  placeholder="2025"
                  maxLength={4}
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  required
                  disabled={loading || processing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  required
                  disabled={loading || processing}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || processing}
          >
            {processing ? 'Processing...' : loading ? 'Subscribing...' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
