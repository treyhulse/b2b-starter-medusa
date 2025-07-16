import {
    createWorkflow,
    WorkflowResponse,
  } from "@medusajs/framework/workflows-sdk"
  import { createBrandStep } from "../steps/create-brand"
  
  type CreateBrandWorkflowInput = {
    name: string
  }
  
  export const createBrandWorkflow = createWorkflow(
    "create-brand",
    (input: CreateBrandWorkflowInput) => {
      const brand = createBrandStep(input)
  
      return new WorkflowResponse(brand)
    }
  )