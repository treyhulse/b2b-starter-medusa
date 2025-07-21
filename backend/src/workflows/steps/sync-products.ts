import { ProductDTO } from "@medusajs/framework/types"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ALGOLIA_MODULE } from "../../modules/algolia"
import AlgoliaModuleService from "../../modules/algolia/service"

export type SyncProductsStepInput = {
  products: ProductDTO[]
}

export const syncProductsStep = createStep(
  "sync-products",
  async ({ products }: SyncProductsStepInput, { container }) => {
    console.log('[Workflow Step] syncProductsStep START', { 
      productCount: products?.length || 0 
    })
    
    try {
      const algoliaModuleService: AlgoliaModuleService = container.resolve(ALGOLIA_MODULE)

      if (!products || products.length === 0) {
        console.log('[Workflow Step] syncProductsStep - No products to sync')
        return new StepResponse(undefined, {
          syncedProducts: [],
        })
      }

      // Index the products in Algolia
      await algoliaModuleService.indexData(
        products as unknown as Record<string, unknown>[], 
        "product"
      )

      const syncedProductIds = products.map((product) => product.id)
      console.log('[Workflow Step] syncProductsStep SUCCESS', { 
        syncedCount: syncedProductIds.length,
        productIds: syncedProductIds.slice(0, 5) // Log first 5 IDs for debugging
      })

      return new StepResponse(undefined, {
        syncedProducts: syncedProductIds,
      })
    } catch (error) {
      console.error('[Workflow Step] syncProductsStep ERROR', error)
      throw error
    }
  }
)