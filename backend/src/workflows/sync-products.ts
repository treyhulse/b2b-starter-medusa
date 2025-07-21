import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { ProductStatus } from "@medusajs/framework/utils"
import { syncProductsStep, SyncProductsStepInput } from "./steps/sync-products"

type SyncProductsWorkflowInput = {
  limit?: number
  offset?: number
}

type SyncProductsWorkflowOutput = {
  products: any[]
  metadata: any
  syncedCount: number
  success: boolean
}

export const syncProductsWorkflow = createWorkflow(
  {
    name: "sync-products",
    store: true,
    retentionTime: 86400, // 24 hours
  },
  function ({ limit, offset }: SyncProductsWorkflowInput) {
    console.log('[Workflow] syncProductsWorkflow START', { limit, offset })
    
    try {
      const result: any = useQueryGraphStep({
        entity: "product",
        fields: ["id", "title", "description", "handle", "thumbnail"],
        pagination: {
          take: limit || 100,
          skip: offset || 0,
        },
        filters: {
          status: ProductStatus.PUBLISHED as any,
        },
      })

      const { data, metadata } = result
      
      console.log('[Workflow] Found products to sync:', { 
        count: data?.length || 0, 
        total: metadata?.count || 0,
        offset: offset || 0,
        limit: limit || 100
      })

      if (!data || data.length === 0) {
        console.log('[Workflow] No products found to sync')
        return new WorkflowResponse<SyncProductsWorkflowOutput>({
          products: [],
          metadata,
          syncedCount: 0,
          success: true,
        })
      }

      const syncResult = syncProductsStep({
        products: data,
      } as SyncProductsStepInput)

      const output = {
        products: data,
        metadata,
        syncedCount: data.length,
        success: true,
      }
      
      console.log('[Workflow] syncProductsWorkflow SUCCESS', {
        syncedCount: output.syncedCount,
        totalProducts: metadata?.count || 0
      })
      
      return new WorkflowResponse<SyncProductsWorkflowOutput>(output)
    } catch (error) {
      console.error('[Workflow] syncProductsWorkflow ERROR', error)
      
      return new WorkflowResponse<SyncProductsWorkflowOutput>({
        products: [],
        metadata: {},
        syncedCount: 0,
        success: false,
      })
    }
  }
)