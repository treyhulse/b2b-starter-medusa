"use client"

import { isStripe as isStripeFunc, paymentInfoMap } from "@/lib/constants"
import { initiatePaymentSession } from "@/lib/data/cart"
import ErrorMessage from "@/modules/checkout/components/error-message"
import PaymentContainer from "@/modules/checkout/components/payment-container"
import { StripeContext } from "@/modules/checkout/components/payment-wrapper"
import Button from "@/modules/common/components/button"
import Divider from "@/modules/common/components/divider"
import { ApprovalStatusType } from "@/types"
import { RadioGroup } from "@headlessui/react"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { Container, Heading, Text, clx } from "@medusajs/ui"
import { CardElement } from "@stripe/react-stripe-js"
import { StripeCardElementOptions } from "@stripe/stripe-js"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )
  const [paymentSessionCreated, setPaymentSessionCreated] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const cartApprovalStatus = cart.approval_status?.status

  const stripeReady = useContext(StripeContext)

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

  // Debug logging
  useEffect(() => {
    console.log('[Payment Component] Debug info:', {
      hasCart: !!cart,
      cartId: cart?.id,
      hasPaymentCollection: !!cart?.payment_collection,
      hasActiveSession: !!activeSession,
      activeSessionProvider: activeSession?.provider_id,
      availablePaymentMethods: availablePaymentMethods?.length || 0,
      paymentMethods: availablePaymentMethods?.map(p => p.id),
      stripeReady,
      isOpen,
      paymentReady,
      selectedPaymentMethod,
      cartApprovalStatus,
      paymentSessionCreated
    })
  }, [cart, activeSession, availablePaymentMethods, stripeReady, isOpen, paymentReady, selectedPaymentMethod, cartApprovalStatus, paymentSessionCreated])

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Inter, sans-serif",
          color: "#424270",
          "::placeholder": {
            color: "rgb(107 114 128)",
          },
        },
      },
      classes: {
        base: "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover transition-all duration-300 ease-in-out",
      },
    }
  }, [])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handlePaymentMethodSelect = async (value: string) => {
    console.log('[Payment Component] Payment method selected:', value)
    setSelectedPaymentMethod(value)
    setError(null)

    // If Stripe is selected and no active session exists, create one
    if (isStripeFunc(value) && !activeSession) {
      setIsLoading(true)
      try {
        console.log('[Payment Component] Creating payment session for Stripe')
        await initiatePaymentSession(cart, {
          provider_id: value,
        })
        setPaymentSessionCreated(true)
        console.log('[Payment Component] Payment session created successfully')
      } catch (err: any) {
        console.error('[Payment Component] Error creating payment session:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const shouldInputCard =
        isStripeFunc(selectedPaymentMethod) && !activeSession

      if (
        !activeSession ||
        activeSession.provider_id !== selectedPaymentMethod
      ) {
        console.log('[Payment Component] Initiating payment session for:', selectedPaymentMethod)
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
      }
    } catch (err: any) {
      console.error('[Payment Component] Error initiating payment session:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  // Show loading state while creating payment session
  if (isLoading) {
    return (
      <Container>
        <div className="flex flex-col gap-y-2">
          <Heading level="h2" className="flex flex-row text-xl gap-x-2 items-center">
            Payment Method
          </Heading>
          <Divider />
          <div className="flex items-center justify-center py-8">
            <Text>Setting up payment method...</Text>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="flex flex-col gap-y-2">
        <div className="flex flex-row items-center justify-between w-full">
          <Heading
            level="h2"
            className={clx("flex flex-row text-xl gap-x-2 items-center", {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            })}
          >
            Payment Method
            {!isOpen && paymentReady && <CheckCircleSolid />}
          </Heading>
          {!isOpen &&
            paymentReady &&
            cartApprovalStatus !== ApprovalStatusType.PENDING && (
              <Text>
                <button
                  onClick={handleEdit}
                  className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                  data-testid="edit-payment-button"
                >
                  Edit
                </button>
              </Text>
            )}
        </div>
        {(isOpen || (cart && paymentReady && activeSession)) && <Divider />}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && availablePaymentMethods?.length && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={handlePaymentMethodSelect}
              >
                {availablePaymentMethods
                  .sort((a, b) => {
                    return a.provider_id > b.provider_id ? 1 : -1
                  })
                  .map((paymentMethod) => {
                    return (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        key={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      />
                    )
                  })}
              </RadioGroup>
              
              {/* Show Stripe elements if Stripe is selected and ready */}
              {stripeReady && selectedPaymentMethod === "pp_stripe_stripe" && (
                <div className="mt-5 transition-all duration-150 ease-in-out">
                  <Text className="txt-medium-plus text-ui-fg-base mb-1">
                    Enter your card details:
                  </Text>

                  <CardElement
                    options={useOptions as StripeCardElementOptions}
                    onChange={(e) => {
                      setCardBrand(
                        e.brand &&
                          e.brand.charAt(0).toUpperCase() + e.brand.slice(1)
                      )
                      setError(e.error?.message || null)
                      setCardComplete(e.complete)
                    }}
                  />
                </div>
              )}
              
              {/* Show message if Stripe is selected but not ready */}
              {!stripeReady && selectedPaymentMethod === "pp_stripe_stripe" && (
                <div className="mt-5 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <Text className="text-yellow-800">
                    {!activeSession 
                      ? "Please wait while we set up your payment method..." 
                      : "Stripe is not ready. Please check your environment configuration."
                    }
                  </Text>
                </div>
              )}
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          )}

          <div className="flex flex-col gap-y-2 items-end">
            <ErrorMessage
              error={error}
              data-testid="payment-method-error-message"
            />

            <Button
              size="large"
              className="mt-6"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={
                (selectedPaymentMethod === "pp_stripe_stripe" &&
                  !cardComplete) ||
                (!selectedPaymentMethod && !paidByGiftcard)
              }
              data-testid="submit-payment-button"
            >
              {!activeSession && isStripeFunc(selectedPaymentMethod)
                ? " Enter card details"
                : "Next step"}
            </Button>
          </div>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex items-center gap-x-1 w-full pt-2">
              <div className="flex flex-col w-1/3">
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[selectedPaymentMethod]?.title ||
                    selectedPaymentMethod}
                </Text>
              </div>
              <div className="flex flex-col w-1/3">
                <div
                  className="flex gap-2 txt-medium text-ui-fg-subtle items-center"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text>
                    {isStripeFunc(selectedPaymentMethod) && cardBrand
                      ? cardBrand
                      : paymentInfoMap[selectedPaymentMethod]?.title}
                  </Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          ) : null}
        </div>
      </div>
    </Container>
  )
}

export default Payment
