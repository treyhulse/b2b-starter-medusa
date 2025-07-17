import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { z } from "zod"
import { inviteCustomerToCompanyWorkflow } from "../../../../../workflows/company/workflows/invite-customer-to-company"

const InviteEmployeeBody = z.object({
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
})

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const parse = InviteEmployeeBody.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input", details: parse.error.errors })
  }
  const { email, first_name, last_name } = parse.data
  try {
    console.log("Triggering inviteCustomerToCompanyWorkflow", { email, companyId: id, customerDetails: { first_name, last_name } })
    const { result } = await inviteCustomerToCompanyWorkflow(req.scope).run({
      input: {
        email,
        companyId: id,
        customerDetails: { first_name, last_name },
      },
    })
    console.log("Workflow result", result)
    return res.status(200).json({ status: "invite_sent", result })
  } catch (err) {
    console.error("Error in invite-employee route:", err)
    return res.status(500).json({ error: "Failed to send invite", details: (err as Error)?.message || String(err) })
  }
} 