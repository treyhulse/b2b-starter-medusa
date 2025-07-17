"use client"

import Button from "@/modules/common/components/button"
import Input from "@/modules/common/components/input"
import { QueryCompany } from "@/types"
import { Container, Text, toast } from "@medusajs/ui"
import { useState } from "react"
import { inviteEmployee } from "@/lib/data/invites"

const InviteEmployeeCard = ({ company }: { company: QueryCompany }) => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleInvite = async () => {
    setLoading(true)
    try {
      await inviteEmployee({
        companyId: company.id,
        email,
        first_name: firstName,
        last_name: lastName,
      })
      toast.success("Invite sent!")
      setFirstName("")
      setLastName("")
      setEmail("")
    } catch (err: any) {
      toast.error(err.message || "Failed to send invite")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="p-0 overflow-hidden">
      <div className="grid small:grid-cols-4 grid-cols-2 gap-4 p-4 border-b border-neutral-200">
        <div className="flex flex-col gap-y-2">
          <Text className="font-medium text-neutral-950">Name</Text>
          <Input name="first_name" label="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-y-2 justify-end">
          <Input name="last_name" label="Last name" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
        <div className="flex flex-col col-span-2 gap-y-2">
          <Text className="font-medium text-neutral-950">Email</Text>
          <Input name="email" label="Enter an email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 bg-neutral-50 p-4">
        <Button variant="primary" onClick={handleInvite} isLoading={loading} disabled={loading}>
          Send Invite
        </Button>
      </div>
    </Container>
  )
}

export default InviteEmployeeCard
