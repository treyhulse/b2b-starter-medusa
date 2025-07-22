import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { NETSUITE_MODULE } from "../../../../modules/netsuite"
import NetSuiteModuleService from "../../../../modules/netsuite/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const netSuiteModuleService: NetSuiteModuleService = req.scope.resolve(NETSUITE_MODULE)
    
    // Test the connection
    const isConnected = await netSuiteModuleService.testConnection()
    
    if (isConnected) {
      res.send({
        message: "NetSuite connection successful",
        status: "connected",
        config: netSuiteModuleService.getConfig(),
      })
    } else {
      res.status(500).send({
        message: "NetSuite connection failed",
        status: "failed",
      })
    }
  } catch (error) {
    console.error("NetSuite connection test failed:", error)
    
    res.status(500).send({
      message: "NetSuite connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      status: "failed",
    })
  }
} 