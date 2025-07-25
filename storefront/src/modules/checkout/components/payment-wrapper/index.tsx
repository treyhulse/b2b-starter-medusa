"use client"

import { isPaypal, isStripe } from "@/lib/constants"
import { B2BCart } from "@/types"
import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import { loadStripe } from "@stripe/stripe-js"
import React, { createContext } from "react"
import StripeWrapper from "./stripe-wrapper"

type WrapperProps = {
  cart: B2BCart
  children: React.ReactNode
}

export const StripeContext = createContext(false)

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

const Wrapper: React.FC<WrapperProps> = ({ cart, children }) => {
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  // Debug logging
  console.log('[PaymentWrapper] Debug info:', {
    hasPaymentSession: !!paymentSession,
    paymentSessionProvider: paymentSession?.provider_id,
    isStripeProvider: isStripe(paymentSession?.provider_id),
    hasStripeKey: !!stripeKey,
    hasStripePromise: !!stripePromise,
    cartId: cart.id,
    paymentCollectionId: cart.payment_collection?.id
  })

  if (
    isStripe(paymentSession?.provider_id) &&
    paymentSession &&
    stripePromise &&
    stripeKey
  ) {
    console.log('[PaymentWrapper] Initializing Stripe wrapper')
    return (
      <StripeContext.Provider value={true}>
        <StripeWrapper
          paymentSession={paymentSession}
          stripeKey={stripeKey}
          stripePromise={stripePromise}
        >
          {children}
        </StripeWrapper>
      </StripeContext.Provider>
    )
  }

  if (
    isPaypal(paymentSession?.provider_id) &&
    paypalClientId !== undefined &&
    cart
  ) {
    console.log('[PaymentWrapper] Initializing PayPal wrapper')
    return (
      <PayPalScriptProvider
        options={{
          "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
          currency: cart?.currency_code.toUpperCase(),
          intent: "authorize",
          components: "buttons",
        }}
      >
        {children}
      </PayPalScriptProvider>
    )
  }

  // If no payment session or provider not supported, render without wrapper
  console.log('[PaymentWrapper] No payment wrapper needed, rendering children directly')
  return <div>{children}</div>
}

export default Wrapper
