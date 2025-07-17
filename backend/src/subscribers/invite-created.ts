import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { inviteCustomerToCompanyWorkflow } from '../workflows/company/workflows/invite-customer-to-company'

export default async function userInviteHandler({
    event: { data },
    container,
  }: SubscriberArgs<any>) {
  console.log('invite-created subscriber TRIGGERED')
  console.log('Payload:', JSON.stringify(data, null, 2))
  try {
    const { email, companyId, customerDetails } = data
    console.log('Running inviteCustomerToCompanyWorkflow with:', { email, companyId, customerDetails })
    const { result } = await inviteCustomerToCompanyWorkflow(container).run({
      input: {
        email,
        companyId,
        customerDetails,
      },
    })
    console.log('Invite workflow result:', result)
  } catch (error) {
    console.error('Error running invite workflow:', error)
  }
}

export const config: SubscriberConfig = {
  event: ['invite.created', 'invite.resent']
}
