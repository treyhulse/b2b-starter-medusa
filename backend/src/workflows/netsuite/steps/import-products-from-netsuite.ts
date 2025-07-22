import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { NETSUITE_MODULE } from "../../../modules/netsuite"
import NetSuiteModuleService from "../../../modules/netsuite/service"
import { mapNetSuiteToMedusa } from "../../../modules/netsuite/schemas/product-sync"

/**
 * Input parameters for the NetSuite product import step
 */
export type ImportProductsFromNetSuiteStepInput = {
  /** Maximum number of products to import (default: 100) */
  limit?: number
  /** Number of products to skip for pagination (default: 0) */
  offset?: number
}

/**
 * Output structure for the NetSuite product import step
 * Contains product data and associated inventory information
 */
export type ImportProductsFromNetSuiteStepOutput = Array<{
  /** Medusa-compatible product data */
  product: any
  /** Array of inventory records for different locations */
  inventory: { location: string; quantity: number }[]
}>

/**
 * NetSuite Product Import Step
 * 
 * This step queries NetSuite's SuiteQL API to fetch product and inventory data,
 * then transforms it into a Medusa-compatible format. The step handles:
 * 
 * - Authentication with NetSuite via OAuth
 * - SuiteQL query execution for product data
 * - Data transformation and grouping by product
 * - Pagination support via limit/offset parameters
 * 
 * The SuiteQL query fetches:
 * - Product basic information (ID, name, display name)
 * - Inventory levels across different locations
 * - Only active products (isInactive = 'F')
 * - Products marked for connector sync (custitem_connector_flag_field = '1')
 * 
 * @example
 * ```typescript
 * const products = await importProductsFromNetSuiteStep({
 *   limit: 50,
 *   offset: 0
 * })
 * ```
 * 
 * @param input - Import configuration parameters
 * @param container - Medusa container for service resolution
 * 
 * @returns Promise<StepResponse<ImportProductsFromNetSuiteStepOutput>>
 * @throws Error if NetSuite API call fails or data transformation fails
 */
export const importProductsFromNetSuiteStep = createStep(
  "import-products-from-netsuite",
  async function (input: ImportProductsFromNetSuiteStepInput, { container }) {
    const { limit = 100, offset = 0 } = input
    
    console.log('[Workflow Step] importProductsFromNetSuiteStep START', { limit, offset })
    
    try {
      // Resolve NetSuite service from container for API access
      const netSuiteModuleService: NetSuiteModuleService = container.resolve(NETSUITE_MODULE)
      
      // SuiteQL query to fetch product and inventory data from NetSuite
      // This query joins the item table with inventorybalance to get location-specific inventory
      // Filters for active products that are marked for connector synchronization
      const suiteQL = `
        SELECT item.id AS item_id, item.itemid AS item_name, item.displayname AS display_name,
               inventorybalance.location AS location, inventorybalance.quantityonhand AS quantity_on_hand
        FROM item
        LEFT JOIN inventorybalance ON item.id = inventorybalance.item
        WHERE item.isinactive = 'F'
          AND item.itemtype IN ('InvtPart', 'Assembly', 'Kit')
          AND custitem_connector_flag_field = '1'
        ORDER BY item_id, location
      `
      
      // Execute SuiteQL query against NetSuite API
      const result = await netSuiteModuleService.querySuiteQL(suiteQL)
      
      // Handle case where no data is returned from NetSuite
      if (!result.success || !result.data?.items) {
        console.log('[Workflow Step] No data returned from NetSuite')
        return new StepResponse([])
      }
      
      console.log('[Workflow Step] NetSuite returned', result.data.items.length, 'items')
      
      // Apply pagination in JavaScript since SuiteQL doesn't support LIMIT/OFFSET
      // This allows for controlled batch processing of large datasets
      let items = result.data.items
      if (offset > 0) {
        items = items.slice(offset)
      }
      if (limit > 0) {
        items = items.slice(0, limit)
      }
      
      // Transform SuiteQL rows into structured product and inventory data
      // Group by item_id to handle multi-location inventory for the same product
      const grouped = items.reduce((acc, row) => {
        if (!acc[row.item_id]) acc[row.item_id] = []
        acc[row.item_id].push(row)
        return acc
      }, {} as Record<string, any[]>)

      // Process each product and its associated inventory locations
      const output: ImportProductsFromNetSuiteStepOutput = []
      for (const item_id of Object.keys(grouped)) {
        const rows = grouped[item_id]
        const first = rows[0] // Use first row for product data
        
        // Transform NetSuite data to Medusa format using mapping function
        const { product } = mapNetSuiteToMedusa(first)
        
        // Set external_id for Medusa upsert operations (used for deduplication)
        product.external_id = item_id
        
        // Collect all inventory records for this product across different locations
        const inventory = rows.map(row => ({
          location: row.location,
          quantity: Number(row.quantity_on_hand) || 0,
        }))
        
        output.push({ product, inventory })
      }
      
      console.log('[Workflow Step] Processed', output.length, 'products with inventory')
      return new StepResponse(output)
      
    } catch (error) {
      // Log and re-throw errors for proper error handling in the workflow
      console.error('[Workflow Step] importProductsFromNetSuiteStep ERROR', error)
      throw error
    }
  }
) 