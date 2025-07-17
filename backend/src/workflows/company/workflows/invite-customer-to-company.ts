import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { EmailTemplates } from "../../../modules/email-notifications/templates"
import { BACKEND_URL } from "../../../lib/constants"

export type InviteCustomerToCompanyInput = {
  email: string
  companyId: string
  customerDetails?: {
    first_name?: string
    last_name?: string
    // Add other customer fields as needed
  }
}

type FindOrCreateCustomerOutput = {
  customerId: string
  email: string
  employeeId: string
  inviteToken: string // For the invite link
}

type SendInviteEmailOutput = {
  invited: boolean
  email: string
}

type InviteCustomerToCompanyOutput = {
  invited: boolean
  email: string
  employeeId: string
  customerId: string
}

// Step 1: Find or create customer and add to company
const findOrCreateCustomerStep = createStep(
  "find-or-create-customer",
  async (input: InviteCustomerToCompanyInput, { container }) => {
    console.log('[Workflow] findOrCreateCustomerStep START', input)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const customerModuleService = container.resolve('customer')
    const companyModuleService = container.resolve('company')

    // 1. Try to find customer by email
    const { data: customers } = await query.graph({
      entity: "customer",
      filters: { email: input.email },
      fields: ["id", "email"]
    })
    let customerId: string
    if (customers.length > 0) {
      customerId = customers[0].id
    } else {
      // 2. Create customer if not found
      const created = await customerModuleService.createCustomers([
        {
          email: input.email,
          ...input.customerDetails,
        }
      ])
      if (!created || !created[0] || !created[0].id) {
        throw new Error('Failed to create customer')
      }
      customerId = created[0].id
    }

    // 3. Add as employee to company
    const employee = await companyModuleService.createEmployees({
      customer_id: customerId,
      company_id: input.companyId,
      spending_limit: 0,
      is_admin: false,
    })

    // 4. Generate invite token (mock for now, should be replaced with real invite logic)
    const inviteToken = `mock-token-for-${customerId}`

    const result = {
      customerId,
      email: input.email,
      employeeId: employee.id,
      inviteToken,
    }
    console.log('[Workflow] findOrCreateCustomerStep RESULT', result)
    return new StepResponse<FindOrCreateCustomerOutput>(result)
  }
)

// Step 2: Send invite email
const sendInviteEmailStep = createStep(
  "send-invite-email",
  async (input: FindOrCreateCustomerOutput, { container }) => {
    console.log('[Workflow] sendInviteEmailStep START', input)
    const notificationModuleService = container.resolve('notification')
    // Compose invite link
    const inviteLink = `${BACKEND_URL}/app/invite?token=${input.inviteToken}`
    await notificationModuleService.createNotifications({
      to: input.email,
      channel: "email",
      template: EmailTemplates.INVITE_USER,
      data: {
        emailOptions: {
          replyTo: "info@example.com",
          subject: "You've been invited to Medusa!",
        },
        inviteLink,
        preview: "The administration dashboard awaits...",
      },
    })
    const result = { invited: true, email: input.email }
    console.log('[Workflow] sendInviteEmailStep RESULT', result)
    return new StepResponse<SendInviteEmailOutput>(result)
  }
)

export const inviteCustomerToCompanyWorkflow = createWorkflow(
  {
    name: "invite-customer-to-company",
    store: true,
    retentionTime: 86400,
  },
  function (input: InviteCustomerToCompanyInput) {
    console.log('[Workflow] inviteCustomerToCompanyWorkflow START', input)
    const customer = findOrCreateCustomerStep(input)
    const invite = sendInviteEmailStep(customer)
    const result = {
      invited: invite.invited,
      email: invite.email,
      employeeId: customer.employeeId,
      customerId: customer.customerId,
    }
    console.log('[Workflow] inviteCustomerToCompanyWorkflow RESULT', result)
    return new WorkflowResponse<InviteCustomerToCompanyOutput>(result)
  }
)
