import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps } from "@medusajs/framework/types"
import { clx, Container, Heading, Text, Table, IconBadge } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import { InformationCircleSolid } from "@medusajs/icons"

type WorkflowExecution = {
  id: string
  workflow_id: string
  transaction_id: string
  execution: any
  context: any
  state: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  retention_time: number | null
}

type WorkflowExecutionsResponse = {
  workflow_executions: WorkflowExecution[]
  count: number
}

const WorkflowExecutionsTableWidget = () => {
  const { data: queryResult, isLoading } = useQuery<WorkflowExecutionsResponse>({
    queryFn: () => sdk.client.fetch("/admin/workflow-executions", {
      method: "GET",
    }),
    queryKey: [["workflowExecutions"]],
  })

  const executions = queryResult?.workflow_executions || []

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Workflow Executions</Heading>
          <Text size="small" className="text-ui-fg-subtle" leading="compact">View and keep track of workflow executions in your Medusa application.</Text>
        </div>
      </div>
      
      {isLoading ? (
        <div className="px-6 py-4">
          <Text>Loading workflow executions...</Text>
        </div>
      ) : executions.length > 0 ? (
        <div className="px-6 py-4">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Workflow ID</Table.HeaderCell>
                <Table.HeaderCell>Created At</Table.HeaderCell>
                <Table.HeaderCell>Retention Time</Table.HeaderCell>
                <Table.HeaderCell>State</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {executions.map((execution: WorkflowExecution) => (
                <Table.Row key={execution.id}>
                  <Table.Cell>
                    <Text size="small" leading="compact">
                      {execution.workflow_id}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small" leading="compact">
                      {new Date(execution.created_at).toLocaleString()}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small" leading="compact">
                      {execution.retention_time ?? "-"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small" leading="compact">
                      {execution.state}
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      ) : (
        <div className="px-6 py-4">
          <Text size="small" leading="compact" className="text-ui-fg-subtle text-center">
            <div className="flex items-center justify-center">
              <IconBadge className="text-center">
                <InformationCircleSolid />
              </IconBadge>
            </div>
            No records
            <br />
            No workflows have been executed, yet.
          </Text>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "workflow.list.before",
})

export default WorkflowExecutionsTableWidget 