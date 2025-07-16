import {
    MedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework/http"
  import { 
    createBrandWorkflow,
  } from "../../../workflows/brand/workflows/create-brand"
  
  import { z } from "zod"
  import { PostAdminCreateBrand } from "./validators"
  
  type PostAdminCreateBrandType = z.infer<typeof PostAdminCreateBrand>
  
  // create a brand
  export const POST = async (
    req: MedusaRequest<PostAdminCreateBrandType>,
    res: MedusaResponse
  ) => {
    const { result } = await createBrandWorkflow(req.scope)
      .run({
        input: req.validatedBody,
      })
  
    res.json({ brand: result })
  }

  // get all brands
  export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
  ) => {
    const query = req.scope.resolve("query")
    
    const { data: brands } = await query.graph({
      entity: "brand",
      fields: ["*", "products.*"],
    })
  
    res.json({ brands })
  }