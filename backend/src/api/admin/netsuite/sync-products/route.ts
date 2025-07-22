import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { importProductsFromNetSuiteWorkflow } from "../../../../workflows/netsuite/workflows"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { limit = 10, offset = 0 } = (req.body as any) || {}
    
    console.log('[NetSuite API] Manual product import triggered via SuiteQL:', {
      limit,
      offset,
    })

    const { result } = await importProductsFromNetSuiteWorkflow(req.scope)
      .run({
        input: {
          limit,
          offset,
        },
      })

    // Cast result to expected output type
    const workflowResult = result as {
      importedCount: number
      inventoryUpserts: number
      totalProcessed: number
      success: boolean
    }

    res.send({
      message: "Product import from NetSuite completed",
      result: {
        importedCount: workflowResult.importedCount,
        inventoryUpserts: workflowResult.inventoryUpserts,
        totalProcessed: workflowResult.totalProcessed,
        success: workflowResult.success,
      },
    })
  } catch (error) {
    console.error('[NetSuite API] Error in manual product import:', error)
    res.status(500).send({
      message: "Failed to import products from NetSuite",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
} 