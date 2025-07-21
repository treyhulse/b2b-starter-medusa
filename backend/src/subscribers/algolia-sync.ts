import {
    SubscriberArgs,
    type SubscriberConfig,
  } from "@medusajs/framework"
  import { syncProductsWorkflow } from "../workflows/sync-products"
  
  export default async function algoliaSyncHandler({ 
    container,
  }: SubscriberArgs) {
    const logger = container.resolve("logger")
    
    let hasMore = true
    let offset = 0
    const limit = 50
    let totalIndexed = 0
    let totalProducts = 0
    let errors = 0
  
    logger.info("[Algolia Sync] Starting product indexing...")
    console.log('[Algolia Sync] Starting product indexing...')
  
    try {
      while (hasMore) {
        logger.info(`[Algolia Sync] Processing batch: offset=${offset}, limit=${limit}`)
        console.log(`[Algolia Sync] Processing batch: offset=${offset}, limit=${limit}`)
        
        const { result } = await syncProductsWorkflow(container)
          .run({
            input: {
              limit,
              offset,
            },
          })
  
        const { products, metadata, syncedCount, success } = result
        
        if (!success) {
          logger.error(`[Algolia Sync] Batch failed at offset=${offset}`)
          console.error(`[Algolia Sync] Batch failed at offset=${offset}`)
          errors++
        } else {
          totalIndexed += syncedCount
          totalProducts = metadata?.count ?? totalProducts
          
          logger.info(`[Algolia Sync] Batch completed: synced=${syncedCount}, total=${totalIndexed}`)
          console.log(`[Algolia Sync] Batch completed: synced=${syncedCount}, total=${totalIndexed}`)
        }
  
        hasMore = offset + limit < (metadata?.count ?? 0)
        offset += limit
      }
  
      if (errors > 0) {
        logger.warn(`[Algolia Sync] Completed with ${errors} errors. Total indexed: ${totalIndexed}`)
        console.warn(`[Algolia Sync] Completed with ${errors} errors. Total indexed: ${totalIndexed}`)
      } else {
        logger.info(`[Algolia Sync] Successfully indexed ${totalIndexed} products`)
        console.log(`[Algolia Sync] Successfully indexed ${totalIndexed} products`)
      }
    } catch (error) {
      logger.error(`[Algolia Sync] Fatal error: ${error.message}`)
      console.error(`[Algolia Sync] Fatal error:`, error)
      throw error
    }
  }
  
  export const config: SubscriberConfig = {
    event: "algolia.sync",
  }