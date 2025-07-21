"use client"

import React, { useState, useRef } from "react"
import Link from "next/link"
import { searchProducts } from "@/lib/data/search"

interface Product {
  id: string
  title: string
  thumbnail?: string
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (value.trim().length === 0) {
      setResults([])
      setShowDropdown(false)
      return
    }
    setLoading(true)
    timeoutRef.current = setTimeout(async () => {
      try {
        const products = await searchProducts(value)
        setResults(products)
        setShowDropdown(products.length > 0)
      } catch {
        setResults([])
        setShowDropdown(false)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  return (
    <div className="relative w-full max-w-xs">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search for products"
        className="bg-gray-100 text-zinc-900 px-4 py-2 rounded-full pr-10 shadow-borders-base w-full focus:outline-none focus:ring-2 focus:ring-primary"
        onFocus={() => { if (results.length > 0) setShowDropdown(true) }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />
      {loading && (
        <div className="absolute right-3 top-2.5 h-4 w-4 animate-spin border-2 border-gray-400 border-t-transparent rounded-full" />
      )}
      {showDropdown && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              {product.thumbnail && (
                <img src={product.thumbnail} alt={product.title} className="w-8 h-8 object-cover rounded" />
              )}
              <span>{product.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar
