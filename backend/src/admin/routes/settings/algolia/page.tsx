import { Container, Heading, Button, toast } from "@medusajs/ui"
import { useMutation } from "@tanstack/react-query"
import { sdk } from "../../../lib/sdk"
import { defineRouteConfig } from "@medusajs/admin-sdk"

const AlgoliaPage = () => {
  const { mutate: syncData, isPending: isSyncing } = useMutation({
    mutationFn: () => 
      sdk.client.fetch("/admin/algolia/sync", {
        method: "POST",
      }),
    onSuccess: () => {
      toast.success("Successfully triggered data sync to Algolia") 
    },
    onError: (err) => {
      console.error(err)
      toast.error("Failed to sync data to Algolia") 
    },
  })

  const { mutate: testConnection, isPending: isTesting } = useMutation({
    mutationFn: () => 
      sdk.client.fetch("/admin/algolia/test", {
        method: "GET",
      }),
    onSuccess: (data: any) => {
      if (data.status === "connected") {
        toast.success("Algolia connection successful!") 
      } else {
        toast.error("Algolia connection failed") 
      }
    },
    onError: (err) => {
      console.error(err)
      toast.error("Failed to test Algolia connection") 
    },
  })

  const handleSync = () => {
    syncData()
  }

  const handleTestConnection = () => {
    testConnection()
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Algolia Sync</Heading>
      </div>
      <div className="px-6 py-8 space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Connection Test</h3>
          <p className="text-sm text-gray-600">
            Test your Algolia connection before syncing data.
          </p>
          <Button 
            variant="secondary"
            onClick={handleTestConnection}
            isLoading={isTesting}
          >
            Test Connection
          </Button>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Data Sync</h3>
          <p className="text-sm text-gray-600">
            Sync your product data to Algolia for search functionality.
          </p>
          <Button 
            variant="primary"
            onClick={handleSync}
            isLoading={isSyncing}
          >
            Sync Data to Algolia
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Algolia",
})

export default AlgoliaPage