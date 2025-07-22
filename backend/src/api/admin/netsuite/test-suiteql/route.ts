import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { NETSUITE_MODULE } from "../../../../modules/netsuite"
import NetSuiteModuleService from "../../../../modules/netsuite/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const netSuiteModuleService: NetSuiteModuleService = req.scope.resolve(NETSUITE_MODULE)

    // Run the test SuiteQL query
    const result = await netSuiteModuleService.testSuiteQLQuery()

    res.send(result)
  } catch (error) {
    console.error("NetSuite SuiteQL test failed:", error)
    res.status(500).send({
      message: "NetSuite SuiteQL test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
    })
  }
} 