import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { importProductsFromNetSuiteStep } from "../steps/import-products-from-netsuite"
import { createOrUpdateMedusaProductsStep } from "../steps/create-or-update-medusa-products"

/**
 * NetSuite to Medusa Product Synchronization Workflow
 * 
 * This workflow orchestrates the complete process of importing products from NetSuite
 * and creating/updating them in Medusa. It consists of two main steps:
 * 
 * 1. Import Products from NetSuite: Queries NetSuite SuiteQL API to fetch product data
 * 2. Create/Update Medusa Products: Processes the imported data and upserts products in Medusa
 * 
 * @example
 * ```typescript
 * const result = await importProductsFromNetSuiteWorkflow(scope).run({
 *   input: { limit: 10, offset: 0 }
 * })
 * ```
 * 
 * @param input - Workflow input parameters
 * @param input.limit - Maximum number of products to import (default: 100)
 * @param input.offset - Number of products to skip (for pagination)
 * 
 * @returns WorkflowResponse with sync results
 * @returns {number} importedCount - Number of newly created products
 * @returns {number} inventoryUpserts - Number of inventory records updated
 * @returns {number} totalProcessed - Total number of products processed
 * @returns {boolean} success - Whether the workflow completed successfully
 */
export const importProductsFromNetSuiteWorkflow = createWorkflow(
  {
    name: "sync-netsuite-products",
    store: true,
    retentionTime: 86400, // 24 hours - allows for workflow inspection and debugging
  },
  function (input) {
    // Step 1: Import products from NetSuite via SuiteQL
    // This step queries NetSuite's SuiteQL API to fetch product and inventory data
    // Returns: Array<{ product: MedusaProduct, inventory: InventoryData[] }>
    const netsuiteProducts = importProductsFromNetSuiteStep(input)
    
    // Step 2: Create or update products in Medusa
    // This step processes the imported data, creates new products or updates existing ones,
    // and manages inventory levels across different locations
    const result = createOrUpdateMedusaProductsStep(netsuiteProducts)
    
    // Return comprehensive sync results for monitoring and debugging
    return new WorkflowResponse({
      importedCount: result.createdCount,    // New products created
      inventoryUpserts: result.inventoryUpserts, // Inventory records updated
      totalProcessed: result.totalProcessed,     // Total products processed
      success: true,                             // Workflow completion status
    })
  }
) 