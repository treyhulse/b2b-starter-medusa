import { algoliasearch, SearchClient } from "algoliasearch"

type AlgoliaOptions = {
  apiKey: string;
  appId: string;
  productIndexName: string;
}

export type AlgoliaIndexType = "product"

export default class AlgoliaModuleService {
  private client: SearchClient
  private options: AlgoliaOptions

  constructor({}, options: AlgoliaOptions) {
    // Validate required options
    if (!options.appId) {
      throw new Error("ALGOLIA_APP_ID is required")
    }
    if (!options.apiKey) {
      throw new Error("ALGOLIA_API_KEY is required")
    }
    if (!options.productIndexName) {
      throw new Error("ALGOLIA_PRODUCT_INDEX_NAME is required")
    }

    this.client = algoliasearch(options.appId, options.apiKey)
    this.options = options
  }

  async getIndexName(type: AlgoliaIndexType) {
    switch (type) {
      case "product":
        return this.options.productIndexName
      default:
        throw new Error(`Invalid index type: ${type}`)
    }
  }
  
  async indexData(data: Record<string, unknown>[], type: AlgoliaIndexType = "product") {
    try {
      const indexName = await this.getIndexName(type)
      
      console.log(`[Algolia] Indexing ${data.length} objects to index: ${indexName}`)
      
      const result = await this.client.saveObjects({
        indexName,
        objects: data.map((item) => ({
          ...item,
          // set the object ID to allow updating later
          objectID: item.id,
        })),
      })
      
      console.log(`[Algolia] Successfully indexed ${data.length} objects`)
      return result
    } catch (error) {
      console.error("[Algolia] Error indexing data:", error)
      
      // Provide more specific error messages
      if (error.message?.includes("Not enough rights")) {
        throw new Error(
          "Algolia API key doesn't have write permissions. Please use an Admin API key with 'addObject' permission."
        )
      }
      
      if (error.message?.includes("Invalid Application-Id")) {
        throw new Error("Invalid ALGOLIA_APP_ID. Please check your Algolia application ID.")
      }
      
      if (error.message?.includes("Invalid API key")) {
        throw new Error("Invalid ALGOLIA_API_KEY. Please check your Algolia API key.")
      }
      
      throw error
    }
  }

  async search(query: string, type: AlgoliaIndexType = "product") {
    try {
      const indexName = await this.getIndexName(type)
      return await this.client.search({
        requests: [
          {
            indexName,
            query,
          },
        ],
      })
    } catch (error) {
      console.error("[Algolia] Error searching:", error)
      throw error
    }
  }

  // Add a method to test the connection
  async testConnection() {
    try {
      const indexName = await this.getIndexName("product")
      
      // Try to search with empty query to test connection
      await this.client.search({
        requests: [
          {
            indexName,
            query: "",
            params: "hitsPerPage=0",
          },
        ],
      })
      
      console.log(`[Algolia] Successfully connected to index: ${indexName}`)
      return true
    } catch (error) {
      console.error("[Algolia] Connection test failed:", error)
      throw error
    }
  }
}


