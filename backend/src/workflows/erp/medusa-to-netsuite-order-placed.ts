import { createStep, StepResponse, createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

// --- Types ---
export type SyncOrderToNetsuiteInput = {
  order: {
    id: string
    customer: { id: string; email: string; metadata?: any }
    items: any[]
    summary?: { total?: number }
    shipping_address?: any
    [key: string]: any
  }
}

export type NetsuiteSyncResult = {
  netsuiteOrderId: string
  success: boolean
}

// --- Step: Sync order to NetSuite (prototype) ---
export const syncOrderToNetsuiteStep = createStep(
  "sync-order-to-netsuite",
  async (input: SyncOrderToNetsuiteInput) => {
    // Prototype: just return a fake NetSuite order ID
    const netsuiteOrderId = `netsuite-order-id-for-${input.order.id}`
    return new StepResponse<NetsuiteSyncResult>({
      netsuiteOrderId,
      success: true,
    })
  }
)

// --- Workflow: Medusa to NetSuite Order Placed ---
export const medusaToNetsuiteOrderPlaced = createWorkflow(
  {
    name: "medusa-to-netsuite-order-placed",
    store: true,
    retentionTime: 86400,
  },
  function (input: SyncOrderToNetsuiteInput) {
    const syncStep = syncOrderToNetsuiteStep(input)
    return new WorkflowResponse(syncStep)
  }
) 