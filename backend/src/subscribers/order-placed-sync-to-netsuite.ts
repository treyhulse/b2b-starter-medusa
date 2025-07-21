import { Modules } from '@medusajs/framework/utils'
import { IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { medusaToNetsuiteOrderPlaced } from '../workflows/erp/medusa-to-netsuite-order-placed'

export default async function orderPlacedSyncToNetsuiteHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  console.log('[NetSuite Sync Triggered] order.placed event for order:', data.id)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })

  try {
    await medusaToNetsuiteOrderPlaced(container).run({
      input: { order },
    })
  } catch (error) {
    console.error('Error syncing order to NetSuite:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed',
} 