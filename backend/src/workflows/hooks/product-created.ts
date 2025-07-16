import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { BRAND_MODULE } from "../../modules/brand"
import BrandModuleService from "../../modules/brand/service"
import { Modules } from "@medusajs/framework/utils"
import { LinkDefinition } from "@medusajs/framework/types"

createProductsWorkflow.hooks.productsCreated(
  (async ({ products, additional_data }, { container }) => {
    if (!additional_data?.brand_id) {
      return new StepResponse([], [])
    }

    const brandModuleService: BrandModuleService = container.resolve(
      BRAND_MODULE
    )
    // if the brand doesn't exist, an error is thrown.
    await brandModuleService.retrieveBrand(additional_data.brand_id as string)

    const link = container.resolve("link")
    const logger = container.resolve("logger")

    const links: LinkDefinition[] = []

    for (const product of products) {
    links.push({
        [Modules.PRODUCT]: {
        product_id: product.id,
        },
        [BRAND_MODULE]: {
        brand_id: additional_data.brand_id,
        },
    })
    }

    await link.create(links)

    logger.info("Linked brand to products")

    return new StepResponse(links, links)
    })
)