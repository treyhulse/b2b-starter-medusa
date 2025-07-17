"use server"

import { sdk } from "@/lib/config"
import { getAuthHeaders } from "@/lib/data/cookies"

export const inviteEmployee = async ({
  companyId,
  email,
  first_name,
  last_name,
}: {
  companyId: string
  email: string
  first_name?: string
  last_name?: string
}) => {
  const headers = {
    ...(await getAuthHeaders()),
    "Content-Type": "application/json",
  }

  const res: any = await sdk.client.fetch(
    `/store/companies/${companyId}/invite-employee`,
    {
      method: "POST",
      body: { email, first_name, last_name },
      headers,
      credentials: "include",
    }
  )

  if (res.error) {
    throw new Error(res.error || "Failed to send invite")
  }

  return res
} 