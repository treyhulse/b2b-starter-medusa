/**
 * NetSuite REST API Integration Service
 *
 * This service provides methods to interact with NetSuite's SuiteTalk REST API using OAuth 1.0a Token-Based Authentication (TBA).
 *
 * -----------------------------
 * **Authentication Requirements:**
 * -----------------------------
 * NetSuite REST and Restlet APIs require OAuth 1.0a (Token-Based Authentication), NOT OAuth 2.0.
 *
 * You must create a NetSuite Integration Record (Setup > Integrations > Manage Integrations) and enable Token-Based Authentication (TBA).
 *
 * You must generate an Access Token for a user/role with Web Services and TBA permissions (Setup > Users/Roles > Access Tokens).
 *
 * The following environment variables are required:
 *
 *   NETSUITE_REALM        - Your NetSuite account realm (usually same as account ID)
 *   NETSUITE_CONSUMER_KEY - Consumer Key from the Integration Record
 *   NETSUITE_CONSUMER_SECRET - Consumer Secret from the Integration Record
 *   NETSUITE_TOKEN_ID     - Token ID from the Access Token
 *   NETSUITE_TOKEN_SECRET - Token Secret from the Access Token
 *
 * The OAuth 1.0a signature is generated for every request using HMAC-SHA256, and all parameters must be included in the signature base string.
 *
 * -----------------------------
 * **SuiteQL Requirements:**
 * -----------------------------
 * - All SuiteQL requests to /services/rest/query/v1/suiteql must include the header: Prefer: transient
 *
 * -----------------------------
 * **Common Pitfalls:**
 * -----------------------------
 * - The realm in the OAuth header MUST match your NetSuite account ID/realm.
 * - All endpoints are case-sensitive (e.g., /inventoryItem not /inventoryitem).
 * - The user/role for the token must have Web Services and TBA permissions.
 * - If you get INVALID_LOGIN, check the Login Audit Trail in NetSuite for details.
 * - All values must be percent-encoded and quoted in the OAuth header.
 *
 * -----------------------------
 * **Debugging:**
 * -----------------------------
 * This service logs the OAuth header (with secrets redacted) and the request URL for every request.
 *
 * If you get 401 Unauthorized, check:
 *   - The OAuth header (realm, keys, signature)
 *   - The endpoint case and path
 *   - The Login Audit Trail in NetSuite
 *   - That your .env values are correct and have no extra spaces
 *
 * For more details, see NetSuite's REST API and TBA documentation.
 */

import axios, { AxiosInstance } from "axios"
import crypto from "crypto"

export type NetSuiteOptions = {
  consumerKey: string
  consumerSecret: string
  tokenId: string // OAuth token
  tokenSecret: string
  realm: string
  baseUrl?: string
}

type NetSuiteProduct = {
  id: string
  itemId: string
  displayName: string
  description?: string
  isInactive?: boolean
  [key: string]: any
}

type NetSuiteProductResponse = {
  success: boolean
  data?: NetSuiteProduct[]
  error?: string
}

function getOAuth1Header({
  method,
  url,
  consumerKey,
  consumerSecret,
  tokenId,
  tokenSecret,
  realm,
}: {
  method: string
  url: string
  consumerKey: string
  consumerSecret: string
  tokenId: string
  tokenSecret: string
  realm: string
}) {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = crypto.randomBytes(8).toString("hex")
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_token: tokenId,
    oauth_signature_method: "HMAC-SHA256",
    oauth_timestamp: timestamp,
    oauth_nonce: nonce,
    oauth_version: "1.0",
  }
  // Collect all params for signature base string
  const urlObj = new URL(url)
  const allParams = { ...oauthParams }
  urlObj.searchParams.forEach((value, key) => {
    allParams[key] = value
  })
  const paramString = Object.keys(allParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`)
    .join("&")
  const baseString = `${method.toUpperCase()}&${encodeURIComponent(urlObj.origin + urlObj.pathname)}&${encodeURIComponent(paramString)}`
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`
  const signature = crypto.createHmac("sha256", signingKey).update(baseString).digest("base64")
  const encodedSig = encodeURIComponent(signature)
  // Build OAuth header
  const authHeader =
    `OAuth realm="${realm}", ` +
    Object.entries({ ...oauthParams, oauth_signature: encodedSig })
      .map(([k, v]) => `${k}="${v}"`)
      .join(", ")
  return authHeader
}

/**
 * NetSuiteModuleService
 *
 * This class provides methods to interact with NetSuite's SuiteTalk REST API using OAuth 1.0a.
 * All requests are signed per NetSuite's requirements and use the credentials provided via environment variables.
 *
 * Example usage:
 *   const svc = new NetSuiteModuleService({}, { ...options });
 *   const products = await svc.getProducts(10, 0);
 *
 * See the top of this file for authentication and setup requirements.
 */
export default class NetSuiteModuleService {
  private client: AxiosInstance
  private options: NetSuiteOptions

  constructor({}, options: NetSuiteOptions) {
    this.options = {
      baseUrl: `https://${options.realm}.suitetalk.api.netsuite.com`,
      ...options,
    }
    this.client = axios.create({
      baseURL: this.options.baseUrl,
      timeout: 30000,
    })
  }

  /**
   * Get products from NetSuite using OAuth 1.0a
   */
  async getProducts(limit: number = 100, offset: number = 0): Promise<NetSuiteProductResponse> {
    try {
      // Use SuiteQL for product sync
      const suiteQL = `
        SELECT item.id AS id, item.itemid AS itemId, item.displayname AS displayName, item.description AS description, item.isinactive AS isInactive
        FROM item
        WHERE item.isinactive = 'F'
          AND item.itemtype IN ('InvtPart', 'Assembly', 'Kit')
          AND custitem_connector_flag_field = '1'
          AND item.id = '1123'
        ORDER BY item.id
        LIMIT ${limit} OFFSET ${offset}
      `
      const result = await this.querySuiteQL(suiteQL)
      if (!result.success || !result.data?.items) {
        return { success: false, error: result.error || 'No data returned' }
      }
      // NetSuite SuiteQL returns { count, hasMore, items: [...] }
      return {
        success: true,
        data: result.data.items,
      }
    } catch (error: any) {
      console.error("[NetSuite] Error fetching products via SuiteQL:", error?.response?.data || error)
      return {
        success: false,
        error: error?.response?.data?.title || error.message || "Unknown error",
      }
    }
  }

  /**
   * Test the connection to NetSuite
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log("[NetSuite] Testing connection...")
      // Try to fetch a single product to test the connection
      const result = await this.getProducts(1, 0)
      if (result.success) {
        console.log("[NetSuite] Connection test successful")
        return true
      } else {
        console.error("[NetSuite] Connection test failed:", result.error)
        return false
      }
    } catch (error) {
      console.error("[NetSuite] Connection test failed:", error)
      return false
    }
  }

  /**
   * Get module configuration
   */
  getConfig(): Partial<NetSuiteOptions> {
    return {
      baseUrl: this.options.baseUrl,
      realm: this.options.realm,
    }
  }

  /**
   * Query NetSuite SuiteQL endpoint
   */
  async querySuiteQL(query: string): Promise<any> {
    try {
      const endpoint = "/services/rest/query/v1/suiteql"
      const url = `${this.options.baseUrl}${endpoint}`
      const authHeader = getOAuth1Header({
        method: "POST",
        url,
        consumerKey: this.options.consumerKey,
        consumerSecret: this.options.consumerSecret,
        tokenId: this.options.tokenId,
        tokenSecret: this.options.tokenSecret,
        realm: this.options.realm,
      })
      console.log('[NetSuite][DEBUG] OAuth Header:', authHeader.replace(/(consumer_key|token|signature)="[^"]+"/g, '$1="[REDACTED]"'));
      console.log('[NetSuite][DEBUG] Request URL:', url);
      const response = await this.client.post(endpoint, { q: query }, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Prefer: "transient",
        },
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      console.error("[NetSuite] SuiteQL error:", error?.response?.data || error)
      return {
        success: false,
        error: error?.response?.data?.title || error.message || "Unknown error",
        details: error?.response?.data,
      }
    }
  }

  /**
   * Test SuiteQL query (example)
   */
  async testSuiteQLQuery(): Promise<any> {
    const testQuery = `
      SELECT item.id AS item_id, item.itemid AS item_name, item.displayname AS display_name, 
             inventorybalance.location AS location, inventorybalance.quantityonhand AS quantity_on_hand
      FROM item
      LEFT JOIN inventorybalance ON item.id = inventorybalance.item
      WHERE item.isinactive = 'F'
        AND item.itemtype IN ('InvtPart', 'Assembly', 'Kit')
        AND custitem_connector_flag_field = '1'
      ORDER BY item_id, location
    `
    return this.querySuiteQL(testQuery)
  }
} 