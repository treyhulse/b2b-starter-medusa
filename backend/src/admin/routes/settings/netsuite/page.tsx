import { Container, Heading, Button, toast, Textarea } from "@medusajs/ui"
import { useMutation } from "@tanstack/react-query"
import { sdk } from "../../../lib/sdk"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useState } from "react"

const NetSuitePage = () => {
  const { mutate: importProducts, isPending: isImporting } = useMutation({
    mutationFn: (data?: any) => 
      sdk.client.fetch("/admin/netsuite/sync-products", {
        method: "POST",
        body: data,
      }),
    onSuccess: (data: any) => {
      const result = data.result
      if (result.success) {
        toast.success(`Successfully imported ${result.importedCount} products from NetSuite`) 
      } else {
        toast.error(`Import completed with ${result.failedCount} failures`) 
      }
    },
    onError: (err) => {
      console.error(err)
      toast.error("Failed to import products from NetSuite") 
    },
  })

  const { mutate: testConnection, isPending: isTesting } = useMutation({
    mutationFn: () => 
      sdk.client.fetch("/admin/netsuite/test", {
        method: "GET",
      }),
    onSuccess: (data: any) => {
      if (data.status === "connected") {
        toast.success("NetSuite connection successful!") 
      } else {
        toast.error("NetSuite connection failed") 
      }
    },
    onError: (err) => {
      console.error(err)
      toast.error("Failed to test NetSuite connection") 
    },
  })

  const [suiteQLResult, setSuiteQLResult] = useState<any>(null)
  const { mutate: testSuiteQL, isPending: isTestingSuiteQL } = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/netsuite/test-suiteql", {
        method: "GET",
      }),
    onSuccess: (data: any) => {
      setSuiteQLResult(data)
      if (data.success) {
        toast.success("SuiteQL query successful!")
      } else {
        toast.error("SuiteQL query failed")
      }
    },
    onError: (err) => {
      setSuiteQLResult({ error: err?.message || "Unknown error" })
      toast.error("SuiteQL query failed")
    },
  })

  const handleImportAll = () => {
    importProducts({})
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">NetSuite ERP Integration</Heading>
      </div>
      
      <div className="px-6 py-8 space-y-6">
        {/* Connection Test */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Connection Test</h3>
          <p className="text-sm text-gray-600">
            Test your NetSuite connection before importing data.
          </p>
          <Button 
            variant="secondary"
            onClick={() => testConnection()}
            isLoading={isTesting}
          >
            Test NetSuite Connection
          </Button>
        </div>
        
        {/* Product Import */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Product Import</h3>
          <p className="text-sm text-gray-600">
            Import your product data from NetSuite into Medusa.
          </p>
          
          <div className="space-y-2">
            <Button 
              variant="primary"
              onClick={() => { importProducts({}); }}
              isLoading={isImporting}
            >
              Import All Products from NetSuite
            </Button>
          </div>
        </div>

        {/* SuiteQL Test Query */}
        <Container>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">SuiteQL Test Query</h3>
          <p className="text-sm text-gray-600">
            Run a test SuiteQL query against NetSuite and view the response.
          </p>
          <Button
            variant="secondary"
            onClick={() => testSuiteQL()}
            isLoading={isTestingSuiteQL}
          >
            Run SuiteQL Test Query
          </Button>
          {suiteQLResult && (
            <Textarea 
              value={JSON.stringify(suiteQLResult, null, 2)}
              readOnly
            />
          )}
        </div>
        </Container>

        {/* Configuration Info */}
        <Container>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Configuration</h3>
          <p className="text-sm text-gray-600">
            NetSuite configuration is managed via environment variables:
          </p>
          <Textarea
            className="py-10"
            value={`NETSUITE_REALM
NETSUITE_CONSUMER_KEY
NETSUITE_CONSUMER_SECRET
NETSUITE_TOKEN_ID
NETSUITE_TOKEN_SECRET`}
            readOnly
          />
        </div>
        </Container>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "NetSuite",
})

export default NetSuitePage 