import { ProductDTO } from "@medusajs/framework/types"

export type NetSuiteProduct = {
  id?: string
  itemId: string
  displayName: string
  description?: string
  isInactive?: boolean
  basePrice?: number
  [key: string]: any
}

export type MedusaProduct = ProductDTO

/**
 * Maps a Medusa product to NetSuite format
 */
export function mapMedusaToNetSuite(medusaProduct: MedusaProduct): NetSuiteProduct {
  return {
    itemId: medusaProduct.handle || medusaProduct.id,
    displayName: medusaProduct.title,
    description: medusaProduct.description || undefined,
    isInactive: medusaProduct.status !== 'published',
    basePrice: undefined, // Price will be handled separately in price sync
    // Add any additional mapping as needed
    metadata: {
      medusa_id: medusaProduct.id,
      medusa_handle: medusaProduct.handle,
      medusa_status: medusaProduct.status,
      synced_at: new Date().toISOString(),
    },
  }
}

/**
 * Maps a NetSuite SuiteQL row to Medusa product and inventory format
 * Returns: { product, inventory: [{ location, quantity }] }
 */
export function mapNetSuiteToMedusa(ns: any): { product: Partial<MedusaProduct>, inventory: { location: string, quantity: number } } {
  return {
    product: {
      title: ns.display_name,
      handle: ns.item_name,
      metadata: {
        netsuite_id: ns.item_id,
      },
    },
    inventory: {
      location: ns.location,
      quantity: Number(ns.quantity_on_hand) || 0,
    },
  }
}

/**
 * Sync configuration for products
 */
export type ProductSyncConfig = {
  // Which fields to sync from Medusa to NetSuite
  syncFields: {
    title: boolean
    description: boolean
    status: boolean
    handle: boolean
    price: boolean
  }
  // Batch size for sync operations
  batchSize: number
  // Whether to create new products in NetSuite if they don't exist
  createMissing: boolean
  // Whether to update existing products in NetSuite
  updateExisting: boolean
}

/**
 * Default sync configuration
 */
export const defaultProductSyncConfig: ProductSyncConfig = {
  syncFields: {
    title: true,
    description: true,
    status: true,
    handle: true,
    price: true,
  },
  batchSize: 50,
  createMissing: true,
  updateExisting: true,
} 