import { sdk } from "@/lib/config"

export interface SearchProduct {
  id: string
  title: string
  thumbnail?: string
}

export const searchProducts = async (query: string): Promise<SearchProduct[]> => {
  return sdk.client
    .fetch<{ products: SearchProduct[] }>(`/store/search`, {
      method: "GET",
      query: { q: query },
      credentials: "include",
      cache: "no-cache",
    })
    .then(({ products }) => products || [])
} 