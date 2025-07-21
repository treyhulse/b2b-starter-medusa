import { type Request as MedusaRequest, type Response as MedusaResponse } from "express"
import { ModuleRegistrationName } from "@medusajs/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const q = (req.query.q as string)?.trim()
  if (!q) {
    return res.json({ products: [] })
  }
  let productModuleService
  try {
    productModuleService = req.scope.resolve(ModuleRegistrationName.PRODUCT)
  } catch (e) {
    return res.status(500).json({ message: "Product module not found" })
  }
  const [products] = await productModuleService.listAndCount(
    {
      $or: [
        { title: { $ilike: `%${q}%` } },
        { description: { $ilike: `%${q}%` } },
      ],
    },
    {
      select: ["id", "title", "thumbnail"],
      take: 10,
    }
  )
  res.json({ products })
} 