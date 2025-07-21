import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { medusaToNetsuiteOrderPlaced } from "../workflows/erp/medusa-to-netsuite-order-placed"

export default async function orderPlacedSyncToNetsuiteHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log('[NetSuite Sync Triggered] order.placed event for order:', data.id)

  // Use query.graph to fetch order with customer and items
  const query = container.resolve("query")
  const { data: [order] } = await query.graph({
    entity: "order",
    filters: { id: data.id },
    fields: [
      "*",
      "items.*",
      "summary.*",
      "shipping_address.*",
      "customer.id",
      "customer.email",
      "customer.metadata"
    ],
  })

  try {
    await medusaToNetsuiteOrderPlaced(container).run({
      input: {
        order: {
          ...order,
          items: order.items || [],
          summary: { total: (order.summary && (order.summary as any).total) || 0 },
          customer: {
            id: (order.customer?.id as string) || '',
            email: (order.customer?.email as string) || '',
            metadata: order.customer?.metadata || {},
          },
        },
      },
    })
  } catch (error) {
    console.error('Error syncing order to NetSuite:', error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}