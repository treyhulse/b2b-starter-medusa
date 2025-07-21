import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ALGOLIA_MODULE } from "../../../../modules/algolia"
import AlgoliaModuleService from "../../../../modules/algolia/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const algoliaModuleService: AlgoliaModuleService = req.scope.resolve(ALGOLIA_MODULE)
    
    // Test the connection
    await algoliaModuleService.testConnection()
    
    res.send({
      message: "Algolia connection successful",
      status: "connected",
    })
  } catch (error) {
    console.error("Algolia connection test failed:", error)
    
    res.status(500).send({
      message: "Algolia connection failed",
      error: error.message,
      status: "failed",
    })
  }
} 