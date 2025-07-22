import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { clx, Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"

type AdminProductInventory = AdminProduct & {
  metadata?: {
    inventory?: Record<string, number>
  }
}

const ProductInventoryWidget = ({ 
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const { data: queryResult } = useQuery({
    queryFn: () => sdk.admin.product.retrieve(product.id, {
      fields: "metadata",
    }),
    queryKey: [["product", product.id]],
  })
  
  const inventory = (queryResult?.product as AdminProductInventory)?.metadata?.inventory || {}
  const hasInventory = Object.keys(inventory).length > 0

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Inventory</Heading>
        </div>
      </div>
      {hasInventory ? (
        Object.entries(inventory).map(([location, quantity], index) => (
          <div
            key={location}
            className={clx(
              `text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4`,
              index === Object.keys(inventory).length - 1 ? "" : "border-b"
            )}
          >
            <Text size="small" weight="plus" leading="compact">
              {location}
            </Text>

            <Text
              size="small"
              leading="compact"
              className="whitespace-pre-line text-pretty"
            >
              {quantity}
            </Text>
          </div>
        ))
      ) : (
        <div
          className={clx(
            `text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4`
          )}
        >
          <Text size="small" weight="plus" leading="compact">
            No inventory data
          </Text>

          <Text
            size="small"
            leading="compact"
            className="whitespace-pre-line text-pretty"
          >
            -
          </Text>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductInventoryWidget 